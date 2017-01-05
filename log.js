"use strict";
var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: "file",
            filename: __dirname+"/log/log.txt",
            category: [ 'cheese','console' ]
        },
        {
            type: "console"
        }
    ],
    replaceConsole: true
});
log4js.loadAppender('file');
var logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
module.exports = {
    logger:logger
}