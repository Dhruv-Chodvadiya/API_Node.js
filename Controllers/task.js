const { valid, func } = require("joi");
const Task = require("../Models/Task");
const User = require("../Models/User");
const Role = require("../Models/Role");
const joi = require("../Validation/joi");
const { default: mongoose, model } = require("mongoose");

async function assignTask(req, res) {
  try {
    const { error, value } = joi.verifyTaskschema.validate(req.body);

    if (error) {
      return res.json({
        message: error.message,
      });
    }

      const { taskName, description, assignedTo } = value;
      
      if (req.tokenData.id == assignedTo) {
          return res.status(400).json({
            message: "You can not Assign your self"  
          })
      }

    const existUser = await User.findById(assignedTo);

    if (!existUser) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    const existingTask = await Task.findOne({ taskName, assignedTo });
    if (existingTask) {
      return res.status(400).json({
        message: "Task with the same name already assigned to the user",
      });
    }

    const newTask = new Task({
      ...value,
      assignedBy: req.tokenData.id,
    });

    await newTask.save();

    res.status(200).json({
      message: "Task assign successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function getTaskAssignBy(req, res) {
  try {
    let getAllTask;

    const tokenDetails = await User.findById(req.tokenData.id);

    const tokenRole = await Role.findById(tokenDetails.role);

    //console.log(tokenDetails);

    if (tokenRole.roleName === "superadmin") {
      getAllTask = await Task.find({}, { _id: 0, __v: 0 })
        .populate({
          path: "assignedTo",
          select: "-_id -password -__v",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -permissions -__v",
          },
        })
        .populate({
          path: "assignedBy",
          select: "-_id -__v -password -email",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -__v -permissions",
          },
        });
    } else {
      getAllTask = await Task.find(
        { assignedBy: { $in: tokenDetails._id } },
        { _id: 0, __v: 0 }
      )
        .populate({
          path: "assignedTo",
          select: "-_id -password -__v",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -permissions -__v",
          },
        })
        .populate({
          path: "assignedBy",
          select: "-_id -__v -password -email",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -__v -permissions",
          },
        });
    }

    /* if (tokenRole.roleName === 'superadmin') {
            getAllTask = await Task.find({}, { _id: 0, __v: 0 })
                .populate({
                    path: 'assignedTo',
                    select: "-_id -password -__v",
                    populate: {
                        path: "role",
                        model: "role",
                        select: "-_id -permissions -__v"
                    }
                })
                .populate({
                    path: "assignedBy",
                    select: "-_id -__v -password -email",
                    populate: {
                        path: "role",
                        model: "role",
                        select: "-_id -__v -permissions"
                    }
                });
          } else if (tokenRole.roleName === 'Admin') {
            //const filterTask = await Task.find({ assignedBy: { $ne: tokenRole._id } })
            //getAllTask = getAllUser.filter(user => user.role.roleName === 'Employee');
          } */

    //console.log(getAllTask);

    res.status(200).json({
      message: "Task Get successfully",
      getAllTask,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function getTaskAssignTo(req, res) {
  try {
    let getAllTask;

    const tokenDetails = await User.findById(req.tokenData.id);

    const tokenRole = await Role.findById(tokenDetails.role);

    if (tokenRole.roleName === "superadmin") {
      getAllTask = await Task.find({}, { _id: 0, __v: 0 })
        .populate({
          path: "assignedTo",
          select: "-_id -password -__v",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -permissions -__v",
          },
        })
        .populate({
          path: "assignedBy",
          select: "-_id -__v -password -email",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -__v -permissions",
          },
        });
    } else {
      getAllTask = await Task.find(
        { assignedTo: { $in: tokenDetails._id } },
        { _id: 0, __v: 0 }
      )
        .populate({
          path: "assignedTo",
          select: "-_id -password -__v",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -permissions -__v",
          },
        })
        .populate({
          path: "assignedBy",
          select: "-_id -__v -password -email",
          populate: {
            path: "role",
            model: "role",
            select: "-_id -__v -permissions",
          },
        });
    }

    res.status(200).json({
      message: "Task Get successfully",
      getAllTask,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function updateTaskAssignBy(req, res) {
    try {

        const existTask = await Task.findById(req.params.id);

        if (!existTask) {
            return res.status(404).json({
                message: "Task is not Found"
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(404).json({
                message: "Empty Body Not Allow"
            });
        }

        if (existTask.assignedBy != req.tokenData.id) {
            return res.status(404).json({
                message: "the task was not assigned by you"
            });
        }

        if (req.body.assignedTo === req.tokenData.id) {
            return res.status(400).json({
                message: "Assign Id chenge"
            });
        }

        if (req.body.taskDate) {
            return res.status(400).json({
                message: "Date Assign Default"
            });
        }

        if (req.body.taskStatus) {
            return res.status(400).json({
                message: "You can Not change status"
            });
        }

        if (req.body.assignedBy) {
            return res.status(400).json({
                message: "You can Not change assignedBy"
            });
        }

        let allChanges = {};

        if (req.body.taskName) {
            allChanges.taskName = req.body.taskName
        }
        if (req.body.description) {
            allChanges.description = req.body.description
        }
        if (req.body.assignedTo) {
            allChanges.assignedTo = req.body.assignedTo
        }

        await Task.findByIdAndUpdate({_id:req.params.id},allChanges);


        res.status(200).json({
            message: "Task Update successfully"
          });
        
    } catch (error) {
        res.status(400).json({
            message: error.message,
          });
    }
}

async function updateTaskAssignTo(req, res) {
    try {

        const existTask = await Task.findById(req.params.id);

        if (!existTask) {
            return res.status(404).json({
                message: "Task is not Found"
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(404).json({
                message: "Empty Body Not Allow"
            });
        }

        if (existTask.assignedTo != req.tokenData.id) {
            return res.status(404).json({
                message: "the task was not assigned To you"
            });
        }

        if (req.body.taskName) {
            return res.status(400).json({
                message: "You can not Change Task Name"
            });
        }

        if (req.body.description) {
            return res.status(400).json({
                message: "You can not Change Task description"
            });
        }

        if (req.body.taskDate) {
            return res.status(400).json({
                message: "Date Assign Default"
            });
        }

        if (req.body.assignedTo) {
            return res.status(400).json({
                message: "You can Not change assignedTo"
            });
        }

        if (req.body.assignedBy) {
            return res.status(400).json({
                message: "You can Not change assignedBy"
            });
        }

        let allChanges = {};

        if (req.body.taskStatus) {
            allChanges.taskStatus = req.body.taskStatus
        }
        if (req.body.requireTime) {
            allChanges.requireTime = req.body.requireTime
        }

        await Task.findByIdAndUpdate({_id:req.params.id},allChanges);

        res.status(200).json({
            message: "Task Update successfully"
          });
        
    } catch (error) {
        res.status(400).json({
            message: error.message,
          });
    }
}

async function deleteTask(req, res) {
    try {

        const existTask = await Task.findById(req.params.id);

        if (!existTask) {
            return res.status(404).json({
                message: "Task is not Found"
            });
        }

        if (existTask.assignedBy != req.tokenData.id) {
            return res.status(404).json({
                message: "the task was not assigned by you"
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Task Update successfully",
            getAllTask,
          });
    } catch (error) {
        res.status(400).json({
            message: error.message,
          });
    }
}

module.exports = { assignTask, getTaskAssignBy, getTaskAssignTo, updateTaskAssignBy, updateTaskAssignTo, deleteTask };
