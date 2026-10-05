import "./config/env.js";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js"
import foodRoutes from "./routes/food.js"
import reportRoutes from "./routes/reports.js"


const app = express();

connectDB();


const PORT = process.env.PORT || 9997;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Calorie Tracker API",
    version: "1.0.0",
    status: "ok",
  });
});

app.use('/api/auth',authRoutes)
app.use('/api/food',foodRoutes)
app.use('/api/reports',reportRoutes)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
