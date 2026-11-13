import express from "express";

import {
  register,
  login,
  logout,
  refresh
} from "../controller/auth.controller.js";

import { protect } from "../middlewar/auth.middlewar.js"
import { validate } from "../middlewar/validate.middlewar.js";

import {
  registerSchema,
  loginSchema
} from "../validater/auth.validater.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;