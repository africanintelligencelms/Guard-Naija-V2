import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSecurityNews } from "../lib/news.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    res.json(await getSecurityNews());
  } catch (err) {
    next(err);
  }
});

export default router;
