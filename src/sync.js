'use strict';

const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const {sync} = require('./utils');
module.exports = () => {
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		let result = yield sync();
		spinner.stop();
		process.exit(0);
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}

