import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction,
    mongoURI: isProduction
        ? (process.env.MONGO_URI_PRO || process.env.MONGO_URI)
        : (process.env.MONGO_URI_DEV || process.env.MONGO_URI),
    port: process.env.PORT || 9997,
    jwtSecret: process.env.JWT_SECRET || "default_jwt_secret",
    r2AccountID: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2PublicUrl: process.env.R2_PUBLIC_URL,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
};