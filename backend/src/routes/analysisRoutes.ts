import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { analyzeText } from "../services/detectionService.js";
import { humanizeWithLoop } from "../services/humanizerService.js";
import { detectPlagiarism } from "../services/plagiarismService.js";
import { enforceUsageLimits } from "../services/subscriptionService.js";

export const analysisRouter = Router();
const textSchema = z.object({ text: z.string().min(10), tone: z.enum(["casual", "academic", "professional"]).optional() });

analysisRouter.post("/analyze", requireAuth, async (req: AuthRequest, res) => {
  const parsed = textSchema.pick({ text: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ message: "User missing" });

  enforceUsageLimits(user, parsed.data.text, "analyze");

  return res.json({
    ...analyzeText(parsed.data.text),
    plagiarism: detectPlagiarism(parsed.data.text)
  });
});

analysisRouter.post("/humanize", requireAuth, async (req: AuthRequest, res) => {
  const parsed = textSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ message: "User missing" });

  enforceUsageLimits(user, parsed.data.text, "humanize");

  const result = await humanizeWithLoop(parsed.data.text, parsed.data.tone);
  user.rewriteCountToday += 1;
  await user.save();

  return res.json(result);
});
