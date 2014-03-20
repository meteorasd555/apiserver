var logger = require("../../utility/logger"),
    _ = require("underscore");

function Parser(rootObj, req) {
    this.rootObj = null;
    this.req = req;

    this.parsedObject = this.resolve(rootObj);
}

Parser.prototype = {
    iStack: [],
    getObj: function() {
        return this.parsedObject;
    },
    resolve: function(mix) {
        var retObj = null;
        try {

            if(this._isObject(mix)) {
                retObj = {};

                // case statements
                if(this._isCase(mix)) {
                    mix = this._doCase.call(this, mix);
                    return mix;
                }

                // no case statements
                for(key in mix) {
                    retObj[key] = this.resolve.call(this, mix[key]);
                }

                return retObj;
            } else if (this._isArray(mix)) {
                retObj = [];

                for(i = 0; i < mix.length; i++) {
                    if(this._isString(mix[i]) && this._isRepeat(mix[i])) {
                        retObj = retObj.concat(this._doRepeat(mix[i + 1], 
                            this._isRepeat(mix[i])));
                        i++;
                    } else {
                        retObj.push(this.resolve.call(this, mix[i]));   
                    }
                }

                return retObj;
            } else {
                return this._doBaseType.call(this, mix);
            }

        } catch (e) {
            logger.error(e);
            this.parsedObject = null;
        }
    },
    _doBaseType: function(baseType) {
        // return value directly
        if(this._isNumber(baseType) ||
             this._isBool(baseType) || 
                this._isNull(baseType) ||
                 this._isUndefined(baseType)) {
            return baseType;
        }

        if(this._isFunction(baseType)) {
            return baseType.call(null, this.req, this._getIteratInfo());
        }

        if(this._isString(baseType)) {
           
        }
     
       
        return baseType;
    },
    /**
     * get iteration infom
     * if no key pass will return merged object 
     * else will return number directly
     *
     * @param  {String} key
     * @return {String/Object}
     */
    _getIteratInfo: function(key) {
        var i, l = this.iStack.length, index = 0, iterInfo = {};
        if(!key) {
            for(i = 0; i < l; i++) {
                iterInfo = _.extend(iterInfo, this.iStack[i]);
            }
            return iterInfo;
        } else {
            for(i = 0; i < l; i++) {
                index = this.iStack[i][key];
            }
            return index;
        }

    },
    _isRepeat: function(key) {
        var key = this._trim(key),
            expReg = /^{(.*)}$/, repeatRep = /repeat\:(.*)/,
            statement;

        if(expReg.test(key)) {

            statement = expReg.exec(key)[1];
            statement = this._trim(statement);
            
            if(repeatRep.test(statement)) {
                return repeatRep.exec(statement)[1];
            } else {
                return false;
            }

        } else {
            return false;
        }
    },
    _doRepeat: function(mix, statement) {
        var repeatInfo = this._getRepeatInfo(statement),
            ar = [], key = repeatInfo.key, 
            times = repeatInfo.times,
            stackInfo = {};

        stackInfo[key] = 0;

        // push current iteration info into stack
        this.iStack.push(stackInfo);

        for(var i = 0;i < times;i++) {
            stackInfo[key] = i;
            ar.push(this.resolve(mix));
        }

        // pop current iteration info into stack
        this.iStack.pop();

        return ar;
    },
    _getRepeatInfo: function(statement) {
        var ar = statement.split(","),
            times, key = "", trim = this._trim;

            // trim 
            ar = _.map(ar, function(elm){
                return trim(elm);
            });

            times = isNaN(ar[0]) ? 0 : Number(ar[0]);
            key = this._isValidVarNm(ar[1]) ? ar[1] : "i";
  
        return {
            times: times,
            key: key
        }

    },
    _isValidVarNm: function(str) {
        var reg = /^[_a-zA-Z]\w*/;
        return reg.test(str);
    },
    _isCase: function(mix) {
        var key;
        for(key in mix) {
            if(this._isCaseKey(key)) {
                return true;
            }
        }
    },
    _doCase: function(mix) {
        var key, retObj = {}, jsStatement;
        for(key in mix) {
            jsStatement = this._isCaseKey(key);
            if(jsStatement && this._judgeCase(jsStatement)) {
                retObj = this.resolve(mix[key]);
            }
        }
        return retObj;
    },
    _isCaseKey: function(key) {
        var key = this._trim(key),
            expReg = /^{(.*)}$/, caseRep = /case\:(.*)/,
            statement;

        if(expReg.test(key)) {
            statement = expReg.exec(key)[1];
            statement = this._trim(statement);
            
            if(caseRep.test(statement)) {
                return caseRep.exec(statement)[1];
            } else {
                return false;
            }

        } else {
            return false;
        }
    },
    _judgeCase: function(jsStatement) {
        return this._doEvalWithEnv(jsStatement);  
    },
    _doEvalWithEnv: function(jsStatement) {
        var req = this.req, result;
        try {
            result = eval(jsStatement);
            return !!result;
        } catch (e) {
            logger.error("Can not do eval: " + jsStatement, e);
            throw e;
        }
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