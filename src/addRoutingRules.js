'use strict';

const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const {rules} = require('./utils');
module.exports = () => {
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		const argvs = process.argv;
		const name = argvs.slice(3);
		if(name[0]) {
			yield rules(name[0]);
			spinner.stop();
		} else {
			console.error(chalk.red('\n' + 'Please enter the package name'));
		}
		process.exit(0);
	}).catch(err => {
		spinner.stop();
		console.error(chalk.red('\n' + err));
		process.exit(0);
	});
}

