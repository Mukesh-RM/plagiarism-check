import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { generatePdfBuffer } from "../services/reportService.js";

export const reportRouter = Router();

const reportSchema = z.object({
  originalScore: z.number().min(0).max(100),
  finalScore: z.number().min(0).max(100),
  improvement: z.number().min(0).max(100),
  highlighted: z.array(z.object({ sentence: z.string(), aiProbability: z.number() }))
});

reportRouter.post("/pdf", requireAuth, async (req, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const buffer = await generatePdfBuffer(parsed.data);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=ai-report.pdf");
  return res.send(buffer);
});
