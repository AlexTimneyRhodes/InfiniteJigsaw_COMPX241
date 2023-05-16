// This order of package
// Imports is neccessary
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const port = 3000;

// Loading databse
const db = require('./db');
const app = express();

// Express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Setting up sessions
app.use(cookieParser());
app.use(session({
  secret: '4bax32y1tw',
  resave: false,
  saveUninitialized: true
}));

// Setting up routing
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('login')
});
app.get('/login', (req, res) => {
  res.render('login')
});
app.get('/register', (req, res) => {
    res.render('register')
});
app.get('/puzzle', (req, res) => {
  // checking credentials
  if(req.session.loggedIn){
    res.render('puzzle')
  }else{
    res.redirect('/login')
  }
});
app.get('/leaderboard', (req, res) => {
  // checking credentials
  if(req.session.loggedIn){
    res.render('leaderboard', {data: []});
  }else{
    res.redirect('/login')
  }
});

// 404 Page - currently redirecting post requests?s
// app.use((req,res) => {
//     res.status(404).render('404');
// });

// Handling post requests
app.post('/login', async (req, res) => {
    // Validating username and password
    result = await db.checkCredentials(req.body.username, req.body.password);
    if(result){
      req.session.regenerate(function (err){
        if (err) next(err)
        req.session.loggedIn = true;
        req.session.userName = req.body.username;
        req.session.save(function (err){
          if(err) return next(err)
          res.redirect('/puzzle')
        });
      });
    }else{
      console.log("incorrect username or password")
      res.redirect('/login' )
    }
});
app.post('/register', async (req, res) => {
    const chkName = await db.checkUserName(req.body.username);
    if(!chkName){
      await db.createUser(req.body.username, req.body.password);
      res.redirect("/login")
    }else{
      res.send("Username already exists")
    }
});
app.post('/leaderboard', async (req, res) => {
    const result = await db.loadLeaderboards()
    res.render('leaderboard', {data: result});
});

// Starting express server
try {
    app.listen(port);
    console.log("Listening on port: " + {port});
}
catch(e) {
    console.log("Error: could not start server");
}
