/**
 * Role-based access control guard.
 * Usage:  router.get("/admin-only", authenticate, authorize("admin"), handler)
 *         router.get("/multi",      authenticate, authorize("admin", "instructor"), handler)
 *
 * Must be used AFTER the `authenticate` middleware so that req.user is set.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};
