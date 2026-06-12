import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User, toProfile } from "../models/User.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "7d" });
}

// Public signup — citizens and agencies (matches the existing AuthScreen
// flows); admin accounts can only be created by an admin or the seed script.
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, role, ...extra } = req.body || {};
    if (!EMAIL_RE.test(email || "")) {
      return res.status(400).json({ error: "Invalid email address format." });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }
    if (!["citizen", "agency"].includes(role)) {
      return res.status(400).json({ error: "Invalid account type." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
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
      lastLogin: Date.now(),
    });
    res.status(201).json({
      token: signToken(user._id.toString()),
      profile: toProfile(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    const ok = user && (await bcrypt.compare(password || "", user.passwordHash));
    if (!ok) {
      return res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ error: "This account has been deactivated. Contact support." });
    }
    user.lastLogin = Date.now();
    await user.save();
    res.json({
      token: signToken(user._id.toString()),
      profile: toProfile(user),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ profile: toProfile(req.user!) });
});

export default router;
