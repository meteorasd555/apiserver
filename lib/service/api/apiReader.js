var config = require("../../config").get(),
    path = require("path"), 
    logger = require("../../utility/logger"),
    _ = require("underscore"),
    fs = require("fs");

function Reader(relpath, req) {
   
    // keep original request object
    this.req = req;

    // initialization
    this.init();

    try {  
        // read file
        this.readFile(relpath);

        // check if the passed parameter
        // is the same as listed in doc
        this._chkReqParam();

        // do resolve doc object
        this._resolveDocObj();

    } catch (e) {
        // TODO:
        this.errorInfo = e;
    }
}

Reader.prototype = {
    REQ_KEY: "req",
    RES_KEY: "res",
    init: function() {

        // saved doc object
        this.docObj = null;

        // error infomation
        this.errorInfo = null;

    },
    readFile: function(relpath) {
        var filePath = path.join(config.apiDoc, relpath) + ".js",
            fileData, docObj;

        this.init();

        try {
            fileData = fs.readFileSync(filePath);
        } catch (e) {
             logger.warn("Can not read api doc: " + filePath , e);
             throw e;
        }

        try {
            this.docObj = (new Function("","return "+ fileData.toString()))()
        } catch (e) {
             logger.error("Doc file : " + filePath + " invalid", e);
             throw e;
        }

    },
    _resolveDocObj: function() {
        var rootObj, parseObj;
        if(typeof this.docObj[this.RES_KEY] === "undefined") {
            throw new Error("No property [" + this.RES_KEY + "] in doc file: " + this.filePath);
        }
   
    },
    _chkReqParam: function() {
        var expectedReq = this.docObj[this.REQ_KEY] || {};
        // TODO: check req in docObj.req
    },
    getRespObj: function() {
        return this.docObj[this.RES_KEY];
    },
    getDocObj: function() {
        return this.docObj;
    },
    getErrorInfo: function() {
        return this.errorInfo;
    },
    isError: function() {
        return this.errorInfo !== null;
    }
}



module.exports = Reader