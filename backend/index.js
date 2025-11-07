import express from "express";
import cors from "cors";
import router from "./routes/userRoutes.js";
import predictRouter from "./routes/predictRoutes.js";
import { loadEmployeeData } from "./controllers/userController.js";

const app = express();
const FRONTEND_URL = "http://localhost:3000";

// ✅ Proper CORS setup — no wildcard when using credentials
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// ✅ Force correct headers for every response
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Routes
app.use("/api", router);
app.use("/api", predictRouter);

// ✅ Root route
app.get("/", (req, res) => {
  res.send(`<h3>✅ Synapse Backend Running</h3><p>Try <a href="/api/employees">/api/employees</a></p>`);
});

// ✅ Start server
app.listen(3001, async () => {
  console.log("✅ Server running at http://localhost:3001");
  console.log("⏳ Pre-loading employee data...");
  try {
    await loadEmployeeData();
    console.log("✅ Employee data pre-loaded and cached!");
  } catch (error) {
    console.error("⚠️ Failed to load data:", error);
  }
});
