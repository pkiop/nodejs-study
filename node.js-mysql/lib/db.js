var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'q1w2e3r4!!',
    database : 'opentutorials'
  });

  db.connect();
  module.exports = db;
