import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
} from "./controllers/user.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { updateUserSchema } from "./user.validation.js";

const router = express.Router();

// All user-admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/suspend", suspendUser);

export default router;