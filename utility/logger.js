var log4js = require('log4js'); 

exports.info = function (info) {
    console.log("[INFO]: " + info);



}

exports.error = function (error) {
    console.log("[ERROR]:" + error);


    
}