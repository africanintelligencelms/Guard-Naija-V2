import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["citizen", "agency", "admin"], required: true },
  displayName: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  agencyName: { type: String, trim: true },
  agencyLocation: { type: String, trim: true },
  agencyType: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Number, default: () => Date.now() },
  lastLogin: { type: Number },
});

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

/** Shape the client expects (mirrors the old Firestore UserProfile). */
export function toProfile(user: UserDoc) {
  return {
    uid: user._id.toString(),
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    agencyName: user.agencyName,
    agencyLocation: user.agencyLocation,
    agencyType: user.agencyType,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

export const User = mongoose.model("User", userSchema);
