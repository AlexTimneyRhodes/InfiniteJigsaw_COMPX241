const http = require('http'); 
const fs = require('fs');
const _ = require('lodash'); 

const server = http.createServer( (req,res) => {
    //lodash
    const num = _.random(0,20);
    console.log(num); 

    const greet = _.once(() => {
        console.log('hello'); 
    })

    greet(); 
    greet(); 


    //Set header content type 
    res.setHeader('Content-Type', 'text/html'); 

    let path = './views';
    switch(req.url){
        case '/':
            path += '/index.html'; 
            res.statusCode = 200; 
            break; 
        case '/about':
            path += '/about.html';
            res.statusCode = 200;  
            break; 
        case '/about-blah':
            res.statusCode = 301; //The resource that we are trying to access has been permanently moved, want to do a permanent redirect
            res.setHeader('Location', '/about'); 
            res.end(); 
            break; 
        default: 
            path += '/404.html'; 
            res.statusCode = 404;
            break; 
    }

    fs.readFile(path,(err,data) =>{
        if(err){
            console.log(err);
            res.end(); 
        }else{
            // res.write(data); 
            res.end(data); 
        }
    }) 
}); 

server.listen(3000, () => {
    console.log('listening for requests on port 3000')
});