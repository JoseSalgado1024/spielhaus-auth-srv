const Joi = require("@hapi/joi");

const createPermissionSchema = Joi.object({
    
    namespace: Joi.string().min(4).max(50).required(),
    action: Joi.string().min(4).required(),
    description: Joi.string().min(1).max(256).default(""),

});

const selectPermissionSchema = Joi.object({

    id: Joi.string().alphanum().min(5).max(120).required()

});

module.exports.createPermission = function ( data ) {

    const { error } = createPermissionSchema.validate( data );
    if ( error ) return { success: false, errors: error.details };
    return { success: true, errors: null };

};

module.exports.SelectPermission = function ( data ) {

    const { error } = selectPermissionSchema.validate( data );
    if ( error ) return {success: false, errors: error.details  };
    return { success: true, errors: null };

}