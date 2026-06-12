import { Router } from "express";
import {
  Incident,
  toClientIncident,
  INCIDENT_TYPES,
  SEVERITIES,
  STATUSES,
} from "../models/Incident.js";
import { Log } from "../models/Log.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const { type, description, severity, isAnonymous, location, media, timestamp } =
      req.body || {};
    if (!INCIDENT_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid incident type" });
    }
    if (!SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: "Invalid severity" });
    }
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Valid location is required" });
    }

    const doc = await Incident.create({
      userId: req.user!._id.toString(),
      type,
      description: description.slice(0, 5000),
      severity,
      status: "Submitted", // clients cannot create pre-verified reports
      isAnonymous: !!isAnonymous,
      location: { lat, lng, address: location?.address },
      media: {
        image: typeof media?.image === "string" ? media.image : null,
        audio: typeof media?.audio === "string" ? media.audio : null,
      },
      timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
    });
    res.status(201).json(
      toClientIncident(doc, {
        id: req.user!._id.toString(),
        role: req.user!.role,
      })
    );
  } catch (err) {
    next(err);
  }
});

// Citizens get their own reports; agency/admin get the latest (bounded).
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const viewer = { id: req.user!._id.toString(), role: req.user!.role };
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const filter =
      viewer.role === "citizen" ? { userId: viewer.id } : {};
    const docs = await Incident.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(docs.map((d) => toClientIncident(d, viewer)));
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id/status",
  requireRole("agency", "admin"),
  async (req: AuthedRequest, res, next) => {
    try {
      const { status } = req.body || {};
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const doc = await Incident.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!doc) return res.status(404).json({ error: "Incident not found" });

      await Log.create({
        action: "Status Update",
        details: `Changed Incident #${doc._id.toString().slice(-6)} to "${status}"`,
        role: req.user!.role === "admin" ? "Admin" : "Agency",
        type: "edit",
      });

      res.json(
        toClientIncident(doc, {
          id: req.user!._id.toString(),
          role: req.user!.role,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;
