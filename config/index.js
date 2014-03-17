var fs = require("fs"),
    Reader = require("../utility/config-reader");

module.exports = new Reader("config/config.json");
