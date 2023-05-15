const express = require('express'); 
//Express app
var path = require('path'); 
const app = express();
const util = require("util");
var fs = require('fs'); 
const port = 3000;

//Register view engine
app.set('view engine', 'ejs'); 
//Listen for requests
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
}); 


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// app.use(express.urlencoded({extended:false}));

app.get('/', (req,res) => {
    res.render('index'); 

});


app.get('/about', (req,res) => {
    res.render('about'); 

});

//redirects 
app.get('/about-us', (req,res) => {
    res.redirect('/about');
});

//404 Page 
app.use((req,res) => {
    res.status(404).render('404'); 
});