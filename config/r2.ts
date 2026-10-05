import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

let _client: S3Client | null = null

const getClient = (): S3Client => {
    if (!_client) {
        _client = new S3Client({
            region: 'auto',
            endpoint: `https://${env.r2AccountID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: env.r2AccessKeyId as string,
                secretAccessKey: env.r2SecretAccessKey as string,
            }
        })
    }
    return _client
}

export const r2Config = {
    get client() { return getClient() },
    get bucketName() { return env.r2BucketName },
    get publicUrl() { return env.r2PublicUrl },
}