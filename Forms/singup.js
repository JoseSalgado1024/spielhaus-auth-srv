const Joi = require("@hapi/joi");

// SingUp validator 
const validRegister = ( data ) => {
    const SingupValidationSchema = Joi.object({
        username: Joi.string()
                     .min(5)
                     .max(50)
                     .alphanum()
                     .required(),
        email: Joi.string()
                  .email()
                  .required(),
        password: Joi.string()
                     .min(10)
                     .max(1024)
                     .required()
    });
    
    const { error } = SingupValidationSchema.validate(data); 

    if ( error ) return { success: false, errors: error.details };
    
    return { success: true, errors: null };
}

module.exports = validRegister;