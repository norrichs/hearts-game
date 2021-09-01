///////////////////////////
// Environmental Variables
///////////////////////////
require("dotenv").config();

/////////////////////////////////////
// MONGOOSE CONNECTION
/////////////////////////////////////
const { MONGODBURI } = process.env;
const mongoose = require("mongoose");
const config = { 
  useUnifiedTopology: true,
  useNewUrlParser: true ,
  useFindAndModify:false,
};
const DB = mongoose.connection;

mongoose.connect(MONGODBURI, config);

DB.on("open", () => console.log("You are connected to Mongo"))
  .on("close", () => console.log("You are disconnected to Mongo"))
  .on("error", (err) => console.log(err));

module.exports = mongoose;



/*
// CODE FROM MONGO

const { MongoClient } = require('mongodb');
const uri = 
"mongodb+srv://norrichs:<password>@cluster0.wavq2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


*/