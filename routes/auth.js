const router = require("express").Router();

const verifyJWTmiddleware = require("../middleware/authorizationJWT");
const authViews = require("../Views/authorization");
const User = require("../models/user");

// http://localhost:3000/api/users/jose.salgado.wrk@gmail.com/5ec497de3e9a8b4a449dd2b9/
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