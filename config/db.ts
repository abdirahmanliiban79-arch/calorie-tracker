import mongoose from "mongoose";
import { env } from "./env.js";


const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = env.mongoURI;
        if (!mongoURI) {
            throw new Error("Please provide MongoDB URI in the .env file");
        }
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;