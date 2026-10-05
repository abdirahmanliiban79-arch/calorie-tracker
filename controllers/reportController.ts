
import type { Request, Response } from "express";
import User from "../models/User.js";
import { getDailySummary, getWeeklySummary, getMonthlySummary } from "../services/colories.js";

export const getDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const { date } = req.query;
        const targetDate = date && typeof date === "string" ? new Date(date) : new Date();

        // fetch user information
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // get daily summary service 
        const summary = await getDailySummary(user._id, targetDate);
        if (!summary) {
            res.status(500).json({ message: "Failed to fetch daily report" });
            return;
        }

        const remainingCalories = user.dailyColorieGoal - summary.totalCalories;
        const percentageGoal = user.dailyColorieGoal > 0
            ? Math.round((summary.totalCalories / user.dailyColorieGoal) * 100)
            : 0;

        res.json({
            success: true,
            date: targetDate.toISOString().split('T')[0],
            dailyCalorieGoal: user.dailyColorieGoal,
            totalCalories: summary.totalCalories,
            totalProtein: summary.totalProtein,
            totalCarbs: summary.totalCarbs,
            totalFat: summary.totalFat,
            totalEntries: summary.entries,
            remainingCalories: remainingCalories,
            percentageGoal: percentageGoal,
            mealBreakdown: summary.mealBreakdown,
            macros: summary.macros,
        });
    } catch (error) {
        console.error("daily report error", error);
        res.status(500).json({ message: "failed to fetch daily reports" });
    }
};

export const getWeeklyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const now = new Date();
        const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        const weekAgoStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6, 0, 0, 0, 0));

        // get weekly summary 
        const summary = await getWeeklySummary(user._id, weekAgoStart, todayEnd);
        if (!summary) {
            res.status(500).json({ message: "Failed to fetch weekly report" });
            return;
        }

        // build seven days
        const dailySummary: Array<{
            date: string;
            dayName: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            entriesCount: number;
            goal: number;
            percentComplete: number;
        }> = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekAgoStart);
            currentDate.setUTCDate(currentDate.getUTCDate() + i);

            const dayName = currentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                timeZone: 'UTC'
            });

            const dateStr = currentDate.toISOString().split('T')[0] as string;
            const dayData = summary.dailyData[dateStr] || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                count: 0
            };

            const goal = user.dailyColorieGoal || 2000;
            const percentComplete = goal > 0
                ? Math.round((dayData.calories / goal) * 100)
                : 0;

            dailySummary.push({
                date: dateStr,
                dayName,
                calories: dayData.calories,
                protein: dayData.protein,
                carbs: dayData.carbs,
                fat: dayData.fat,
                entriesCount: dayData.count,
                goal,
                percentComplete,
            });
        }

        res.json({
            success: true,
            startDate: (weekAgoStart.toISOString().split('T')[0] as string),
            endDate: (todayEnd.toISOString().split('T')[0] as string),
            dailySummary,
            totalCalories: summary.totalCalories,
            totalProtein: summary.totalProtein,
            totalCarbs: summary.totalCarbs,
            totalFat: summary.totalFat,
            totalEntries: summary.totalEntries,
            avgCalories: summary.avgCalories,
            macros: summary.macros,
            goal: user.dailyColorieGoal,
        });
    } catch (error) {
        console.error("Weekly report error:", error);
        res.status(500).json({ message: "Failed to fetch weekly report" });
    }
};

export const getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const now = new Date();
        const yearQuery = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
        const monthQuery = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;

        if (isNaN(yearQuery) || isNaN(monthQuery) || monthQuery < 1 || monthQuery > 12) {
            res.status(400).json({ message: "Invalid year or month parameter" });
            return;
        }

        const summary = await getMonthlySummary(user._id, yearQuery, monthQuery);
        if (!summary) {
            res.status(500).json({ message: "Failed to fetch monthly report" });
            return;
        }

        const daysInMonth = new Date(yearQuery, monthQuery, 0).getDate();
        const dailySummary: Array<{
            day: number;
            date: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            entriesCount: number;
            goal: number;
            percentComplete: number;
        }> = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = summary.dailyData[day] || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                count: 0
            };

            const formattedMonth = String(monthQuery).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateStr = `${yearQuery}-${formattedMonth}-${formattedDay}`;

            const goal = user.dailyColorieGoal || 2000;
            const percentComplete = goal > 0
                ? Math.round((dayData.calories / goal) * 100)
                : 0;

            dailySummary.push({
                day,
                date: dateStr,
                calories: dayData.calories,
                protein: dayData.protein,
                carbs: dayData.carbs,
                fat: dayData.fat,
                entriesCount: dayData.count,
                goal,
                percentComplete,
            });
        }

        res.json({
            success: true,
            year: yearQuery,
            month: monthQuery,
            daysInMonth,
            daysTracked: summary.daysTracked,
            dailySummary,
            dailyData: summary.dailyData,
            totalCalories: summary.totalCalories,
            totalProtein: summary.totalProtein,
            totalCarbs: summary.totalCarbs,
            totalFat: summary.totalFat,
            totalEntries: summary.totalEntries,
            avgCalories: summary.avgCalories,
            highestDay: summary.highestDay,
            macros: summary.macros,
            goal: user.dailyColorieGoal,
        });
    } catch (error) {
        console.error("Monthly report error:", error);
        res.status(500).json({ message: "Failed to fetch monthly report" });
    }
};  

