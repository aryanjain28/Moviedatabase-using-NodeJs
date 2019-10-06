var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var promise = require('promise');
var route = express.Router();

app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Aryan@123',
    database:'adminDatabase'
});

var sql1 = "CREATE TABLE IF NOT EXISTS userTable (userName VARCHAR(255), userEmail VARCHAR(255) PRIMARY KEY, userPassword VARCHAR(255))";
connection.query(sql1, function (Error) {
    if (Error) throw Error;
    console.log("userTable created!!");
});

route.post('/userAdd', function (request, response) {

    var userName = request.body.userName;
    var userEmail = request.body.userEmail;
    var userPassword = request.body.userPassword;

    let sql2 = "INSERT INTO userTable VALUES ?";
    let values = [[userName, userEmail, userPassword]];

    connection.query(sql2, [values], function (Error) {
        if (Error) throw Error;
        console.log("User data inserted!")
    });

    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieSearch.html').pipe(response);
});

route.post('/userLogin', function (request, response) {

    var userEmail = request.body.userEmail;
    var userPassword = request.body.userPassword;

    let sql2 = "SELECT * FROM userTable WHERE userEmail = ? AND userPassword = ?";
    var values = ["'"+userEmail+"'", "'"+userPassword+"'"];

    connection.query(sql2, values, function (Error) {
        if (Error) throw Error;
        console.log("User logged in.")
    });

    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieSearch.html').pipe(response);
});

module.exports = route;