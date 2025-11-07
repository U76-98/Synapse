import express from "express";
import { predictProductivity } from "../services/mlClient.js";

const router = express.Router();

// POST route to trigger prediction
router.post("/predict", async (req, res) => {
  const result = await predictProductivity(req.body);
  result.ok 
    ? res.json(result.data) 
    : res.status(500).json({ error: result.error });
});

export default router;
