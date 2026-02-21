import { IUser } from "../models/User.js";

const limits = {
  free: { rewritesPerDay: 2, maxWords: 1000 },
  pro: { rewritesPerDay: Infinity, maxWords: 10000 },
  enterprise: { rewritesPerDay: Infinity, maxWords: 50000 }
};

export const enforceUsageLimits = (user: IUser, text: string, mode: "analyze" | "humanize") => {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tierLimit = limits[user.subscriptionTier];

  if (words > tierLimit.maxWords) {
    throw new Error(`Word limit exceeded for ${user.subscriptionTier} tier (${tierLimit.maxWords} words).`);
  }

  const today = new Date().toISOString().slice(0, 10);
  if (user.rewriteCountDate !== today) {
    user.rewriteCountDate = today;
    user.rewriteCountToday = 0;
  }

  if (mode === "humanize" && user.rewriteCountToday >= tierLimit.rewritesPerDay) {
    throw new Error(`Daily rewrite limit reached for ${user.subscriptionTier} tier.`);
  }
};
