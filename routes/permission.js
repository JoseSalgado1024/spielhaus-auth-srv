const router = require("express").Router();

const verifyJWT = require("../middleware/authorizationJWT");
const permissionViews = require("../Views/permission");


// List permissions
router.get( "/", verifyJWT, permissionViews.getPermission );
// Delete Permission
router.post( "/delete", verifyJWT, permissionViews.deletePermission );
// Create Premission
router.post( "/create", verifyJWT, permissionViews.createPermission );

module.exports = router;