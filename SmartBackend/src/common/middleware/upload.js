import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// ── Lazy Cloudinary init ────────────────────────────────────────
// cloudinary.config() is deferred to the first request so that
// process.env is guaranteed to be populated by dotenv.
let _configured = false;
function ensureCloudinary() {
  if (_configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  _configured = true;
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "smartitlab/avatars",
    allowed_formats: ["jpeg", "jpg", "png", "webp"],
    transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Middleware wrapper that ensures Cloudinary is configured before upload
export const uploadAvatar = (req, res, next) => {
  ensureCloudinary();
  upload.single("avatar")(req, res, next);
};
