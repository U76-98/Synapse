import { Router } from "express";
import { getUsers, getUserById } from "../controllers/userController.js";

const router = Router();

// Define routes
router.get("/employees", getUsers);
router.get("/employees/:id", getUserById);

export default router;
