const JWT = require("jsonwebtoken");
const User = require("../Models/User");
const Role = require("../Models/Role");

const jwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decode = JWT.verify(token, process.env.SECRET_KEY);
    req.tokenData = decode;
    next();
  } catch (error) {
    //console.log(error);
    res.status(500).send({
      message: "please set JWT",
      error,
    });
  }
};

async function authorize(req, res, next) {
  try {
    const superAdmin = await User.findOne({ email: "superadmin@example.com" });

    const tokenID = req.tokenData.id;
    const superAdminId = superAdmin._id.toString();

    if (tokenID != superAdminId) {
      return res.status(400).json({
        message: "you are not Super Admin",
      });
    }
    next();
  } catch (error) {
    res.status(500).send({
      message: "set Token",
      error,
    });
  }
}

async function permission(req, res, next) {
  try {

    const findUser = await User.findOne({ email: req.tokenData.email });
    
    const findRole = await Role.findOne({ _id: findUser.role });

    const allow = findRole.permissions.includes("read_user")

    //console.log(allow);

    if(allow) {
      next();
    } else {
      res.status(404).json({
        message: "You cant Access"
      });
    }

  } catch (error) {
    res.status(500).send({
      message: "set Token",
      error,
    });
  }
}

async function check(pera) {
  console.log(pera);
  return async (req, res, next) => {
    next();
  }
}

module.exports = { jwtAuth, authorize, permission, check };