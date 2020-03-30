var http = require('http');
var fs = require('fs');
var url = require('url')
var qs = require('querystring'); //qs -> querystring 이라는 모듈을 가져온다.

function templateHTML(title, data_list, body) {
    return `
        <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${data_list}
          <a href="/create">create</a>
          ${body}
        </body>
        </html>
        `;
}

function templateList(listmode, filelist) {
    var data_list = `<${listmode}>`;
    var i = 0;
    while(i < filelist.length) {
        data_list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i = i + 1;
    }
    data_list += `</${listmode}>`
    return data_list;
}

var app = http.createServer(function(request,response){
    var _url = request.url; // 이건 query string 값을 받아온다는 것 같음.
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var listmode = 'ul';
    var filelink = 'data/' + title;

    console.log(url.parse(_url, true)); // url 정보를 분석할 때 출력
    var pathname = url.parse(_url, true).pathname;
    console.log("is pathname ?");
    console.log(pathname);
    if(pathname === '/'){
        if(queryData.id === undefined) {
            fs.readdir('./data',function(error, filelist) {
                console.log(filelist);
                var title = 'Welcome';
                var maintext = 'Hello, Node.js';
                var data_list = templateList(listmode, filelist);
                var template = templateHTML(title, data_list, `<h2>${title}</h2>${maintext}`);
                response.writeHead(200); // 잘 됐는지 
                response.end(template);
            })
        } else {
            fs.readFile(filelink, 'utf8', function(err, maintext){
                fs.readdir('./data',function(error, filelist) {
                    var data_list = templateList(listmode, filelist);
                    var template = templateHTML(title, data_list, `<h2>${title}</h2>${maintext}`);

                    response.writeHead(200); // 잘 됐는지 
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        console.log("in create");
        fs.readdir('./data',function(error, filelist) {
                console.log(filelist);
                var title = 'Welcome';
                var maintext = 'Hello, Node.js';
                var data_list = templateList(listmode, filelist);
                var template = templateHTML(title, data_list, `
                    <form action="http://localhost:3000/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="contents"></textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>

                `);
                response.writeHead(200); // 잘 됐는지 
                response.end(template);
            })

    } else if(pathname === '/create_process') { 
        var body = '';
        request.on('data', function(data) { // post 데이터가 많으면 그냥 꺼질수도. 조각조각 수신할떄마다 얻어오는 것 
            body = body + data; // 받아올때마다 전송해받는 것 
        });
        request.on('end',function() { // 'end'는 그 조각조각 전송이 끝났다는 것
            var post = qs.parse(body);
            console.log(post);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`}); // 잘 됐는지 
                response.end('success');
            });
        });
        
    } else {
        response.writeHead(404);
        response.end('Not found');
    }

    
 
});
app.listen(3000);