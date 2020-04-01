module.exports = {
    html: function(title, data_list, body, control) {
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
              ${control}
              ${body}
            </body>
            </html>
            `;
    },

    list : function(listmode, filelist) {
        var data_list = `<${listmode}>`;
        var i = 0;
        while(i < filelist.length) {
            data_list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
            i = i + 1;
        }
        data_list += `</${listmode}>`
        return data_list;
    }
}

