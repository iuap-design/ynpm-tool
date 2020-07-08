'use strict';

const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const {fix} = require('./utils');
module.exports = () => {
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		yield fix();
		spinner.stop();
		process.exit(0);
	}).catch(err => {
		spinner.stop();
		console.error(chalk.red('\n' + err));
		process.exit(0);
	});
}

