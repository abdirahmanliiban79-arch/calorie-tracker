import dotenv from "dotenv";
dotenv.config();


export const env = {
    mongoURI: process.env.NODE_ENV === "production" ? process.env.MONGO_URI_PRO : process.env.MONGO_URI_DEV,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    r2AccountID: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2PublicUrl: process.env.R2_PUBLIC_URL,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,

}