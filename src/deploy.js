'use strict';

const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const fs = require('fs');
const fetch = require('node-fetch');
const formData = require('form-data');
const {getHttpConfig} = require('./utils');

function deploy(path, environment, project) {
	try {
		let form = new formData();
		if (fs.existsSync(path)) {
			form.append("file", fs.createReadStream(path));
			form.append("environment", environment);
			form.append("project", project);
			console.log(chalk.green('Deploy start..., Please wait upload!'));
			return fetch(getHttpConfig().host + '/ynpm/deploy', {method: 'post', body: form})
				.then(res => res.json())
				.then((res) => {
					if (res.success) {
						console.log('\n')
						console.log(chalk.green('Deploy success!'));
						console.log(chalk.green('CDN URL: ' + res.data));
					} else {
						console.log('\n')
						console.log(res.msg);
					}
				}).catch(err => {
					console.log('\n');
					console.log(err);
				})
		} else {
			console.log('\n')
			console.log(chalk.red('[ERROR]:Static file path exception, Please check!'));
			return new Promise((reslove) => reslove());
		}
	} catch (err) {
		console.log(chalk.dim(err));
		return new Promise();
	}
}

module.exports = () => {
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		const argvs = process.argv.slice(3);
		const environment = argvs[1];
		const project = argvs[0];
		const path = argvs[2];
		if (environment && project && path) {
			yield deploy(path, environment, project);
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

