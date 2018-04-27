const http = require('http');
const getResponse = require('./fileRequests');

const server = new http.Server;

server.listen(3001, '127.0.0.1');

server.on('request', function (req, res) {
    var response = getResponse(req, (err, response) => {
        res.writeHead(response.status, response.headers);
        res.end(response.message);
    });
    // console.log(response);
    // if (response) {
    //     res.writeHead(response.status, response.headers);
    //     res.end(response.message);
    // }
})