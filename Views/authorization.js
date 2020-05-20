const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SingUpForm = require("../Forms/singup");
const LoginForm = require("../Forms/login");
const PermissionForms = require("../Forms/permission");
const User = require("../Models/user");
const Permission = require("../Models/permissions");


// Login APIView
module.exports.login = async ( request, response ) => {
    const { success, errors } = LoginForm(request.body);
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });
    const userExists = await User.findOne( { email: request.body.email } );
    if (!userExists) return response.status( 404 ).send({
        sucess: false,
        status: 404,
        errors:[{ message: "User or password is wrong" }]
    });
    const validPassword = await bcrypt.compare( request.body.password, userExists.password );
    if ( !validPassword ) return response.status( 404 ).send({
        sucess: false,
        status: 404,
        errors:[{
            message: "Email or password is wrong",
        }]
    });
    const token = await jwt.sign({
            _id: userExists._id,
            permission: userExists.permissions,
            email: userExists.email,
            username: userExists.name
        },
        process.env.TOKEN_SECRET,
        {
            algorithm: process.env.TOKEN_ALGORITHM,
            expiresIn: "1d"
        });
    response.header("Authorization", "Bearer " + token);
    response.status( 200 ).send(
        {
            status: 200,
            success: true,
            data: {
                user: {
                    email: userExists.email,
                    username: userExists.name,
                    auth: {
                        token: token,
                        header: "Authorization",
                        bearer: true
                    }
                }
                
            }
        }
    );
}


// SingUp APIView
module.exports.singUp = async (request, response) => {
    
    const { success, errors } = SingUpForm(request.body);

    if ( !success ) return response.status( 400 ).send({ errors: errors, sucess: success});
    
    const userAlreadyExists = await User.findOne({ email: request.body.email });

    if (userAlreadyExists) return response.status( 403 ).send({
        status: 403,
        success: false,
        errors: [
            {
                message: "User \"" + request.body.email + "\" already exists",
                field: "email"
            }
        ]
    });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const user = new User({
            name: request.body.username,
            email: request.body.email,
            password: hashedPassword,
            permissions: []
        });

    try {
        const _saved_user = await user.save();
        response.status( 201 ).send({
            success: true,
            status: 201,
            data: {
                user: {
                    id: _saved_user._id,
                    username: _saved_user.name,
                    email: _saved_user.email,
                    last_login: _saved_user.date
                }
            }
        });
        console.log("User " + user.name + " succesfully created");
    } catch ( err ) {
        // toDo: Filter Mongo errors. 
        response.status( 400 ).send({
            status: 400,
            success: false,
            errors: err
        });
        console.log( err );
    }
}


// Verify Token APIView
module.exports.verifyJWToken = ( request, response ) => {
    response.status( 200 ).send({
        status: 200,
        data: { mesage: "Token is valid" },
        success: true
    })};


// User Info APIView
module.exports.userInfo = async ( request, response ) => {
    response.header("Authentication", "Bearer " + request.user.token);
    return response.status( 200 ).send({
        status: 200,
        success: true,
        data: request.user
    });
}


// Get User permission APIView
module.exports.userPermissions = async ( request, response ) => {
    const _u = await User.findOne({ email: request.params.user_id }, ( selectionErr ) => {
        if ( selectionErr ) {
            return response.status( 404 ).send({
                success: false,
                errors: selectionErr,
                status: 400
            })
        }
    }); 
    response.status( 200 ).send(
        {
            success: true,
            status: 200,
            data: {
                user: {
                    id: _u.id,
                    email: _u.email,
                    permissions: _u.permissions
                }
            }
        }
    );
};


// Grant Permission APIView
module.exports.grantPermission = async ( request, response ) => {
    const { success, errors } = PermissionForms.GrantRevokePermission( request.params );
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });

    var _usr = await User.findOne({ email: request.params.user_id }, ( err ) => {
        if ( err ) return response.status( 404 ).send({
            status: 404,
            success: false, 
            errors:[{ message: "User #ID:" + request.params.user_id + " not found." }]
        });
    });
    const _perm = await Permission.findOne({ _id: request.params.permission_id }, ( err ) => {
        if ( err ) return response.status( 404 ).send({
            status: 404,
            success: false, 
            errors:[{message: "Permission #ID:" + request.params.permission_id + " not found."}]
        });
    });

    let _perm_as_claim = _perm.namespace + ":" + _perm.action;
    if ( !_usr.permissions.includes( _perm_as_claim ) ) {
        try {
        _usr.permissions.push(_perm_as_claim);
        await _usr.save();
        } catch {
            return response.status( 400 ).send({
                success: false,
                status: 400,
                errors: [{ message: err }]
            });
        };        
    };
    return response.status( 200 ).send({
        success: true,
        status: 200,
        data: {
            user: {
                id: _usr._id,
                email: _usr.email,
                permissions: _usr.permissions
            },
            gratedPermission: {
                claim: _perm_as_claim,
                permission_id: _perm._id,
                namespace: _perm.namespace,
                action: _perm.action
            }
        }
    });
};


// Revoke Permission APIView
module.exports.revokePermission = async ( request, response ) => {

    const { success, errors } = PermissionForms.GrantRevokePermission( request.params );
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });
    var _usr = await User.findOne({ email: request.params.user_id }, ( err ) => {
        if ( err ) return response.status( 404 ).send({
            status: 404,
            success: false, 
            errors:[{ message: "User #ID:" + request.params.user_id + " not found." }]
        });
    });
    const _perm = await Permission.findOne({ _id: request.params.permission_id }, ( err ) => {
        if ( err ) return response.status( 404 ).send({
            status: 404,
            success: false, 
            errors:[{message: "Permission #ID:" + request.params.permission_id + " not found."}]
        });
    });
    let _perm_as_claim = _perm.namespace + ":" + _perm.action;
    if (_usr.permissions.includes( _perm_as_claim)) {
        try {
            _usr.permissions.pop( _perm_as_claim );
            await _usr.save();
        } catch {
            return response.status( 400 ).send();
        };
        return response.status( 200 ).send({
            data: {
                user: {
                    id: _usr._id,
                    email: _usr.email,
                    permissions: _usr.permissions
                },
                revokedPermission: {
                    claim: _perm_as_claim},
                    permission_id: _perm._id,
                    namespace: _perm.namespace,
                    action: _perm.action
            }
        });
    }
    
    return response.status( 400 ).send({
        status: 400,
        errors: [
            {
                message: "User <ID:" + _usr.id + "> " +
                         "has not permission <ID:" + _perm_as_claim + ">"
            }]
    });
} 