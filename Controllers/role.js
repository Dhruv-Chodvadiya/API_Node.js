const Role = require("../Models/Role");

const { default: mongoose } = require("mongoose");

async function getAll(req, res) {
    try {
        const getAllRole = await Role.find();

        res.status(200).json({
            getAllRole
        });
    } catch (error) {
        res.status(400).json({
            message: error,
          });
    }
}

async function addBulkRole(req, res) {
  try {

    let roles = req.body;

    if (!Array.isArray(req.body)) {
      roles = [roles];
    }

    const existingRoles = await Role.find({
      roleName: { $in: roles.map((role) => role.roleName) },
    });
    if (existingRoles.length > 0) {
      const existingRoleNames = existingRoles.map((role) => role.roleName);
      return res.status(400).json({
        error: `Roles already exist: ${existingRoleNames.join(", ")}`,
      });
    }

    const insertedRoles = await Role.insertMany(req.body);
    res.status(200).json({
      message: "Roles created successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
}

async function updateRole(req, res) {
  try {
    const reqID = req.params.id;
    const roleID = await Role.findById({ _id: reqID });

    if (!roleID) {
      return res.status(404).json({
        message: "Check your Role ID",
      });
    }
      const reqPermission = [...new Set(req.body.permissions)];

    const updateObj = {};

    if (req.body.roleName) {
      updateObj.roleName = req.body.roleName;
    }
    if (req.body.permissions && req.body.permissions.length > 0) {
        updateObj.$addToSet = { permissions: {$each: [...reqPermission]} };
    }

    const updateDetails = await Role.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(roleID) },
      updateObj
    );

    res.status(200).json({
      message: "Update successfully",
      //roleID,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function removePermissions(req, res) {
  try {
    const reqID = req.params.id;
    const roleID = await Role.findById({ _id: reqID });

    if (!roleID) {
      return res.status(404).json({
        message: "Check your Role ID",
      });
    }

    const exist = await req.body.permissions.every(pm => roleID.permissions.includes(pm));

    if (!exist) {
      return res.status(404).json({
        message: "permission is not Found"
      });
    }

    const updateDetails = await Role.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(roleID) },
      { $pull: { permissions: { $in: req.body.permissions } } }
    );
    res.status(200).json({
      message: "remove Permission successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function deleteRole(req, res) {
  try {
    const reqID = req.params.id;
    const roleID = await Role.findById({ _id: reqID });

    if (!roleID) {
      return res.status(404).json({
        message: "Check your Role ID",
      });
    }

    await Role.findByIdAndDelete(reqID);

    res.status(200).json({
      message: "Delete Role successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

module.exports = {
  addRole,
  addBulkRole,
  updateRole,
  removePermissions,
  deleteRole,
  getAll
};