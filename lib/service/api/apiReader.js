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

        if(this.ROUTER_KEY in this.docObj) {
            this.type = 2;
            return this;
        } else {
            this.type = 1;
            return this;
        }


    } catch (e) {
        // TODO:
        this.errorInfo = e;
    }
}

Reader.prototype = {
    REQ_KEY: "req",
    RES_KEY: "res",
    ROUTER_KEY: "router",
    init: function() {

        this.type = this.TYPE_NORMAL;

        // saved doc object
        this.docObj = null;

        // error infomation
        this.errorInfo = null;

    },
    readFile: function(relpath) {
        var filePath = relpath,
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
    _chkReqParam: function() {
        var expectedReq = this.docObj[this.REQ_KEY] || {};
        // TODO: check req in docObj.req
    },
    getRouterObj: function() {
        return this.docObj[this.ROUTER_KEY];
    },
    getRespObj: function() {
        return this.docObj[this.RES_KEY];
    },
    getDocObj: function() {
        return this.docObj;
    },
    getType: function() {
        return this.type;
    },
    getErrorInfo: function() {
        return this.errorInfo.message;
    },
    isError: function() {
        return this.errorInfo !== null;
    }
}



module.exports = Reader