var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var promise = require('promise');
var route = express.Router();
var multer = require('multer');

var imageLink = null;

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

var sql14 = "CREATE TABLE IF NOT EXISTS adminVerification (code VARCHAR(255), email VARCHAR(255))";
connection.query(sql14, function (Error, Result) {
    if (Error) throw Error;
    console.log("Verification table created!!");

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
            response.send("<center><h1><i><marquee behavior='alternate' scrollamount='5'>Image uploaded!</marquee><i><h1><center>")
        }
    });
});

route.post('/movieAdd', function (request, response) {

    var movieName = request.body.movieName.trim();
    var actorName = request.body.actorName.trim();
    var movieDate = request.body.movieDate.trim();
    var movieRating = parseInt(request.body.movieRating.trim());
    var movieBudget = parseInt(request.body.movieBudget.trim());
    var movieGross = parseInt(request.body.movieGross.trim());

    console.log('reach');

    if (movieName === "" || actorName === "" || movieDate === "" || movieRating === "" || movieBudget === "" || movieGross === ""){
        response.send("<center><h2 style='font-family: Chandas'>'Undefined' Error! :: All fields are required!</h2></center>");
    }
    else if (movieRating < 1 || movieRating > 5){
        response.send("<center><h2 style='font-family: Chandas'>'Input Error!' :: Please select a range between 0 and 5 for rating.</h2></center>");
    }
    else{
        if (imageLink === null){
            response.send("<center><h2 style='font-family: Chandas'>'Input Error!' :: Please add a poster.</h2></center>");
        }
        else {
            let sql9 = "SELECT * FROM movieTable WHERE movieName = ? ";
            let valueMovie = [[movieName]];

            connection.query(sql9, valueMovie, function (Error, Result) {
                if (Result.length === 0){
                    let sql2 = "INSERT INTO movieTable VALUES ?";
                    let values = [[movieName, actorName, movieDate, movieRating, movieBudget, movieGross, imageLink]];

                    connection.query(sql2, [values], function (Error) {
                        if (Error) throw Error;
                        console.log("Movie data inserted!")
                    });

                    response.writeHead(200, {"Content-Type":"text/html"});
                    fs.createReadStream('/home/aryan/WebstormProjects/dbms/movieAdded.html').pipe(response);
                }
                else {
                    response.send("<center><h2 style='font-family: Chandas'>'Duplicate Error!' :: Movie already exists in database.</h2></center>");
                }
            });
        }
    }
 });

 route.get('/getMovie', function (request, response) {
     var movieData = request.query.searchElement.trim();

     if (movieData != ""){
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
     }
     else {
         response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

     }
 });

route.post('/movieDelete', function (request, response) {
    var movieName = request.body.deleteMovieName.trim();

    if (movieName != ""){
        //
        var sqlDelete = "DELETE FROM movieTable WHERE movieName =  ?";
        var values = [movieName];

        connection.query(sqlDelete, values,function (Error, Result) {
            if (Error) throw Error;
            if (Result.affectedRows === 0){
                console.log("Movie deletion failed");
                response.send("<center><h2 style='font-family: Chandas'>'Movie not found in our database!</h2></center>");
            }
            else {
                console.log(Result);
                console.log("Movie deleted");
                response.send("<center><h2 style='font-family: Chandas'>'Movie deleted successfully!</h2></center>");
            }

        });
    }
    else {
        response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

    }
});


route.post('/showMovies', function (request, response) {
    var movieName = request.body.showMovies.trim();

    if (movieName != ""){

        var sqlShowMovies = "SELECT * FROM movieTable WHERE movieName =  ?";
        var values = [movieName];

        connection.query(sqlShowMovies, values,function (Error, Result) {
            if (Error) throw Error;
            if (Result.length === 0){
                console.log("Movie not found.");
                response.send("<center><h2 style='font-family: Chandas'>'Movie not found in our database!</h2></center>");
            }
            else {
                console.log(Result);
                console.log("Movie found!");
                response.send(Result);
            }
        });
    }
    else {
        response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

    }
});

