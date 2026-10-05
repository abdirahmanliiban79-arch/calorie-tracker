import { S3Client } from "@aws-sdk/client-s3";

let _client: S3Client | null = null

const getClient = (): S3Client => {
    if (!_client) {
        _client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            }
        })
    }
    return _client
}

export const r2Config = {
    get client() { return getClient() },
    get bucketName() { return process.env.R2_BUCKET_NAME as string },
    get publicUrl() { return process.env.R2_PUBLIC_URL as string },
}