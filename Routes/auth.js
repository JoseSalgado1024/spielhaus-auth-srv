const router = require("express").Router();

const verifyJWTmiddleware = require("../Middleware/authorizationJWT");
const authViews = require("../Views/authorization");
const User = require("../Models/user");

// SingUp
router.post( "/singUp", authViews.singUp );
// Login
router.post( "/login", authViews.login );
// GetUserInfo
router.get( "/userInfo",  verifyJWTmiddleware, authViews.userInfo );
// VefifyJWT
router.get( "/verifyToken", verifyJWTmiddleware, authViews.verifyJWToken );
// User permission
router.get( "/:user_id/permissions", verifyJWTmiddleware, authViews.userPermissions );
// Grant permission
router.post( "/:user_id/permissions/:permission_id", verifyJWTmiddleware, authViews.grantPermission );
// Revoke permission
router.delete( "/:user_id/permissions/:permission_id/", verifyJWTmiddleware, authViews.revokePermission );


module.exports = router;