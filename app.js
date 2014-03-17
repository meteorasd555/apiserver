var express = require('express'),
    config = require("./config").get(),
    appRouter = require('./router');

var path = require('path');
var app = express();



// all environments

app.set('views', path.join(__dirname, config.dir.views));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// 配置主服务路由
appRouter.start(app);


app.listen(config.basePort);