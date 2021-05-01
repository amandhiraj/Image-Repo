const express = require('express');
const cors = require('cors');
const app = express();

// Config
var port = 3001;

app.use(express.json()); 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

var sign_s3 = require('./controllers/sign_s3');

app.use('/sign_s3', sign_s3.sign_s3);

app.listen(port);

console.log("Server Started make a request to localhost:" + port)