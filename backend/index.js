import express from "express";

import router from "./routes/useRoutes.js";



const app = express();


app.use(express.json());

// main route
app.use("/api", router);

// start server
app.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});
