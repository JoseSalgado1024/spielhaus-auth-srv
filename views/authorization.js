const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validRegister = require("../validations/singup");
const validLogin = require("../validations/login");
const jwt = require("jsonwebtoken");


module.exports.login = async ( request, response ) => {
    
    const { success, errors } = validLogin(request.body);
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });
    
    const userExists = await User.findOne( { email: request.body.email } );
    // console.log(userExists.collation.email);
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

    const token = await jwt.sign(
        
        {
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

module.exports.singUp = async (request, response) => {
    
    const { success, errors } = validRegister(request.body);

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

module.exports.verifyJWToken = ( request, response ) => {
    response.status( 200 ).send({
        status: 200,
        data: { mesage: "Token is valid" },
        success: true
    })};

module.exports.userInfo = ( request, response ) => {
    response.header("Authentication", "Bearer " + request.user.token);
    return response.status( 200 ).send({
        status: 200,
        success: true,
        data: request.user
    });
}