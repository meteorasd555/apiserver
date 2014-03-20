var _ = require("underscore");


function Parser(rootObj, req) {
    this.rootObj = null;
    this.req = req;

    this.parsedObject = this.resolve(rootObj);
}

Parser.prototype = {
    getObj: function() {
        return this.parsedObject;
    },
    resolve: function(mix) {
        var retObj = null;
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
                retObj.push(this.resolve.call(this, mix[i]));
            }
            return retObj;
        } else {
            return this._doBaseType.call(this, mix);
        }

        
    },
    _doBaseType: function(baseType) {
        if(this._isNumber(baseType) ||
             this._isBool(baseType) || 
                this._isNull(baseType) ||
                 this._isUndefined(baseType)) {
            return baseType;
        }

        if(this._isFunction(baseType)) {
            return baseType.call(this, this.req);
        }

     
       
        return baseType;
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
        var key, retObj = {};
        for(key in mix) {
            if(this._judgeCase(key)) {
                retObj = mix[key]
            }
        }
        return retObj;
    },
    _isCaseKey: function(key) {

    },
    _judgeCase: function(statement) {

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