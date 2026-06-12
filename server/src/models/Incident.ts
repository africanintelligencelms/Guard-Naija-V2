import mongoose, { Schema, InferSchemaType } from "mongoose";

export const INCIDENT_TYPES = [
  "Kidnapping",
  "Banditry",
  "Civil Unrest",
  "Armed Robbery",
  "Police Harassment",
  "Suspicious Activity",
  "Other",
] as const;

export const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
export const STATUSES = ["Submitted", "Verified", "In Progress", "Resolved"] as const;

const incidentSchema = new Schema({
  userId: { type: String, index: true },
  type: { type: String, enum: INCIDENT_TYPES, required: true },
  description: { type: String, required: true, maxlength: 5000 },
  severity: { type: String, enum: SEVERITIES, required: true },
  status: { type: String, enum: STATUSES, default: "Submitted" },
  isAnonymous: { type: Boolean, default: false },
  location: {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, maxlength: 500 },
  },
  media: {
    image: { type: String, default: null }, // GridFS file id
    audio: { type: String, default: null },
  },
  timestamp: { type: Number, default: () => Date.now(), index: true },
});

export type IncidentDoc = InferSchemaType<typeof incidentSchema> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Serialize for a given viewer. Anonymous reports never reveal the reporter
 * to agencies; admins and the reporter themselves still see ownership.
 */
export function toClientIncident(
  doc: IncidentDoc,
  viewer: { id: string; role: string }
) {
  const isOwner = doc.userId === viewer.id;
  const hideReporter = doc.isAnonymous && !isOwner && viewer.role !== "admin";
  return {
    id: doc._id.toString(),
    userId: hideReporter ? undefined : doc.userId,
    type: doc.type,
    description: doc.description,
    severity: doc.severity,
    status: doc.status,
    isAnonymous: doc.isAnonymous,
    location: doc.location,
    media: doc.media,
    timestamp: doc.timestamp,
  };
}

export const Incident = mongoose.model("Incident", incidentSchema);
