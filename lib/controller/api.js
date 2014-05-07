var Reader = require("../service/api/apiReader"),
    ResParser = require("../service/api/resObjectGen"),
    RouterParser = require("../service/api/resByDisp"),
    config = require("../config").get(),
    fs = require("fs"),
    path = require("path"),
    logger = require("../utility/logger");
module.exports = function(req, res) {
    var docReader, extName, dsonPath,
        docObject, docRespObj, docRouterObj, respObj,
        resParser;

        dsonPath = path.join(config.apiDoc, req.path) + "." + config.apiDocExt;
        stringifyPath = path.join(config.apiDoc, req.path) + "." + config.stringifyDocExt;

        if(!fs.existsSync(dsonPath)) {

            if(fs.existsSync(stringifyPath)) {
                res.send(fs.readFileSync(stringifyPath).toString());

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
                    logger.error("Error while parse Response in file: " + req.path)
                }
            }

            res.json(respObj);
            return;
        }

        if(docReader.getType() == 2) {
          
            docRouterObj = docReader.getRouterObj(); 
            resParser = new RouterParser(docRouterObj, req, function(respStr) {
                if(respStr == null) {
                    logger.error("Error while parse Response in file: " + req.path)
                }
                res.setHeader("Content-Type", "application/json");
                res.send(respStr);
            }); 
        
            return;
        }

}