var http = require('http');
var fs = require('fs');
var url = require('url')

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
    } else {
        response.writeHead(404);
        response.end('Not found');
    }

    
 
});
app.listen(3000);