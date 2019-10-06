var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var promise = require('promise');
var movieDatabase = require("./movieDatabase");
var userDatabase = require("./userDatabase");

app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/movieDatabase', movieDatabase);
app.use('/userDatabase', userDatabase);

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Aryan@123',
    database:'adminDatabase'
});

connection.connect(function (Error) {
    if (Error) throw Error;
    console.log("Connected!");
});

let sql0 = "CREATE DATABASE IF NOT EXISTS adminDatabase";
connection.query(sql0, function (Error) {
    if (Error) throw Error;
    console.log("Database created!");
});

let sql1 = "CREATE TABLE IF NOT EXISTS adminTable (adminID VARCHAR(255) PRIMARY KEY, adminName VARCHAR(255), adminEmail VARCHAR(255), adminPassword VARCHAR(255)) ";
connection.query(sql1, function (Error) {
    if (Error) throw Error;
    console.log("adminTable created!");
});

app.get('/', function (request, response) {
    response.writeHead(200, {"Content-type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/adminRegister.html').pipe(response);
});

app.post('/adminRegister', function (request, response) {

    let sql2 = 'INSERT INTO adminTable VALUES ?';
    let values = [
        [Date.now(), request.body.adminName, request.body.adminEmail, request.body.adminPassword]
    ];

    connection.query(sql2, [values], function (Error) {
        if (Error) throw Error;
        console.log("Values inserted successfully!");
    });

        response.writeHead(200, {"Content-Type":"text/html"});
        fs.createReadStream('/home/aryan/WebstormProjects/dbms/adminMovieRegister.html').pipe(response);
});

app.post('/adminLogin', function (request, response) {
    var email = request.body.adminEmail;
    var password = request.body.adminPassword;

    var sqlFind = "SELECT * FROM adminTable WHERE adminEmail = ? AND adminPassword = ?";
    var values = ["'"+email+"'", "'"+password+"'"];
    connection.query(sqlFind, values, function (Error, Result) {
        if (Error) throw Error;
        console.log(Result);
    });

    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/adminMovieRegister.html').pipe(response);
});

app.get('/goToAdminLogin', function (request, response) {
    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/adminLogin.html').pipe(response);
});

app.get('/goToUserLogin', function (request, response) {
    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/userLogin.html').pipe(response);
});

app.get('/goToUserRegister', function (request, response) {
    response.writeHead(200, {"Content-Type":"text/html"});
    fs.createReadStream('/home/aryan/WebstormProjects/dbms/userRegister.html').pipe(response);
});

app.listen(3000, function (Error) {
    if (Error) throw Error;
    console.log("Server started @ 3000.");
});

// connection.query("DROP TABLE adminTable", function (Error) {
//     if(Error) throw Error;
//     console.log("Deleted!");
// });