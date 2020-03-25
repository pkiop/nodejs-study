var http = require('http');
var fs = require('fs');
var url = require('url')

var app = http.createServer(function(request,response){
    var _url = request.url; // 이건 query string 값을 받아온다는 것 같음.
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var listmode = 'ul';
    var filelink = 'data/' + title;
    console.log(filelink);
    fs.readFile(filelink, 'utf8', function(err, maintext){
        var template = `
<!doctype html>
<html>
<head>
  <title>WEB1 - ${title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1><a href="/">WEB</a></h1>
  <${listmode}>
    <li><a href="/?id=HTML">HTML</a></li>
    <li><a href="/?id=CSS">CSS</a></li>
    <li><a href="/?id=JavaScript">JavaScript</a></li>
  </${listmode}>
  <h2>${title}</h2>
  <p>
  ${maintext}
  </p>
</body>
</html>

    `;
    response.end(template);
    });


    console.log(queryData.id)
    if(_url == '/'){
      title = 'Welcome';
    }
    if(_url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);

    
 
});
app.listen(3000);