const PermissionForms = require("../Forms/permission");
const Permission = require("../models/permissions");


function serializePermission( _perm ){
    return { 
        namespace: _perm.namespace,
        description: _perm.description,
        action: _perm.action,
        permission: _perm.namespace + ":" + _perm.action,
        id: _perm._id,
        created_at: _perm.created_at
    }
}

module.exports.getPermission = async ( request, response ) => {
    
    const perms = await Permission.find();
    response.status( 200 ).send({
        success: true, 
        data: Array.from(perms, p => serializePermission(p)),
        status: 200
    });

};

module.exports.createPermission = async ( request, response ) => {
    
    const { success, errors } = PermissionForms.createPermission(request.body);
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });

    const permAlreadyExists = await Permission.findOne({ 
            namespace: request.body.namespace,
            action: request.body.action
        });

    if (permAlreadyExists) {
        return response.status( 403 ).send({
                status: 403,
                success: false,
                errors: [{ message: "Permission already exists" }]
            });
    };

    const perm = new Permission({
        namespace: request.body.namespace,
        action: request.body.action,
        description: request.body.description? request.body.description: ""
    });

    try {
        const _saved_perm = await perm.save();
        return response.status( 201 ).send({
            status: 201,
            success: true,
            data: serializePermission(_saved_perm),
        });
    } catch ( err ) {
        return response.status( 500 ).send(
            {
                status: 500,
                success: false,
                errors: [{ message: "Internal server error" }]
            }
        );
    };
};

module.exports.deletePermission = async ( request, response ) => {
    
    const { success, errors } = PermissionForms.SelectPermission( request.body );
    if (!success) return response.status( 400 ).send({
        sucess: false, 
        status: 400,
        errors: errors
    });

    const d = await Permission.deleteOne({ 
            _id: request.body.id
        }, ( deleteError ) => {
            if (deleteError){
                return response.status( 400 ).send({
                    success: false,
                    status: 400,
                    errors: deleteError
                })};
            return response.status( 200 ).send({
                sucess: true,
                status: 200,
                data: null
            })
        });
};