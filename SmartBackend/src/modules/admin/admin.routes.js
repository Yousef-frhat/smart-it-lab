import express from "express";
import { getStats, getServers, getActivity } from "./controllers/admin.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

router.get("/stats", getStats);
router.get("/servers", getServers);
router.get("/activity", getActivity);

export default router;
