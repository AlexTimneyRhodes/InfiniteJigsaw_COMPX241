// This order of package
// Imports is neccessary
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const port = process.env.PORT || 3030;

// Importing API's
const extendImage = require('./api/extendImage');

// Loading databse
const db = require('./db');
const app = express();

// for handling the image generation 'jobs'
const uuid = require('uuid'); 
const queue = new Map(); 


// Express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());

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
  res.render('puzzle')
});
app.get('/welcome', (req, res) => {
  // checking credentials
  if(req.session.loggedIn){
    res.render('welcome')
  }else{
    res.redirect('/login')
  }
});
app.get('/leaderboard', async (req, res) => {
  // checking credentials
  if(req.session.loggedIn){
    // getting data
    const result = await db.loadLeaderboards()
    res.render('leaderboard', {data: result});
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
          res.redirect('/welcome')
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


// setting up image extension
app.post('/api/extendImage', async (req, res) => {
  const { imagePath, prompt, direction } = req.body;

  // Generate a unique job ID
  const jobId = uuid.v4();

  // Create a new job and add it to the queue
  queue.set(jobId, { status: 'processing' });

  // Start the image generation in the background
  extendImage(imagePath, prompt, direction)
    .then((extendedImagePath) => {
      // Once the image has been generated, update the job status
      queue.set(jobId, { status: 'done', imagePath: extendedImagePath });
    });

  // Immediately respond with the job ID
  res.status(202).json({ jobId });
});

app.get('/api/checkJobStatus/:jobId', async (req, res) => {
  const { jobId } = req.params;

  // Check the status of the job
  const jobStatus = queue.get(jobId);

  if (!jobStatus) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (jobStatus.status === 'done') {
    res.json({ imagePath: jobStatus.imagePath });
  } else {
    res.status(202).json({ status: 'processing' });
  }
});


// Starting express server
try {
    app.listen(port);
    console.log("Listening on port: " + port);
}
catch(e) {
    console.log("Error: could not start server");
}
