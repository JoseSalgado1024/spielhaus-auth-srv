const router = require("express").Router();
const verifyJWTmiddleware = require("../middleware/authorizationJWT");
const authViews = require("../views/authorization");

// SingUp
router.post( "/singUp", authViews.singUp );
// Login
router.post( "/login", authViews.login );
// GetUserInfo
router.get( "/userInfo",  verifyJWTmiddleware, authViews.userInfo );
// VefifyJWT
router.get("/verifyToken", verifyJWTmiddleware, authViews.verifyJWToken );

module.exports = router;