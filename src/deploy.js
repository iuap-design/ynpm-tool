'use strict';

const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const fs = require('fs');
const fetch = require('node-fetch');
const formData = require('form-data');
const {YNPM_SERVER_DEPLOY, getRc} = require('./utils');

function deploy(path, environment, project, sshk) {
	try {
		let form = new formData();
		if (fs.existsSync(path)) {
			form.append("file", fs.createReadStream(path));
			form.append("environment", environment);
			form.append("project", project);
			form.append("sshk", sshk);
			console.log(chalk.green('Deploy start..., Please wait upload!'));
			return fetch(YNPM_SERVER_DEPLOY + '/ynpm/deploy', {method: 'post', body: form})
				.then(res => res.json())
				.then((res) => {
					if (res.success) {
						console.log('\n')
						console.log(chalk.green('Deploy success!'));
						console.log(chalk.green('CDN URL: ' + res.data));
					} else {
						console.log('\n')
						console.log(chalk.red('[ERROR]:' + res.data));
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
		const ynpmConfig = getRc("ynpm");
		const argvs = process.argv.slice(3);
		let project,path,sshk;
		let environment = process.env.LOG_INSTANCE_ID.split('-')[0]
		argvs.map(item => {
			if(~item.indexOf('-project=') || ~item.indexOf('--project=')) {
				project = item.split('=')[1]
			}
			if(~item.indexOf('-env=') || ~item.indexOf('--env=') && !env) {
				environment = item.split('=')[1]
			}
			if(~item.indexOf('-path=') || ~item.indexOf('--path=')) {
				path = item.split('=')[1]
			}
			if(~item.indexOf('-sshk=') || ~item.indexOf('--sshk=')) {
				sshk = item.split('=')[1]
			}
		})
		sshk = sshk || ynpmConfig.sshk
		if (environment && project && path && sshk) {
			yield deploy(path, environment, project, sshk);
			spinner.stop();
		} else {
			console.error(chalk.red('\n' + 'Please input related content'));
		}
		process.exit(0);
	}).catch(err => {
		spinner.stop();
		console.error(chalk.red('\n' + err));
		process.exit(0);
	});
}

