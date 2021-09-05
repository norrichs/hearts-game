require("dotenv").config();
const express = require("express");
const mongoose = require("./db/connection");


const gameStateController = require("./controllers/gameState")
const userController = require("./controllers/user")

const app = express();
const PORT = process.env.PORT

//imports
const cors = require("cors")
const morgan = require("morgan")

//midleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))


app.get("/", (req, res) => {
    res.json({ hello: "Hello World, Hearts!" });
  });
  
app.use("/user", userController)
app.use("/gameState", gameStateController)

app.listen(PORT, () => {
  console.log(`Your are listening on port ${PORT}`);
});