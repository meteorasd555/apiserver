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

    doProxy: function(req, res) {
        var me = this,
            contentType = mime.lookupExtension(path.extname(req.path), "text/html"),
            reqBody = qs.stringify(req.body),
            headers = req.headers,
            options;

            headers["Content-Length"] = reqBody.length;
            options = {
                host: this.targetHostNm,
                path: this.path || req.path,
                port: this.targetPort,
                method: req.method,
                headers: headers
            };
               
            var reqProxy = http.request(options, function(resProxy) {
                res.setHeader("Content-Type", contentType);
                resProxy.pipe(res);
                resProxy.on('end', function (chunk) {                
                   res.end();
                });
              
                resProxy.on('error', function (error) {
                    logger.error("Invoker http request error path: " + url);
                });
            });

            reqProxy.on("error",function(error){
  
                logger.error("Invoker http request error path: " + url);
            })

            reqProxy.write(reqBody);
            reqProxy.end();

    }
  
}

module.exports = Proxy;