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

    var userName = request.body.userName.trim();
    var userEmail = request.body.userEmail.trim();
    var userPassword = request.body.userPassword.trim();
    var userConfirmPassword = request.body.userConfirmPassword.trim();

    if (userName === "" || userPassword === "" || userEmail === ""){
        response.send("<center><h2 style='font-family: Chandas'>'Undefined' Error! :: All fields are required!</h2></center>");
    }
    else if(userPassword != userConfirmPassword){
        response.send("<center><h2 style='font-family: Chandas'>'Match' Error! :: Password do not match!</h2></center>");
    }
    else {
        let sql4 = "SELECT * FROM userTable WHERE userEmail = ?";
        var values = [userEmail];

        connection.query(sql4, values, function (Error, Result) {
            if (Error) throw Error;
            if (Result.length === 0) {

                let sql2 = "INSERT INTO userTable VALUES ?";
                let values = [[userName, userEmail, userPassword]];

                connection.query(sql2, [values], function (Error) {
                    if (Error) throw Error;
                    console.log("User data inserted!")
                });

                response.writeHead(200, {"Content-Type": "text/html"});
                fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieSearch.html').pipe(response);

            } else {
                response.send("<center><h2 style='font-family: Chandas'>Email already registered!<br></h2></center>");
            }
            console.log(Result)
        });
    }


});

route.post('/userLogin', function (request, response) {

    var userEmail = request.body.userEmail;
    var userPassword = request.body.userPassword;

    console.log(userEmail);
    console.log(userPassword);

    if (userEmail === "" || userPassword === ""){
        response.send("<center><h2 style='font-family: Chandas'>'Undefined' Error! :: All fields are required!</h2></center>");
    }
    else {

        let sql2 = "SELECT * FROM userTable WHERE userEmail = ? AND userPassword = ? ";
        var values = [userEmail, userPassword];

        connection.query(sql2, values, function (Error, Result) {
            if (Error) throw Error;
            if (Result.length === 0) {
                response.send("<center><h2 style='font-family: Chandas'>User not registered in our database.<br>or else, ID/PASSWORD incorrect!</h2></center>");
            } else {
                response.writeHead(200, {"Content-Type": "text/html"});
                fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieSearch.html').pipe(response);
            }
            console.log(Result)
        });
    }
});

module.exports = route;