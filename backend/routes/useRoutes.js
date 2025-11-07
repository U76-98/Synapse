import express from "express";
import { getEmployeeData } from "../controllers/useController.js";
import predictRouter from "./predictRoutes.js";

const router = express.Router();

// Route for getting employee data
router.get("/employees", getEmployeeData);

// Route for AI predictions (mounted under /api -> /api/predict)
router.use("/", predictRouter);

export default router;
