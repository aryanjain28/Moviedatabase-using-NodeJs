var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var promise = require('promise');
var route = express.Router();
var multer = require('multer');

var imageLink;

app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Aryan@123',
    database:'adminDatabase'
});

const storage = multer.diskStorage({
    destination:path.join(path.join(__dirname, ".."), './uploads'),
    filename:function (request, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage : storage
}).single('myImage');

var sql1 = "CREATE TABLE IF NOT EXISTS movieTable (movieName VARCHAR(255) PRIMARY KEY, actorName VARCHAR(255), movieDate VARCHAR(255), movieRating INT, movieBudget INT, movieGross INT, posterPath VARCHAR(255))";
connection.query(sql1, function (Error, Result) {
     if (Error) throw Error;
     console.log("movieTable created!!");
});

route.post('/upload', function (request, response) {
    upload(request, response, function (error) {
        if (error) {
            response.render('adminMovieRegister.html', {
                msg:error
            });
        }
        else {
            imageLink = "http://localhost:3000/uploads/"+request.file.filename;
            console.log(request.file.filename);
            console.log(imageLink);
            response.send("<center><h1><i>Image uploaded!<i><h1><center>")
        }
    });
});

route.post('/movieAdd', function (request, response) {

    var movieName = request.body.movieName;
    var actorName = request.body.actorName;
    var movieDate = request.body.movieDate;
    var movieRating = parseInt(request.body.movieRating);
    var movieBudget = parseInt(request.body.movieBudget);
    var movieGross = parseInt(request.body.movieGross);

    let sql2 = "INSERT INTO movieTable VALUES ?";
    let values = [[movieName, actorName, movieDate, movieRating, movieBudget, movieGross, imageLink]];

    connection.query(sql2, [values], function (Error) {
        if (Error) throw Error;
        console.log("Movie data inserted!")
    });

     response.writeHead(200, {"Content-Type":"text/html"});
     fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieAdded.html').pipe(response);
 });

 route.get('/getMovie', function (request, response) {
     var movieData = request.query.searchElement;
     var sqlFind = "SELECT * FROM movieTable WHERE movieName = ? OR actorName = ?";
     var values = [movieData, movieData];

     connection.query(sqlFind, values,function (Error, Result) {
         if (Error) throw Error;
         if (Result.length == 0){
             insertIntoNotFoundTable(movieData);
             response.writeHead(200, {"Content-Type":"text/html"});
             fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieNOTFound.html').pipe(response);
         }
         else {
             console.log(Result);
             response.render(path.join(__dirname, "../..") + "/movieFound.html", {name:Result});
         }
     });
 });

 function insertIntoNotFoundTable(data){
     var sqlNotFound = "CREATE TABLE IF NOT EXISTS movieNotFoundTable (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, movieData VARCHAR(255))";
     connection.query(sqlNotFound, function (Error, Result) {
         if (Error) throw Error;
         console.log("Movie not found table created!!");
     });

     let sql = "INSERT INTO movieNotFoundTable (movieData) VALUES ?";
     let values = [[data]];

     connection.query(sql, [values], function (Error) {
         if (Error) throw Error;
         console.log("Movie data inserted!")
     });
 }

module.exports = route;