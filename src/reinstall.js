const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const ora = require('ora');
const argvs = process.argv;
const fs = require('fs');
const env = Object.assign({}, process.env);
const CWD = process.cwd();
const {YON_INNER_MIRROR} = require('./utils');
const co = require('co');
const stdio = [
	process.stdin,
	process.stdout,
	process.stderr,
];


module.exports = () => {
	co(function* () {
		const spinner = ora().start();
		spinner.color = 'green';
		const delArgv = argvs.map(item => item === 'rei' ? 'del' : item)
		delArgv.push('-no-check')
		const delChild = spawn('ynpm', delArgv, {
			env,
			cwd: CWD,
			stdio,
		});
		delChild.on('exit', code => {
			process.exit(code);
		});
		let argv = argvs.slice(3);
		argv.push(`--registry=${YON_INNER_MIRROR}`);
		argv.push(`--no-save`);
		argv.push(`-no-check`);
		argv.unshift(`install`);
		if(result) { // 更新@mdf
			argv = ['install', `--registry=${YON_INNER_MIRROR}`, '--no-save', `-no-check`]
		}
		if(q) {
			argv.push('-q');
			argv = ['install', `-q`, '--no-save', `-no-check`]
		}
		spinner.stop();
		const installChild = spawn('ynpm', argv, {
			env,
			cwd: CWD,
			stdio,
		});
		installChild.on('exit', code => {
			process.exit(code);
		});
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}
