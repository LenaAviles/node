const http = require('http');
const fileRequests = require('./fileRequests');

const server = new http.Server;

server.listen(3001, '127.0.0.1');

server.on('request', function (req, res) {
    var getResponse = getHandler(req.method);

    var response = getResponse(req, (err, response) => {
        res.writeHead(response.status, response.headers);
        res.end(response.message);
    });   
})

function getHandler(method) {
    switch(method) {
        case 'POST':
            return fileRequests.post;
        default:
            return fileRequests.default;
    }
}