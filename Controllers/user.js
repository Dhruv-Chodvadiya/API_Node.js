const { valid } = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../Models/User");
const Role = require("../Models/Role");
const task = require("../Models/Task");
const joi = require("../Validation/joi");
const mailer = require("../helpers/mailer");
const { default: mongoose, get } = require("mongoose");

async function createEmployee(req, res) {
  try {
    const { error, value } = joi.verifyUserSchema.validate(req.body);

    if (error) {
      return res.json({
        message: error.message,
      });
    }
    const { name, email, password, role } = value;

    const beforePassword = password;

    const validRole = await Role.findById(role);

    if (!validRole) {
      return res.status(404).json({
        message: "Role not Find",
      });
    }

    const validEmail = await User.findOne({ email: email });

    if (validEmail) {
      return res.status(409).json({
        message: "Email is Already use",
      });
    }

    req.body.password = await bcrypt.hash(password, 10);

    await User.create(req.body);

    const msg = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #333;">Hi ${name},</h1>
            <p style="color: #666;">You have been added as a ${validRole.roleName}.</p>
            <p style="color: #666;">Your login credentials are:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Password:</strong> ${beforePassword}</li>
            </ul>
            <p style="color: #666;">Please change your password after logging in.</p>
            <p style="color: #666;">Best regards,<br>Company</p>
        </div>
    </div>
    `;

    mailer.sendMail(email, "Welcome to the Company", msg);

    res.status(200).json({
      message: "User Create successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function logIn(req, res) {
  try {
    const { email, password } = req.body;

    const userFind = await User.findOne({ email: email });

    if (!userFind) {
      return res.status(400).json({
        message: "InValide Email and Password",
      });
    }

    const match = await bcrypt.compare(password, userFind.password);

    if (match) {
      var token = jwt.sign(
        {
          id: userFind._id,
          email: userFind.email,
        },
        process.env.SECRET_KEY
      );
    }

    res.header("Authorization", `${token}`);

    return res.status(200).json({
      message: "Log In successfully",
      //token: token,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    let getUserData;

    const tokenDetails = await User.findById(req.tokenData.id);

    const tokenRole = await Role.findById(tokenDetails.role);

    if (tokenRole.roleName === 'superadmin') {
      getUserData = await User.find({}, { _id: 0, __v: 0, password: 0 }).populate("role", "-_id -permissions -__v");
    } else if (tokenRole.roleName === 'Admin') {
      const getAllUser = await User.find({}, { _id: 0, __v: 0, password: 0 }).populate("role", "-_id -permissions -__v");
      getUserData = getAllUser.filter(user => user.role.roleName === 'Employee');
    }

    //console.log(tokenRole.roleName);



    res.status(200).json({
      getUserData,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { error, value } = joi.verifyUpdateUser.validate(req.body);

    if (error) {
      return res.json({
        message: error.message,
      });
    }

    const reqId = req.params.id;

    const userId = await User.findById(reqId);

    if (!userId) {
      return req.status(404).json({
        message: "ID not Found",
      });
    }

    const { name, email, password, role } = req.body;

    if (password) {
      const match = await bcrypt.compare(password, userId.password);
      if (match) {
        return req.status(404).json({
          message: "Your Password sem as Old Password",
        });
      }
    }

    const reqPassword = req.body.password;

    let newMail;


    if (email) {
      newMail = email
    } else {
      newMail = userId.email;
    }

    let roleName;

    if (role) {
      const roleDtails = await Role.findById(role);
      if (!roleDtails) {
        return res.status(404).json({
          message: "Role Not Found",
        });
      }
      roleName = roleDtails.roleName;
    }

    const updateObj = {};

    if (req.body.name) {
      updateObj.name = req.body.name;
    }
    if (req.body.email) {
      updateObj.email = req.body.email;
    }
    if (req.body.password) {
      const password = req.body.password;
      req.body.password = await bcrypt.hash(password, 10);
      updateObj.password = req.body.password;
    }
    if (req.body.role) {
      updateObj.role = req.body.role;
    }

    await User.findByIdAndUpdate({ _id: reqId }, updateObj);

    let updateStr = "";
    for (const key in updateObj) {
      if (key === "role") {
        updateStr += `<p>Role: ${roleName}</p>`;
      } else if (key === "password") {
        updateStr += `<p>New Password: ${reqPassword}</p>`;
      } else {
        updateStr += `<p>${key}: ${updateObj[key]}</p>`;
      }
    }

    const msg = `<p>Hi ${userId.name},</p>
    <p>Your details have been updated as follows:</p>
    ${updateStr}
    <p>Best regards,<br>Company</p>`;

    mailer.sendMail(newMail, "Your Details Have Been Updated", msg);

    res.status(200).json({
      message: "Update successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const reqID = req.params.id;
    const userID = await User.findById({ _id: reqID });

    if (!userID) {
      return res.status(404).json({
        message: "Check your User ID",
      });
    }

    await User.findByIdAndDelete(reqID);

    res.status(200).json({
      message: "Delete User successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

module.exports = { logIn, createEmployee, getAll, updateUser, deleteUser };