route.post('/generateCode', function (request, response) {
    var email = request.body.email.trim();
    var code = Date.now().toString();

    if (email != ""){

        let sql20 = "SELECT * FROM adminVerification WHERE email = ?";
        var valueEmail = [email];

        connection.query(sql20, valueEmail, function (Error, Result) {
            if (Result.length === 0){
                var sqlCodeGenerate = "INSERT INTO adminVerification (code, email) VALUES ?";
                var values = [[code, email]];

                connection.query(sqlCodeGenerate, [values],function (Error, Result) {
                    if (Error) throw Error;
                    console.log(Result);
                    if (Result.affectedRows === 0){
                        console.log("Code not uploaded!");
                        response.send("<center><h2 style='font-family: Chandas'>'Code not uploaded to our website!</h2></center>");
                    }
                    else {
                        console.log(Result);
                        console.log("Code uploaded!");
                        response.render(path.join(__dirname, "../..") + "/generatedCode.html", {email:email, code:code});
                    }
                });
            }
            else {
                response.send("<center><h2 style='font-family: Chandas'>Email already registered!<br></h2></center>");
            }
        });
    }
    else {
        response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

    }
});


route.get('/advanceOptions', function (request, response) {
    upload(request, response, function (error) {
        if (error) throw error;
        response.writeHead(200, {"Content-Type":"text/html"});
        fs.createReadStream('/home/aryan/WebstormProjects/dbms/advanceOptions.html').pipe(response);
    });
});

route.post('/movieUpdate', function (request, response) {

    var movieName = request.body.movieName.trim();
    var actorName = request.body.actorName.trim();
    var movieDate = request.body.movieDate.trim();
    var movieRating = parseInt(request.body.movieRating.trim());
    var movieBudget = parseInt(request.body.movieBudget.trim());
    var movieGross = parseInt(request.body.movieGross.trim());

    console.log('reach');

    if (movieName === "" || actorName === "" || movieDate === "" || movieRating === "" || movieBudget === "" || movieGross === ""){
        response.send("<center><h2 style='font-family: Chandas'>'Undefined' Error! :: All fields are required!</h2></center>");
    }
    else if (movieRating < 1 || movieRating > 5){
        response.send("<center><h2 style='font-family: Chandas'>'Input Error!' :: Please select a range between 0 and 5 for rating.</h2></center>");
    }
    else{
        if (imageLink === null){
            response.send("<center><h2 style='font-family: Chandas'>'Input Error!' :: Please add a poster.</h2></center>");
        }
        else {
            //
            let sql2 = "UPDATE movieTable SET movieName = ?, actorName = ?, movieDate = ?, movieRating = ?, movieBudget = ?, movieGross = ?, imageLink = ? WHERE movieName = ? ";
            let values = [movieName, actorName, movieDate, movieRating, movieBudget, movieGross, imageLink, movieName];

            connection.query(sql2, values, function (Error,Result) {
                if (Error) throw Error;
                if (Result.changedRows === 0){
                    console.log("Movie data updation failed!");
                    console.log(Result);
                    response.send("<center><h2 style='font-family: Chandas'>'Error' :: Movie not in our database!!</h2></center>");
                }
                else {
                    console.log("Movie data updated!");
                    console.log(Result);
                    response.send("<center><h2 style='font-family: Chandas'>'Movie updated successfully!</h2></center>");
                }
            });
        }
    }
});

route.post('/showRequest', function (request, response) {

        var sqlRequest = "SELECT * FROM movieNotFoundTable";

        connection.query(sqlRequest,function (Error, Result) {
            if (Error) throw Error;
            if (Result.length === 0){
                console.log("No requests.");
                response.send("<center><h2 style='font-family: Chandas'>'No requests found!</h2></center>");
            }
            else {
                console.log(Result);
                console.log("Movie found!");
                response.send(Result);
            }
        });
});

route.post('/deleteRequests', function (request, response) {

    var sqlDeleteAll = "DROP TABLE IF EXISTS movieNotFoundTable";
    connection.query(sqlDeleteAll, function (Error, Result) {
        if (Error) throw Error;
        console.log("All requests deleted!");

        var sqlRemake = "CREATE TABLE IF NOT EXISTS movieNotFoundTable (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, movieData VARCHAR(255))";
        connection.query(sqlRemake, function (Error, Result) {
            if (Error) throw Error;
            console.log("movieNotFoundTable re-created!");
            response.send("All the requests have been cleared!");
        });
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