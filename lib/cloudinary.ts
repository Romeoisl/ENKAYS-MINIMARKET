import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { logger } from "@/lib/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function assertConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
}

export async function uploadMedia(input: string | Buffer, folder = "enkays/products") {
  assertConfigured();
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const options = { folder, resource_type: "image" as const };
      if (Buffer.isBuffer(input)) {
        const stream = cloudinary.uploader.upload_stream(options, (error, response) => {
          if (error) reject(error);
          else resolve(response as UploadApiResponse);
        });
        stream.end(input);
      } else {
        cloudinary.uploader.upload(input, options).then(resolve).catch(reject);
      }
    });
    return { publicId: result.public_id, url: result.url, secureUrl: result.secure_url, width: result.width, height: result.height, format: result.format, bytes: result.bytes };
  } catch (error) {
    logger.error("Cloudinary upload failed", { error: error instanceof Error ? error.message : "unknown" });
    throw new Error("MEDIA_UPLOAD_FAILED");
  }
}

export async function deleteMedia(publicId: string) {
  assertConfigured();
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    logger.error("Cloudinary deletion failed", { publicId, error: error instanceof Error ? error.message : "unknown" });
    throw new Error("MEDIA_DELETE_FAILED");
  }
}

export async function getMediaMetadata(publicId: string) {
  assertConfigured();
  return cloudinary.api.resource(publicId, { resource_type: "image" });
}

export async function replaceMedia(oldPublicId: string, input: string | Buffer, folder = "enkays/products") {
  const uploaded = await uploadMedia(input, folder);
  await deleteMedia(oldPublicId);
  return uploaded;
}

export default cloudinary;
