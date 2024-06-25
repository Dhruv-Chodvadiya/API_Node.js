const User = require("../Models/User");
const Role = require("../Models/Role");

exports.check = (requirePermission) => {
    return async(req,res,next) => {
        try {
            const findUser = await User.findOne({ email: req.tokenData.email});

            const findRole = await Role.findOne({_id: findUser.role});

            if (findRole.permissions.includes(requirePermission)) {
                next();
            }else{
                res.status(403).json({
                    message: "You do not have the necessary permissions"
                })
            }
        } catch (error) {
            res.status(500).json({
                message: "Server error",
                message: error.message
            });
        }
    }
}