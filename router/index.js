var nPath = require("path"),
    controllerPath = require("../config").get("dir.controller"),
    Reader = require("../utility/config-reader"),
    logger = require("../utility/logger");

var staticRouterMap = new Reader("router/staticRouters"),
    basePath = nPath.join("../", controllerPath),
    routeRule = require("../config").get("routeRules");


var router = {
    res: null,
    req: null,
    invokingInfo: {},
    _setInvokingInfo: function(moduleLoc, methodNm) {
        this.invokingInfo.mo = moduleLoc;
        this.invokingInfo.me = methodNm;
    },
    start: function(app) {
        var _this = this, path;
        app.all("*", function (req, res, next) {
            _this.req = req;
            _this.res = res;
            path = req.path;
            if(path in staticRouterMap) {
                _this._dispatchStatic(nPath.join(basePath, 
                    staticRouterMap[path]));
            } else {
                _this._dispatch(path);
            }

        });
    },
    _dispatch: function(dest, req, res) {
        var  invoker, 
             subPathL = dest.match(/\//g).length;

        try {
            switch (routeRule) {
                case "p":
                    invoker = this._loadPath(dest);
                break;
                case "p/m":
                default:
                    if(subPathL == 1) {
                        invoker = this._loadPath(dest);
                    } else {
                        invoker = this._loadPathMethod(dest);
                    }
                break;
            }
        } catch (e) {
            return;
        }

        this._doInvoke(invoker);
    },
    _doInvoke: function(invoker) {
        var invokingInfo = JSON.stringify(this.invokingInfo);
        if(typeof invoker !== "function") {
            this._dispatchError("Can not invoke: " + invokingInfo);
        } else {
            invoker.call(null, this.req, this.res);
            logger.info("invoking: " + invokingInfo)
        }
    },
    _loadPath: function(dest) {
        var moduleLoc = nPath.join(basePath, dest),
            invoker;
        try {
            invoker = require(moduleLoc);
        } catch (e) {
            this._dispatchError("Can not find module" + moduleLoc, e);
        }
        this._setInvokingInfo(moduleLoc, null);
        return invoker;
    },
    _loadPathMethod: function(dest) {
       var mmInfo = getModuleMethod(dest),
           module, invoker, moduleLoc = nPath.join(basePath, 
           mmInfo.moduleLoc)

        try {
            module = require(moduleLoc);
        } catch (e) {
            this._dispatchError("Can not find module" + moduleLoc, e);
        }

        this._setInvokingInfo(mmInfo.moduleLoc, mmInfo.method);
        return module[mmInfo.method];

        function getModuleMethod(dest) {
            var lastSlashIndex = dest.lastIndexOf("/");
            return {
                method: dest.substr(lastSlashIndex + 1),
                moduleLoc: dest.substr(0, lastSlashIndex)
            }

        }
    },
    _dispatchStatic: function(dest, req, res) {
        var action = require(dest);
        console.log(action)
    },
    _dispatchError: function(errInfo, e) {
        logger.error(errInfo, e);
        this.res.send("error has occured");
        throw new Error()
    }
}


module.exports = router;