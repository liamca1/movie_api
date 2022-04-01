// Now, import the url module at the top of your “server.js” file.

const http = require('http'),
    fs = require('fs'),
    url = require('url');

http.createServer((request, response) => {
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
      filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
}).listen(8080);
console.log('My test server is running on Port 8080.');







// let addr = request.url;
// let q = url.parse(addr, true); // can also be written as: let q = new URL(addr, true);

// let qdata = q.query;
// console.log(qdata.documentation)


// http.createServer((request, response) => {
//   response.writeHead(200, {'Content-Type': 'text/plain'});
//   response.end('Hello Node!\n');
// }).listen(8080);

// console.log('My first Node test server is running on Port 8080.');
