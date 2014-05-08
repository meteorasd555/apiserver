var logger = require("../../utility/logger"),
    extFuns = require("./resFunctions"),
    nurl = require("url"),
    HttpProxy = require('./resProxy.js'),
    _ = require("underscore");

function Parser(routerObj, req, res) {
    this.req = req;
    this.res = res;
    this.parsedObject = null;

    this.resolve(routerObj);
}

Parser.prototype = {
    resolve: function(routerObj) {
        var relapath = this._replaceAnno(routerObj),
            url = "", proxy = null;

        url = nurl.format({
            protocol:this.req.protocol,
            host: this.req.headers.host
        });

       proxy = new HttpProxy(url, relapath).doProxy(this.req, this.res);
    },
    getObj: function() {
        return this.parsedObject;
    },
    _replaceAnno: function(str) {
        var annoReg = /\{\{\s*(.*?)\s*\}\}/g,    // do trim work as well
            checkNumReg = /\{\{\s*#(.*?)\s*\}\}/,
            _this = this, result;

        result =  str.replace(annoReg, function() {
            var matchedStr = arguments[0],
                originStr= arguments[3],
                stsmt = arguments[1];

               return _this._resolveStatment(stsmt.replace("#", ""), true);
        });

        return result;
    },
    /**
     * resolve the statement
     *
     * @param  {String} statment
     * @return {String}
     */
    _resolveStatment: function(statement) {
        var _this = this,
            stsmt = this._trim(statement),
            elReg = /^([_a-zA-Z]\w*\.)*[_a-zA-Z]\w*$/,
            funReg = /(^[_a-zA-Z]\w*)\s*:\s*(.*)\s*$/,
            execFunReg, funNm, args, fun, result;

        if(elReg.test(stsmt)) {
            result = this._getElValue(stsmt);
        }

        if(funReg.test(stsmt)) {
            execFunReg = funReg.exec(stsmt);
            funNm = execFunReg[1],
            args = execFunReg[2].split(",");
            args = _.map(args, function(elm){
                return _this._trim(elm);
            });

            fun = extFuns[funNm];

            if(this._isUndefined(fun)) {
                return "{{No function: [" + funNm + "] }}"
            }

            if(args.length === 1) {
                args = null;
            } 

            try {
                result = fun.apply(null, args);
            } catch (e) {
                return  "{{Error invoking functions: [" + funNm + "]." +
                " Detailed: " + e.message+" }}";
            }
        }


        return result;
    },
    _getElValue: function(key) {
        var result, ks = key.split("."), i,
            valueStack = {req: _.extend(this.req.query, this.req.body)};

        result = valueStack;

        for(i = 0;i < ks.length; i++) {
            result = result[ks[i]];
        }

        if(this._isUndefined(result)) {
            result = "{{No var: [" + key +"]}}";
        }

        return result;
     },
    _trim: function(str) {
        var trimL = /^\s+/, trimR = /\s+$/;
        return str.replace(trimL, "").replace(trimR, "");
    },
    _getType: function(unknow) {
        return Object.prototype.toString.call(unknow);
    },
    _isArray: function(unknow) {
        return (this._getType(unknow) === "[object Array]");
    },
    _isObject: function(unknow) {
        return (this._getType(unknow) === "[object Object]");
    },
    _isFunction: function(unknow) {
        return (this._getType(unknow) === "[object Function]");
    },
    _isNumber: function(unknow) {
        return (this._getType(unknow) === "[object Number]");
    },
    _isString: function(unknow) {
        return (this._getType(unknow) === "[object String]");
    },
    _isBool: function(unknow) {
        return (this._getType(unknow) === "[object Boolean]");
    },
    _isNull: function(unknow) {
        return (this._getType(unknow) === "[object Null]");
    },
    _isUndefined: function(unknow) {
        return (this._getType(unknow) === "[object Undefined]");
    }

}

module.exports = Parser;