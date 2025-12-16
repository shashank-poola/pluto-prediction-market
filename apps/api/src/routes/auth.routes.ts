import { Router } from "express";
import { privyAuthHandler } from "../controller/auth.controller.js";

const router = Router();

router.post("/auth/privy", privyAuthHandler);

export { router };