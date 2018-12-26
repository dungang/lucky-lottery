"use strict";
var log4js = require('log4js');
log4js.configure({
    "appenders": {
        cheese: {
            "type": "file",
            "filename": __dirname + "/log/log.txt"
        }
    },
    categories: {
        default: {
            appenders: ['cheese'],
            level: 'info'
        }
    },
    "replaceConsole": true,

});
//log4js.loadAppender('file');
var logger = log4js.getLogger('cheese');
module.exports = {
    logger: logger
}