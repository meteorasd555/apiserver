var logger = require("../../utility/logger"),
    http = require("http"), 
    path = require("path"),
    url = require("url"),
    qs = require("qs"),
    stream = require('stream'),
    _ = require("underscore");

var mime = {
    // returns MIME type for extension, or fallback, or octet-steam
    lookupExtension: function(ext, fallback) {
        return mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
    },

    // List of most common mime-types, stolen from Rack.
    TYPES: {
        ".css": "text/css",
        ".gif": "image/gif",
        ".htm": "text/html",
        ".html": "text/html",
        ".ico": "image/vnd.microsoft.icon",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png"

    }
};

function Proxy(host, path) {
    var urlInfo = url.parse(host);

    this.targetHostNm = urlInfo.hostname;
    this.targetPort = urlInfo.port;
    this.path = path || "";
}

Proxy.prototype = {

    doProxyPipe: function(req, res) {
        var op = this._getOptionsAndParam(req, res),
            contentType = mime.lookupExtension(path.extname(req.path), "text/html"),
            options = op[0],
            reqBody = op[1];

            var reqProxy = http.request(options, function(resProxy) {
                res.setHeader("Content-Type", contentType);
                resProxy.pipe(res);
                resProxy.on('end', function (chunk) {                
     
                });
              
                resProxy.on('error', function (error) {
                    logger.error("Invoke doProxyPipe error, path: " + reqBody);
                });
            });

            reqProxy.on("error",function(error){
                logger.error("Invoke doProxyPipe error, path: " + reqBody);
            })

            reqProxy.write(reqBody);
            reqProxy.end();

    },
    doProxy: function(req, res, callback) {

        var op = this._getOptionsAndParam(req, res),
            contentType = mime.lookupExtension(path.extname(req.path), "text/html"),
            options = op[0],
            reqBody = op[1],
            body = "";


            var reqProxy = http.request(options, function(resProxy) {
                res.setHeader("Content-Type", contentType);
                resProxy.on('end', function (chunk) {  
                   callback(body);              
                });
                resProxy.on('data', function (chunk) {          
                   body += chunk;
                });
                resProxy.on('error', function (error) {
                    logger.error("Invoke doProxy error, path: " + options.path);
                });
            });

            reqProxy.on("error",function(error){
                logger.error("Invoke doProxy error, path: " +  options.path);
            })


            reqProxy.write(reqBody);
            reqProxy.end();
            
     
    },
    _getOptionsAndParam: function(req, res) {
        var me = this,
            reqBody = qs.stringify(req.body),
            headers = req.headers,
            options;

            options = {
                host: this.targetHostNm,
                path: this.path || req.path,
                port: this.targetPort,
                method: req.method,
                headers: headers
            };

        return [options, reqBody];
    }
  
}

module.exports = Proxy;