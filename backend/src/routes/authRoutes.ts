import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const authSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ email: parsed.data.email, passwordHash });

  const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
  return res.status(201).json({ token, user: { email: user.email, tier: user.subscriptionTier } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
  return res.json({ token, user: { email: user.email, tier: user.subscriptionTier } });
});
