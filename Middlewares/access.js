const JWT = require("jsonwebtoken");
const User = require("../Models/User");
const Role = require("../Models/Role");

exports.check = (requirePermission) => {
    return async(req,res,next) => {
        try {
            //console.log(requirePermission);
            const findUser = await User.findOne({ email: req.tokenData.email});
            //console.log(findUser);
            const findRole = await Role.findOne({_id: findUser.role});
            //console.log(findRole);

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