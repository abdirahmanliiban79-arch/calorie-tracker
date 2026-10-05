import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { getDailyReport , getMonthlyReport , getWeeklyReport } from "../controllers/reportController.js";


const router = Router();

router.get("/daily",protect, getDailyReport);
router.get("/weekly",protect, getWeeklyReport);
router.get("/monthly",protect, getMonthlyReport);

export default router;
