var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'q1w2e3r4!!',
  database : 'opentutorials'
});

db.connect();


var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        db.query(`SELECT * FROM topic`, function(error, results) {
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(results);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="create">create</a>`
          );
          console.log(results);
          response.writeHead(200);
          response.end(html);
        })

      } else {
          db.query(`SELECT * FROM topic`, function(error, results) {
          if(error) {
            throw error;
          }
          console.log('query id is : ', queryData.id)
          db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[queryData.id], function(error2, topic){ // ?[queryData.id] 이렇게 하면 자동으로 해킹의 여지가 있는 id값을 세탁해줌
            if(error2) {
              throw error2;
            }
            console.log('topic is : ', topic);
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(results);
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description} <p>
              <h3>${topic[0].name} 인 사람은 ${topic[0].profile}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
            );
            console.log(results);
            response.writeHead(200);
            response.end(html);


          })
          
        })
        

      }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM topic`, function(error, results) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
          console.log('authors :', authors);

         
          var title = 'WEB - create';
          var list = template.list(results);
          var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
                ${template.authorSelect(authors)}
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
          response.writeHead(200);
          response.end(html);
        })
        
      });

      
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;

          db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
              function(error, result){
                if(error) {
                  throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`});
                response.end();
              }
            )
        });
    } else if(pathname === '/update'){
      /*fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });*/
      db.query(`SELECT * FROM topic`, function(error, results) {
        if(error) {
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id = ?`, [queryData.id], function(error2, topic){
          if(error2) {
            throw error2;
          }
          db.query(`SELECT * FROM author`, function(error3, authors){
            if(error3) {
              throw error3;
            }
            var list = template.list(results);
            var html = template.HTML(topic[0].title, list, 
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
                ${template.authorSelect(authors, topic[0].author_id)}
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`);
            response.writeHead(200);
            response.end(html);
          })
          
        })
        
      });

    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
  
          var post = qs.parse(body);
        
          db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,[post.title, post.description, post.author, post.id], 
            function(error, results) {
              if(error) {
                throw error;
              }     
              response.writeHead(302, {Location: `/?id=${post.id}`});
              response.end();
            }
          )
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          db.query(`DELETE from topic where id=?`, [post.id], 
            function(error, results){
              if(error) {
                throw error;
              }
              response.writeHead(302, {Location: `/`});
              response.end();
            })
         
          

      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
