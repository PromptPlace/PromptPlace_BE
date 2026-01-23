import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const getPresignedUrl = async (fileName: string, contentType: string) => {
  const fileExtension = fileName.split('.').pop();
  const key = `uploads/${uuidv4()}_${fileExtension}`;

	const s3 = new S3Client({
		region: process.env.S3_REGION,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
		},
	});

	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: key,
		ContentType: contentType,
	});

	const url = await getSignedUrl(s3, command, { expiresIn: 1800 });
	return { url, key };
}