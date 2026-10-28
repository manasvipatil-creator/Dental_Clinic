const fs = require('fs');
const path = require('path');
let cloudinary = null;

try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  // Cloudinary module not loaded
}

/**
 * Checks whether Cloudinary credentials are fully configured.
 */
function isCloudinaryConfigured() {
  return Boolean(
    cloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Initializes Cloudinary with current environment credentials.
 */
function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) return null;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/**
 * Upload an image file or buffer to persistent storage.
 * 1. Cloudinary upload if credentials are provided in env (persisted on Cloudinary CDN).
 * 2. MongoDB Atlas persistent base64 data URI if Cloudinary is not configured yet (< 2MB).
 * 3. Local disk storage fallback (/uploads/...) for dev.
 *
 * @param {Object} file - Multer file object
 * @param {string} folder - subfolder name (e.g. 'doctors', 'services')
 * @returns {Promise<string>} Persistent image URL
 */
async function uploadToStorage(file, folder = 'doctors') {
  if (!file) return null;

  // 1. If Cloudinary credentials are set, upload directly to Cloudinary
  const cld = getCloudinaryClient();
  if (cld && file.path) {
    try {
      const result = await cld.uploader.upload(file.path, {
        folder: `smilecraft/${folder}`,
        resource_type: 'image',
      });
      // Clean up local temp file after cloud upload
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (_) {}
      }
      return result.secure_url;
    } catch (err) {
      console.error('⚠️ Cloudinary upload failed, falling back to database persistence:', err.message);
    }
  }

  // 2. Persistent storage fallback: If file <= 2MB, store as base64 data URI directly in MongoDB Atlas
  // This guarantees image data is never lost across server restarts or Render redeployments
  try {
    if (file.path && fs.existsSync(file.path) && file.size <= 2.5 * 1024 * 1024) {
      const mime = file.mimetype || 'image/jpeg';
      const fileData = fs.readFileSync(file.path);
      const base64 = fileData.toString('base64');
      return `data:${mime};base64,${base64}`;
    }
  } catch (err) {
    console.warn('⚠️ Base64 persistence fallback error:', err.message);
  }

  // 3. Fallback to local uploads URL
  return `/uploads/${file.filename}`;
}

module.exports = {
  uploadToStorage,
  isCloudinaryConfigured,
};

