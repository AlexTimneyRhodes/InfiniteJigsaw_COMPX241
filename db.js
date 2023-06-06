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

/*
* Creates new user using username and password
*/
async function createUser(username, password){
  // Making username simple
  var cleanName = username.trim().toLowerCase();
  // Database structure
  const newUser = {
    username: cleanName,
    password: password,
    data: {}
  };
  // Inserting into database
  await client.db(url.dbname).collection(url.colname).insertOne(newUser);
}

/*
* Checks if username exists inside database
*/
async function checkUserName(username){
  // Making username simple
  var cleanName = username.trim().toLowerCase();
  // Making username simple
  var res = await client.db(url.dbname).collection(url.colname).find({username: cleanName});
  if(_.isEmpty(res)){
    return true;
  }
  return false;
}

/*
* Checks if credentials are correct
*/
async function checkUser(client, username, password){
  // Making username simple
  var cleanName = username.trim().toLowerCase();
  // Querying inside db
  var res = await client.db(url.dbname).collection(url.colname).find({username: cleanName}).toArray();
  if(res.length != 0){
    if(res[0].password == password){
      return true;
    }else{
      // Password incorrect
      return false;
    }
  }else{
    // User does not exist
    return false;
  }
}

/*
* Returns the current leaderboard list
*/
async function loadLeaderboards(filters){
  var res = await client.db(url.dbname).collection(url.colname).find().toArray();
  if(filters == ""){
    // Normal page load
    // Presetting filters
    filters = {
      Difficulty: "",
      BaseImage: "",
      SortBy: ""
    }
  }
  // Filters should contain
  // {Difficulty, BaseImage, SortBy}
  var baseImage = filters.BaseImage;
  var difficulty = filters.Difficulty;
  var sortBy = filters.SortBy;

  var sorted = [];
  for(var i = 0; i < res.length;i++){
    // Checking if sorting by baseImage
    if(res[i][baseImage] != null)
      if(res[i][baseImage][difficulty] != null){
        // Calculating total score
        sorted.push([res[i].username, calculateTotal(res[i][baseImage][difficulty]),
          wellFormattedTotal(res[i][baseImage][difficulty]), res[i][baseImage][difficulty]["rounds"]]);
      }
  }

  // Sorting by rounds / time
  if(sortBy == "Time"){
    sorted.sort(timeCompareFunc);
  }else{
    sorted.sort(roundCompareFunc);
  }

  return sorted
}

function roundCompareFunc(a, b){
  if(Number(a[3]) > Number(b[3])) return -1
  if(Number(a[3]) < Number(b[3])) return 1
  return 0
}

function timeCompareFunc(a, b){
  if(a[1] < b[1]) return -1
  if(a[1] > b[1]) return 1
  return 0
}

function calculateTotal(obj){
  return Number(obj["seconds"]) + Number(obj["minutes"]) * 60 + Number(obj["hours"]) * 60 * 60;
}

function wellFormattedTotal(obj){
  return obj["hours"] + ":" + obj["minutes"] + ":" + obj["seconds"];
}
/*
* Wrapper function for checking credentials
*/
async function checkCredentials(username, password){
  return checkUser(client, username, password);
}

/*
* Sets users highscore
*/
async function setHighScores(username, data){
  /* Data is stored inside this structure
      imageName: {
        difficulty: {
          seconds
          minutes
          hours
          rounds
        }
      }
  */
  var toUpdate = {};
  // Making username simple
  var cleanName = username.trim().toLowerCase();
  var res = await client.db(url.dbname).collection(url.colname).find({username: cleanName}).toArray();
  // Checking if user exists
  if(res[0] != null){
    res = res[0];
    // Checking if key already exists
    if(data.image != null && res[data.image] != null){
      // Setting up initial values
      toUpdate[data.image] = res[data.image]
      // Already has previous record
      // Checking if dificulty exists
      if(data.difficulty != null && res[data.image][data.difficulty] != null){
        // Already has previous record
        // Calculating previous scores
        let previousSeconds = res[data.image][data.difficulty]["seconds"];
        let previousMinutes = res[data.image][data.difficulty]["minutes"];
        let previousHours = res[data.image][data.difficulty]["hours"];
        let previousTime = previousHours * 60 * 60 + previousMinutes * 60 + previousSeconds;
        let previousRounds = Number(res[data.image][data.difficulty]["rounds"]);
        let currentTime = Number(data.hours) * 60 * 60 + Number(data.minutes) * 60 + Number(data.seconds);
        let currentRounds = Number(data.rounds);
        // Comparing results
        if(currentTime < previousTime) {
          console.log("New Personal Best: Time");
          toUpdate[data.image][data.difficulty]["seconds"] = Number(data.seconds);
          toUpdate[data.image][data.difficulty]["minutes"] = Number(data.minutes);
          toUpdate[data.image][data.difficulty]["hours"] = Number(data.hours);
        }
        if(currentRounds > previousRounds){
          console.log("New Personal Best: Rounds");
          toUpdate[data.image][data.difficulty]["rounds"] = Number(data.rounds);
        }
      }else{
        console.log("New difficulty created");
        // New difficulty
        toUpdate[data.image][data.difficulty] = {};
        toUpdate[data.image][data.difficulty]["seconds"] = Number(data.seconds);
        toUpdate[data.image][data.difficulty]["minutes"] = Number(data.minutes);
        toUpdate[data.image][data.difficulty]["hours"] = Number(data.hours);
        toUpdate[data.image][data.difficulty]["rounds"] = Number(data.rounds);
      }
    }else{
      console.log("New base image");
      // New base image
      toUpdate[data.image] = {};
      toUpdate[data.image][data.difficulty] = {};
      toUpdate[data.image][data.difficulty]["seconds"] = Number(data.seconds);
      toUpdate[data.image][data.difficulty]["minutes"] = Number(data.minutes);
      toUpdate[data.image][data.difficulty]["hours"] = Number(data.hours);
      toUpdate[data.image][data.difficulty]["rounds"] = Number(data.rounds);
    }
  }else{
    // Critical error
    console.log("Critical ERROR: User no longer exists");
  }
  // Checking if update is valid
  if(toUpdate != {}){
    // Sending query
    await client.db(url.dbname).collection(url.colname).updateOne({username: cleanName}, {$set: toUpdate});
  }
}

module.exports = { checkCredentials, loadLeaderboards, checkUserName, createUser, setHighScores };