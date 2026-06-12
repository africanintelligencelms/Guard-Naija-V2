import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, toProfile } from "../models/User.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/", async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(users.map((u) => toProfile(u)));
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const activeAgencies = await User.countDocuments({
      role: "agency",
      isActive: true,
    });
    const totalUsers = await User.countDocuments({});
    res.json({ activeAgencies, totalUsers });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { email, password, role, ...extra } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Email and a 6+ character password are required." });
    }
    if (!["citizen", "agency", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: "Email already in use." });
    }
    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      displayName: extra.displayName,
      phoneNumber: extra.phoneNumber,
      agencyName: extra.agencyName,
      agencyLocation: extra.agencyLocation,
      agencyType: extra.agencyType,
      isActive: extra.isActive ?? true,
    });
    res.status(201).json(toProfile(user));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const allowed = [
      "displayName",
      "phoneNumber",
      "role",
      "isActive",
      "agencyName",
      "agencyLocation",
      "agencyType",
    ] as const;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in (req.body || {})) update[key] = req.body[key];
    }
    if (typeof req.body?.password === "string" && req.body.password.length >= 6) {
      update.passwordHash = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toProfile(user));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    if (req.params.id === req.user!._id.toString()) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
