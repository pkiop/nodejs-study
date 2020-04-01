var http = require('http');
var fs = require('fs');
var url = require('url')
var qs = require('querystring'); //qs -> querystring 이라는 모듈을 가져온다.
var template = require('./lib/template.js');
var path = require('path');

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
    console.log('output : ', queryData.id);
    var title = '';
    var filteredId = '';
    if(queryData.id === undefined) {
        title = queryData.id;
    }
    else {
        title = path.parse(queryData.id).base;
    }
    
    
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
                // var data_list = templateList(listmode, filelist);
                // var template = templateHTML(title, data_list, 
                //     `<h2>${title}</h2>${maintext}`,
                //     `<a href="/create">create</a>`
                //     );
                // response.writeHead(200); // 잘 됐는지 
                // response.end(template);

                var list = template.list(listmode, filelist);
                var html = template.html(title, list, 
                    `<h2>${title}</h2>${maintext}`,
                    `<a href="/create">create</a>`
                    );
                response.writeHead(200); // 잘 됐는지 
                response.end(html);
            })
        } else {
            fs.readFile(filelink, 'utf8', function(err, maintext){
                fs.readdir('./data',function(error, filelist) {
                    var list = template.list(listmode, filelist);
                    var html = template.html(title, list, 
                    `<h2>${title}</h2>${maintext}`,
                    `   <a href="/create">create</a> 
                        <a href="/update?id=${title}">update</a>
                        <!-- 주석 민감한 건 링크로 처리하면 절때로 안됨 <a href="/delete?id=${title}">delete</a> -->
                        <form action="/delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>
                    `
                    );

                    response.writeHead(200); // 잘 됐는지 
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        console.log("in create");
        fs.readdir('./data', function(error, filelist) {
                console.log(filelist);
                var title = 'Welcome';
                var maintext = 'Hello, Node.js';
                var list = template.list(listmode, filelist);
                var html = template.html(title, list, `
                    <form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="contents"></textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                `, '');
                response.writeHead(200); // 잘 됐는지 
                response.end(html);
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
        
    } else if (pathname === '/update') {
        fs.readFile(filelink, 'utf8', function(err, maintext){
            fs.readdir(`./data`,function(error, filelist) {
                console.log(queryData.id);
                console.log("log :: ");
                console.log(filelist);
                var list = template.list(listmode, filelist);
                var html = template.html(title, list, 
                    //hidden 보이진 않지만 그 id와 value를 통해 값이 가긴 한다.
                `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="contents">${maintext}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );

                response.writeHead(200); // 잘 됐는지 
                response.end(html);
            });
        });
    } else if(pathname === `/update_process`) {
        var body = '';
        request.on('data', function(data) { // post 데이터가 많으면 그냥 꺼질수도. 조각조각 수신할떄마다 얻어오는 것 
            body = body + data; // 받아올때마다 전송해받는 것 
        });
        request.on('end',function() { // 'end'는 그 조각조각 전송이 끝났다는 것
            var post = qs.parse(body);
            console.log("post :: ");
            console.log(post);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`}); // 잘 됐는지 
                    response.end('success');
                });
            });
            
        });
    } else if(pathname === `/delete_process`) {
        var body = '';
        request.on('data', function(data) { // post 데이터가 많으면 그냥 꺼질수도. 조각조각 수신할떄마다 얻어오는 것 
            body = body + data; // 받아올때마다 전송해받는 것 
        });
        request.on('end',function() { // 'end'는 그 조각조각 전송이 끝났다는 것
            var post = qs.parse(body);
            var id = post.id;
            //이 부분은 보안상 문제가 있음 
            var filteredId = path.parse(id).base; // 보안문제수정
            fs.unlink(`data/${filteredId}`, function(error) {
                response.writeHead(302, {Location: `/`}); // 잘 됐는지 
                response.end();
            })
            
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }

    
 
});
app.listen(3000);