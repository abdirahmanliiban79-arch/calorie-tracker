import mongoose from "mongoose";


const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.NODE_ENV === "production" ? process.env.MONGO_URI_PRO : process.env.MONGO_URI_DEV;

        if (!mongoURI) {
            throw new Error("Please provide MongoDB URI in the .env file");
        }
        await mongoose.connect(mongoURI!);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;