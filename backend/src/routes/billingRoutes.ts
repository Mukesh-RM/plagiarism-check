import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();

billingRouter.post("/create-checkout-session", requireAuth, async (_req, res) => {
  return res.json({
    message: "Stripe checkout integration placeholder",
    plans: [
      { id: "pro", price: "$19/mo" },
      { id: "enterprise", price: "Contact sales" }
    ]
  });
});
