import mongoose, { Schema } from "mongoose";

const logSchema = new Schema({
  action: { type: String, required: true, maxlength: 200 },
  details: { type: String, maxlength: 1000 },
  role: { type: String, maxlength: 50 },
  type: {
    type: String,
    enum: ["view", "edit", "security", "system"],
    default: "system",
  },
  timestamp: { type: Number, default: () => Date.now(), index: true },
});

export const Log = mongoose.model("Log", logSchema);
