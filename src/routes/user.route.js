import express from "express";

import { protect } from "../middlewar/auth.middlewar.js";
import { authorize } from "../middlewar/authorize.middlewar.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.post(
  "/admin-operation",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin operation allowed"
    });
  }
);

export default router;