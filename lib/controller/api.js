var Reader = require("../service/api/apiReader"),
    ResParser = require("../service/api/resObjectGen"),
    RouterParser = require("../service/api/resObjectByDisp"),
    config = require("../config").get(),
    HttpProxy = require('../service/api/resProxy.js'),
    fs = require("fs"),
    path = require("path"),
    logger = require("../utility/logger");

module.exports = function(req, res) {
    var docReader, extName, dsonPath, relativePath,
        docObject, docRespObj, docRouterObj, respObj,
        resParser, proxy;
        logger.info("Request Start: " + req.path);


        relativePath = req.path;
        absolutePath = path.join(config.apiDoc, relativePath);


        dsonPath =  absolutePath.replace(/\\$/g,"") + "." + config.apiDocExt;
        stringifyPath = absolutePath.replace(/\\$/g,"") + "." + config.stringifyDocExt;

        if(!fs.existsSync(dsonPath)) {

            if(fs.existsSync(stringifyPath)) {
                res.send(fs.readFileSync(stringifyPath).toString());
            } else if (config.static_host) {
                proxy = new HttpProxy(config.static_host);
                proxy.doProxy(req, res);
            } else {
                res.send("no such dir");
            }
           
           return;
        }
    
        docReader = new Reader(dsonPath, req);

        // if error occured
        if(docReader.isError()) {
            res.send(docReader.getErrorInfo());
            return;
        }

        docObject = docReader.getDocObj();


        if(docReader.getType() == 1) {
       
            docRespObj = docReader.getRespObj();

            if(docRespObj) {
                resParser = new ResParser(docRespObj, req);
                respObj = resParser.getObj();
                if(respObj == null) {
                    logger.error("Error while parse Response in file: " + relativePath)
                }
            }

            res.json(respObj);
            return;
        }

        if(docReader.getType() == 2) {
       
            docRouterObj = docReader.getRouterObj(); 
            resParser = new RouterParser(docRouterObj, req, res); 
        
            return;
        }

}