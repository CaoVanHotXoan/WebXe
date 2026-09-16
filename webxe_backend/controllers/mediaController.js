import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageFromUrl(req, res, next) {
  try {
    const imageUrl = String(req.body?.url || '').trim();
    if (!imageUrl) return res.status(400).json({ message: 'URL hình ảnh là bắt buộc.' });

    const result = await uploadImageUrl(imageUrl);
    return res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return next(error);
  }
}

export async function uploadImageUrl(imageUrl) {
  let parsedUrl;
  try {
    parsedUrl = new URL(String(imageUrl).trim());
  } catch {
    throw new Error('URL hình ảnh không hợp lệ.');
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Chỉ hỗ trợ URL http hoặc https.');
  }

  return cloudinary.uploader.upload(parsedUrl.toString(), {
    folder: 'webxe',
    resource_type: 'image',
    type: 'upload',
  });
}

export function getCloudinaryPublicId(imageUrl) {
  try {
    const parsedUrl = new URL(imageUrl);
    if (parsedUrl.hostname !== 'res.cloudinary.com') return null;

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const publicIdParts = pathParts.slice(uploadIndex + 1);
    while (publicIdParts.length && (/^v\d+$/.test(publicIdParts[0]) || publicIdParts[0].includes(','))) {
      publicIdParts.shift();
    }
    if (!publicIdParts.length) return null;

    const lastPart = publicIdParts.length - 1;
    publicIdParts[lastPart] = publicIdParts[lastPart].replace(/\.[^/.]+$/, '');
    return publicIdParts.join('/');
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(imageUrl) {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId) return { skipped: true };

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    type: 'upload',
    invalidate: true,
  });
}