'use strict';
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const {getRc, setRc, getPing, getByAtrrBool, consoleLog} = require('./utils');
const {version, getLastVersion} = require('./reportInfo/index');
const help = require('./help');
const install = require('./install');
const publish = require('./publish');
const npm = require('./npm');
const sync = require('./sync');
const updateInfo = require('./updateInfo');
const update = require('./update');

function getHelp() {
	console.log(chalk.green(" Usage : "));
	console.log(chalk.green(" ac sample init sample"));
	process.exit(0);
}

function getVersion() {
	console.log(chalk.green(require("../package.json").version));
	process.exit(0);
}
function checkVersion() {
	const cVesion = require("../package.json").version;
	if(process.version.split('.')[0].replace('v', '') < 6) {
		console.log(chalk.yellow(`node version is ${process.version}`))
	}
	return version().then(res => {
		const mastVesion = cVesion.split('-')[0];
		if(!~cVesion.indexOf(res)) {
			console.log('\n');
			console.log(chalk.yellow(`YNPM-[WARNING]:Current version is ${mastVesion}, but the latest version is ${res}\n`));
			console.log(chalk.yellow(`YNPM-[WARNING]:Please use the following command to update\n`));
			console.log(chalk.green(`--------------------------------------\n`));
			console.log(chalk.green(`          npm i ynpm-tool -g\n`));
			console.log(chalk.green(`--------------------------------------\n`));
		}
	});
}

function init(fun) {
	// Ping内网
	const {Ping_Response, registry} = getPing();
	// const spinner = ora().start();

	if (Ping_Response.avg) {
		console.log(chalk.dim('Yonyou Mirror Downloading...\n'));
	} else {
		console.log(chalk.dim('npm Mirror Downloading...\n'));
	}
	return fun(registry);
}

module.exports = {
	plugin: function (options, global) {
		let commands = options.cmd;
		const argvs = process.argv;
		const fun = function(){
			switch (commands) {
				case "-h":
				case "-help":
					help.help();
					break;
				case "-v":
				case "-version":
					help.version();
					break;
				case "i":
					process.argv[2] = 'install'
					co(function* () {
						// Ping内网;
						install(yield getPing('install'), '');
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "updateInfo":
					co(function* () {
						// Ping内网;
						updateInfo(yield getPing(), '');
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "update":
					co(function* () {
						// Ping内网;
						update(yield getPing(), '');
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "install":
					co(function* () {
						// Ping内网;
						install(yield getPing(), '');
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "sync":
					console.error(chalk.red('\n' + '"sync" has been removed'));
					// co(function* () {
					// 	// Ping内网;
					// 	sync(yield getPing(), '');
					// }).catch(err => {
					// 	console.error(chalk.red('\n' + err));
					// });
					break;
				case "installdev":
					console.log(process.argv)
					//替换 installdev 成 install
					process.argv[2] = 'install'
					co(function* () {
						// Ping内网;
						install(yield getPing(), 'dev');
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "publish":
					co(function* () {
						// Ping内网;
						publish(yield getPing());
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
					break;
				case "set":
					let config = setRc("ynpm");
					break;
				case "sshk":
					let ynpmrcCon = getRc("ynpm");
					help.showSSHKMsg(ynpmrcCon.sshk);
					break;
				default:
					co(function* () {
						// Ping内网;
						npm(yield getPing());
					}).catch(err => {
						console.error(chalk.red('\n' + err));
					});
			}
		};
		checkVersion().then(() => {
			fun();
		}).catch(err => {
			fun();
		})
	}
}
