var Reader = require("../service/api/apiReader"),
    ResParser = require("../service/api/resObjectGen");

module.exports = function(req, res) {
    var docReader = new Reader(req.path, req), 
        docObject, docRespObj, respObj,
        resParser;

        // if error occured
        if(docReader.isError()) {
            res.send("some error");
            return;
        }

        docObject = docReader.getDocObj();
        docRespObj = docReader.getRespObj();
    
        if(docRespObj) {
            resParser = new ResParser(docRespObj, req);
            respObj = resParser.getObj();
        }

        res.json(respObj);
}