const { MongoClient } = require("mongodb");
const _ = require('lodash');

// Specifies the uri connection string
var url = {
  user: "Mahaki",
  pass: "b0WXu3QEgoGN7GZV",
  host: "compx241.psfq3g2.mongodb.net",
  opts: "retryWrites=true&w=majority",
  dbname: "main",
  colname: "users",
};

const uri = `mongodb+srv://${url.user}:${url.pass}@${url.host}/${url.dbname}?${url.opts}`;
const client = new MongoClient(uri);

try {
  client.connect();
}catch(e) {
  console.log("Cannot connect to database");
}

async function createUser(username, password){
  // Database structure
  const newUser = {
    username: username,
    password: password,
    highscore: 0,
    currentscore: 0,
    currentmap: null
  };
  // Inserting into database
  await client.db(url.dbname).collection(url.colname).insertOne(newUser);
}

async function checkUserName(username){
  var cleanName = username.trim().toLowerCase();
  var res = await client.db(url.dbname).collection(url.colname).find({username: username});
  if(_.isEmpty(res)){
    return true;
  }
  return false;
}

async function checkUser(client, username, password){
  var cleanName = username.trim().toLowerCase();
  var res = await client.db(url.dbname).collection(url.colname).find({username: username}).toArray();
  if(res.length != 0){
    if(res[0].password == password){
      console.log("Correct Password :)");
      return true;
    }else{
      console.log("Incorrect Password :(");
      return false;
    }
  }
  console.log("Incorrect Password :(");
  return false;
}

async function loadLeaderboards(){
  var res = await client.db(url.dbname).collection(url.colname).find().sort({highscore: -1}).toArray();
  return res;
}

async function checkCredentials(username, password){
  return checkUser(client, username, password);
}

/* updates users current score
   and high score if applicable */
async function setCurrentScore(username){
  await client.db(url.dbname).collection(url.colname).insertOne(newUser);
}

module.exports = { checkCredentials, loadLeaderboards, checkUserName, createUser };