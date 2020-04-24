const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const request = require('request');
const ora = require('ora');
const spawn = require('cross-spawn');
const npmBin = path.join(__dirname, '..', 'node_modules', '.bin', 'npm');
const argvs = process.argv;
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
		const pkg = argvs[3]
		const arr = pkg.split('@');
		let str = "";
		let file = "";
		if(arr.length === 2) {
			str = '/' + arr[0] + '/-/' + arr[0] + '-' +arr[1] + '.tgz'
			file = arr[0] + '-' +arr[1] + '.tgz'
		} else {
			const name = arr[1].split('/')[1];
			str = '/@' + arr[1] + '/-/' + name + '-' +arr[2] + '.tgz'
			file = name + '-' +arr[2] + '.tgz'
		}
		let stream = fs.createWriteStream('./' + file);
		request(YON_INNER_MIRROR + str).pipe(stream).on("close", (err) =>{
			if(err) {
				return console.error(chalk.red('\n' + err));
			}
		})
		spinner.stop()
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}

