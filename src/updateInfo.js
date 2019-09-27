'use strict';

const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const co = require('co');
const moment = require('moment');
const chalk = require('chalk');
const {userInfo, setPackage} = require('./reportInfo/index');
const {getRc, HOST_REGISTRY, getPckParams, replaceErrMsg, getIPAdress, uploadReadme} = require('./utils');
const help = require('./help');

const IP_Req = thunkify(request);
const Exec = thunkify(exec);

module.exports = (registry) => {
	const argvs = process.argv;
	const ip = getIPAdress();
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		if (argvs[2] == 'updateInfo') {
			var ynpmConfig = getRc("ynpm");
			ynpmConfig.sshk = ynpmConfig._auth;
			var packOrigin = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
			//validate user rolse
			let data = yield userInfo(packOrigin.name);
			if (!data) {
				help.setConfig();
				spinner.stop();
				process.exit(0);
			} else if (data === 'NO PERMISSION') {
				console.log('\n');
				console.log(chalk.red('[ERROR] NO PERMISSION!'));
				console.log(chalk.red('[ERROR] Please contact the package administrator!'));
				spinner.stop();
				process.exit(0);
			}

			if (ynpmConfig.user && ynpmConfig.sshk && data) {
				spinner.text = 'Update package information...';
				let params = getPckParams(packOrigin);
				let pckMsg = yield setPackage({
					ip,
					userId: data.user_id,
					name: params.name,
					author: ynpmConfig.user,
					version: params.version,
					last_auth: ynpmConfig.user,
					last_time: moment().format('YYYY-MM-DD hh:mm:ss'),
					packageInfo: escape(JSON.stringify(params))
				});
				try {
					let result = yield uploadReadme(params.name);
				} catch (e) {
					console.log('\n');
					console.log(chalk.yellow(`[WARN]Update success, but upload README.md file fail`));
				}
				console.log(chalk.green(`√ Finish, Thanks for the update !`));
			} else {
				console.error("Error: Cant Find User, Please Use `npm set user=xxx && npm set email=xxx` or Contact Admin to Create User!");
			}
		}
		spinner.stop();
		process.exit(0);
	}).catch(err => {
		console.error(chalk.red('\n' + replaceErrMsg(err, HOST_REGISTRY)));
	});
};

