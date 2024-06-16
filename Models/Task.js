const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  taskStatus : {
    type : String,
    default: 'Pending'
  },
  requireTime : {
    type: String
  },
  taskDate :{
    type: Date,
    default: Date.now()
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

const Employee = mongoose.model("task", taskSchema);

module.exports = Employee;