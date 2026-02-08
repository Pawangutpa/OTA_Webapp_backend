/**
 * Role Authorization Middleware
 * -----------------------------
 * Restricts access based on user role(s).
 *
 * Usage:
 *   router.use(roleMiddleware("admin"));
 *   router.use(roleMiddleware(["admin", "support"]));
 */

"use strict";

/**
 * @param {string|string[]} allowedRoles
 */
function roleMiddleware(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Auth middleware must run first
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
