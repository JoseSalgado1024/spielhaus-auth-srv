const jwt = require("jsonwebtoken");

module.exports = function ( request, response, next ) {
    const token = request.header("Authorization");
    if (!token) return response.status( 401 ).send({
        success: false,
        status: 401,
        errors: [{message: "Unauthorized. JWT not found"}],
    });

    const  [ prefix , _token ] = token.split(" ");
    if (!prefix || prefix != "Bearer") return response.status(401).send({
        success: false,
        status: 401,
        errors: [{ message: "Unauthorized. Should start with Bearer" }],
    });

    if(!_token) return response.status( 401 ).send({
        success: false,
        status: 401,
        errors: [{ message: "Unauthorized. JWT not found." }]
    });

    try {
        const verifiedUser = jwt.verify(_token, process.env.TOKEN_SECRET);
        request.user = { 
            id: verifiedUser._id, 
            username: verifiedUser.name,
            permissions: verifiedUser.permission,
            email: verifiedUser.email,
            info: verifiedUser, 
            token: _token };
        
        next();

    } catch ( err ) {
        response.status( 401 ).send({
            success: false, 
            status: 400,
            errors: [ { message: "Invalid token. " + err } ]
        })
    }
}
