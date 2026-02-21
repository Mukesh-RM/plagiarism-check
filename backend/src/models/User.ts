import mongoose, { Schema } from "mongoose";

export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface IUser {
  email: string;
  passwordHash: string;
  subscriptionTier: SubscriptionTier;
  rewriteCountToday: number;
  rewriteCountDate: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    subscriptionTier: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    rewriteCountToday: { type: Number, default: 0 },
    rewriteCountDate: { type: String, default: () => new Date().toISOString().slice(0, 10) }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
