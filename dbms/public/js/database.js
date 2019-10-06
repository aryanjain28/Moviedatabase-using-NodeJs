const express = require('express');
const mysql = require('mysql');
const app = express();
const fs = require('fs');

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Aryan@123',
    database:'movieDatabase'
});

connection.connect(function (Error) {
    if(Error) throw Error;
    console.log("Connected!")
});


app.get('/createDatabase', function (request, respond) {
    let sql = "CREATE DATABASE IF NOT EXISTS movieDatabase";
    connection.query(sql, function (Error, result) {
        if (Error) throw Error;
        console.log(result);
        respond.send("Database created!");
    });
});

app.get('/createTable', function (request, respond) {
    let sql = "CREATE TABLE IF NOT EXISTS movieTable(movieName varchar(255), leadActorName varchar(255))";
    connection.query(sql, function (Error, result) {
        if (Error) throw Error;
        console.log("Table created!");
        respond.send("Table created!");
    });
});

app.get('/insertTable', function (request, respond) {
    let data = [["pk", "Amir Khan"]];
    let sql = 'INSERT INTO movieTable VALUES ?';
    let query =  connection.query(sql, [data], function (Error) {
        if (Error) throw Error;
        console.log("Inserted!");
        respond.send("Value inserted!");
    });
});

app.get('/view/:id', function (request, respond) {
    let sql = `SELECT * FROM movieTable WHERE movieName = '${request.params.id}'`;
    let query =  connection.query(sql, function (Error, results, fields) {
        if (Error) throw Error;
        if (results.length == 0){
            console.log("NOT FOUND!");
            respond.send("NOT FOUND!!");
        }
        else {
            console.log("Reach!");
            console.log(results);
            respond.writeHead(200, {'Context-Type':'text/html'});
            fs.createReadStream('./notFound.html').pipe(respond);
        }

    });
});

app.listen(3000, function () {
    console.log("Server started on 3000!");
});