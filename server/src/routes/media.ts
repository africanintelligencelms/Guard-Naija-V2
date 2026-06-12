import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// 5MB cap — clients must compress before upload (see offline-first-data skill)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function bucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
    bucketName: "media",
  });
}

router.post("/", upload.single("file"), async (req: AuthedRequest, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });
    const ok =
      file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/");
    if (!ok) {
      return res
        .status(400)
        .json({ error: "Only image and audio files are allowed" });
    }
    const stream = bucket().openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { uploader: req.user!._id.toString(), uploadedAt: Date.now() },
    });
    stream.end(file.buffer, () => {
      res.status(201).json({ id: stream.id.toString() });
    });
    stream.on("error", next);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket().find({ _id: id }).toArray();
    if (!files.length) return res.status(404).json({ error: "File not found" });
    res.setHeader("Content-Type", files[0].contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=86400");
    bucket().openDownloadStream(id).on("error", next).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
