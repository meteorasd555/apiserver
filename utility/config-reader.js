var fs = require("fs"), 
    _ = require("underscore"),
    logger = require("../utility/logger");

var Reader = function(filepPath) {
    this.filePath = filepPath;
    this.configJson = null;
    this.hasCached = false;
}

/**
 * get config file content, 
 * if has cached return the cached config
 *
 * @param  {Object} obj
 * @param  {String} key
 * @return {String}
 */
Reader.prototype.get = function(key) {
    key = key || "";
    if(this.hasCached) {
        return this._resolveKey(this.configJson, key);
    }

    return this.getFresh(key);

}

/**
 * get config file content, 
 * cache it and invoke get method
 *
 * @param  {Object} obj
 * @param  {String} key
 * @return {String}
 */
Reader.prototype.getFresh = function(key) {
    var _this = this, config;
    key = key || "";
    try {
        buffer = fs.readFileSync(this.filePath);
        this.configJson = JSON.parse(buffer.toString());
        this.hasCached = true;
        return this.get(key);
    } catch (e) {
        logger.error(e);
    }
}

/**
 * return the obj[key]
 * also accept special key like "a.b" return ojb[a][b]
 *
 * @param  {Object} obj
 * @param  {String} key
 * @return {String}
 */
Reader.prototype._resolveKey = function(obj, key) {
    var pathTree, deepObj = obj;
    if(key == "") {
        return deepObj;
    }

    pathTree = key.split(".");
    _.each(pathTree, function (subPath) {
        deepObj = deepObj[subPath]
    }); 

    return deepObj;
}

module.exports = Reader;