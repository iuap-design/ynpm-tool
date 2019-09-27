#!/usr/bin/env node

'use strict';

let {userInfo} = require('../src/reportInfo/index');
// var argv = require('minimist')(process.argv.slice(2));
// var commands = argv._;

// userInfo();

let global = require('../src/utils');

var opts = {
	cmd: process.argv[2],
	// argv: argv,
	name: "init"
};

require("../src").plugin(opts, global);
