const Joi = require("@hapi/joi");


const loginSchema = Joi.object({
    
        email: Joi.string().email().min(5).max(50).required(),
        password: Joi.string().min(10).max(1024).required(),
    
    });


const LoginForm = ( data ) => {

    
    const { error } = loginSchema.validate( data );
    
    if ( error ) return { success: false, errors: error.details };
    
    return { success: true, errors: null };
};

module.exports = LoginForm;
