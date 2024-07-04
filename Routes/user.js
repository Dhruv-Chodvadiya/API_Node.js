const express = require("express");
const user = require("../Controllers/user");
const role = require("../Controllers/role");
const task = require("../Controllers/task");
const Auth = require("../Middlewares/auth");
const access = require("../Middlewares/access");
const router = express.Router();

router.post("/logIn", user.logIn);

// Role 
router.get("/getAll", Auth.jwtAuth, Auth.authorize, role.getAll);

router.post("/addBulkRole", Auth.jwtAuth, Auth.authorize,role.addBulkRole);

router.post("/updateRole/:id", Auth.jwtAuth, Auth.authorize, role.updateRole);

router.post("/remove/:id", Auth.jwtAuth, Auth.authorize, role.removePermissions);

router.delete("/delete/:id", Auth.jwtAuth, Auth.authorize, role.deleteRole);

// Employee
router.post("/create", Auth.jwtAuth, Auth.authorize, user.createEmployee);

router.get("/getAllUser", Auth.jwtAuth, access.check('read_user'), user.getAll);

router.post("/updateUser/:id", Auth.jwtAuth, Auth.authorize, user.updateUser);

router.delete("/deleteUser/:id", Auth.jwtAuth, Auth.authorize, user.deleteUser);

//Task
router.post("/assignTask", Auth.jwtAuth, access.check('give_task'), task.assignTask);

router.get("/getTaskAssignBy", Auth.jwtAuth, access.check('get_task'), task.getTaskAssignBy);

router.get("/getTaskAssignTo", Auth.jwtAuth, access.check('get_task'), task.getTaskAssignTo);

router.post("/updateTaskAssignBy/:id", Auth.jwtAuth, access.check('update_task'), task.updateTaskAssignBy);

router.post("/updateTaskAssignTo/:id", Auth.jwtAuth, access.check("update_task"), task.updateTaskAssignTo);

router.delete("/deleteTask/:id",Auth.jwtAuth, access.check("delete_task"), task.deleteTask);

module.exports = router;