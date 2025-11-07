import express from "express";
import { getEmployeeData } from "../controllers/useController.js";

const router = express.Router();

// route for getting employee data
router.get("/employee", getEmployeeData);

export default router;
