const { spawn } = require("child_process");
const path = require('path');
let diskusage = require('diskusage-ng');
let fs = require('fs');
let _Logs = require('./Logs');
let _ChiaApi = require('./ChiaApi');
let dateFormat = require("dateformat");

class Creator {

}

module.exports = new Creator();