import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Check if Cloudinary is configured ────────────────────────────
function isCloudinaryConfigured() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== "your_api_secret"
  );
}

// ── File filter (shared) ─────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

// ── Local disk storage (fallback when Cloudinary is not configured) ──
const uploadsDir = path.resolve(__dirname, "../../../uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const name = `avatar-${req.user?._id || "unknown"}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

// ── Build the appropriate multer instance ────────────────────────
let upload;

if (isCloudinaryConfigured()) {
  // Use Cloudinary storage
  const { v2: cloudinary } = await import("cloudinary");
  const { CloudinaryStorage } = await import("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "smartitlab/avatars",
      allowed_formats: ["jpeg", "jpg", "png", "webp"],
      transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
    },
  });

  upload = multer({ storage: cloudStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
  console.log("📸 Avatar uploads: Cloudinary");
} else {
  // Fallback: local disk storage
  upload = multer({ storage: localStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
  console.log("📸 Avatar uploads: local disk (uploads/avatars/)");
}

// ── Middleware export ─────────────────────────────────────────────
export const uploadAvatar = (req, res, next) => {
  upload.single("avatar")(req, res, next);
};
