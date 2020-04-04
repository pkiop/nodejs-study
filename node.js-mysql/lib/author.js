var db = require('./db');
var template = require('./template.js');

exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, results) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(results);
        var html = template.HTML(title, list,
          `
          <table>
            <tr>
                <td>egoing</td>
                <td>developer</td>
                <td>update</td>
                <td>delete</td>
            </tr>
            <tr>
                <td>egoing</td>
                <td>developer</td>
                <td>update</td>
                <td>delete</td>
            </tr>
          </table>
          <style>
            table {
                border-collapse:collapse;
            }
            td{
                border:1px solid black;
            }
          </style>
          `,
          `<a href="create">create</a>`
        );
        console.log(results);
        response.writeHead(200);
        response.end(html);
    });
}