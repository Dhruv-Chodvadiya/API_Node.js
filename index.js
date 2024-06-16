const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();

const userRouter = require("./Routes/user");

const app = express();

require("./DB/connection");

//app.use(bodyParser.json());

app.use(express.json({}));

app.use('/user', userRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server Start PORT : ${PORT}`));