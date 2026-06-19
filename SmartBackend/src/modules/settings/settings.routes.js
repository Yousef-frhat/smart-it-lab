import express from "express";
import {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  deleteAccount,
  uploadAvatarHandler,
} from "./controllers/settings.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import {
  updateSettingsSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./settings.validation.js";
import { uploadAvatar } from "../../common/middleware/upload.js";
import { uploadLimiter } from "../../common/middleware/rate-limiter.js";

const router = express.Router();

// All settings routes require authentication
router.use(authenticate);

router.get("/", getSettings);
router.patch("/", validate(updateSettingsSchema), updateSettings);
router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.patch("/password", validate(changePasswordSchema), changePassword);
router.patch("/avatar", uploadLimiter, uploadAvatar, uploadAvatarHandler);
router.delete("/account", deleteAccount);

export default router;
