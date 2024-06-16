const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Role = require("../Models/Role");
const User = require("../Models/User");

const DB = process.env.DB;

mongoose.connect(DB).then(async () => {
  console.log("DB Connected");

  let superAdminRole = await Role.findOne({ roleName: 'superadmin' });
  
  if (!superAdminRole) {
    superAdminRole = await Role.create({roleName: 'superadmin' , permissions: ['All']});
  }

  let defaultSuperAdmin = await User.findOne({email: 'superadmin@example.com'});
  if (!defaultSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    defaultSuperAdmin = await User.create({name: 'Super Admin', email: 'superadmin@example.com', password: hashedPassword, role: superAdminRole._id});
  
    //console.log(defaultSuperAdmin);
  }

}).catch((err) => {
  console.log(err);
});