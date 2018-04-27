const url = require('url');
const fs = require('fs');

function getResponse(req, cb) {
    const headers = { 'Content-Type': 'text/plain' };

    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname.substr(1);
    var urlParameters = pathname.split('/');
    var isFileRequest = (urlParameters.shift() === 'file'); 

    // All other requests should return HTTP status 404 `Not found`.
    if (!urlParameters.length || !isFileRequest) {
        let res = { headers, status: 404, message: 'Not found' };
        cb(null, res);
        return 
    }
    
    // The handler should handle two types of files - `json` and `csv`. 
    // Determine the type by the file's extension. If someone tries to send another type of file - 
    // return HTTP status 415 `Unsupported Media Type` error.
    var fileName = urlParameters.pop();
    var point = fileName.lastIndexOf('.');
    var fileExt = fileName.substr(point + 1).toLowerCase();
    if (fileExt !== 'json' && fileExt !== 'csv') {
        let res = { headers, status: 415, message: 'Unsupported Media Type' };
        cb(null, res);
        return 
    } 
    
    // `POST /file/<filename>`. Should save the request body to the separate directory 
    // (the directory should already exist) in the project directory. 
    // Don't forget about the file names with path : a request with a path `/file/path/to/file.json` 
    // should create a file in `<your_dir_to_store_files>/path/to/file.json`.
    var filesDirectory = __dirname + '\\requests';
    if (urlParameters.length) {
        urlParameters.forEach(function (dir) {
            filesDirectory = `${filesDirectory}\\${dir}`;
            try {
                fs.mkdirSync(filesDirectory);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    throw err;
                }
            }
        });
    }       
        
    // If everything is OK - return HTTP status 200
    // If a file with the name already exists - return 409 `Conflict`
    // var res = { headers, status: 200, message: '' };
    var filePath = `${filesDirectory}\\${fileName}`;
    
    var write = fs.createWriteStream(filePath, { flags: 'wx' });
    req.pipe(write);

    write.on('error',  (err) => {                
        if (err.code !== 'EEXIST') throw err;             
        let res = { headers, status: 409, message: 'Conflict' };    
        cb(null, res);       
    }); 

    write.on('close', (err) => {
        if (err) throw err;             
        let res = { headers, status: 200, message: '' };    
        cb(null, res);
    })        

    // console.log(req.method);
    // console.log(req.body);

    // console.log(parsedUrl.query.f);
    // console.log(parsedUrl.pathname);
    // res.end(parsedUrl.query.f);
}

module.exports = getResponse;