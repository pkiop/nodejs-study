var db = require('./db');
var template = require('./template.js');
var qs = require('querystring');
var moment = require('moment');


exports.home =  function(request, response) {
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
  });
};

exports.page = function(request, response, queryData, pathname) {
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

exports.create = function(request, response, queryData, pathname) {
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
}

exports.create_process = function(request, response, queryData, pathname) {
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
}

exports.update = function(request, response, queryData, pathname) {
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
}
exports.update_process = function(request, response, queryData, pathname) {
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
}

exports.delete_process = function(request, response) {
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
}