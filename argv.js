'use strict'

const os = require('os');
const fs = require('fs');
const program = require('commander');
const config = require('./config');
const pkg = require('./package.json');
// const help = require('./help');

let argv = null;

module.exports = cmd => {
    if(!argv) {
        argv = program
            .option('-v,--version', 'show full versions')
            .option('-r, --registry [registry]', 'registry url, default is ' + config.cnpmRegistry)
    }
}
