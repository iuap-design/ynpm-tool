const chalk = require('chalk');
const fs = require('fs');
const argvs = process.argv;
const ora = require('ora');
const {deleteFolder} = require('./utils');
const co = require('co');

module.exports = () => {
	co(function* () {
		const spinner = ora().start();
		spinner.color = 'green';
		const lockFile = './package-lock.json';
		const node_modules = './node_modules';
		const pkg = argvs[3];
		fs.exists(lockFile, (exists) => {
			if(exists) {
				fs.unlinkSync(lockFile);
			}
		});
		if(pkg) {
			if(fs.existsSync(node_modules + '/' + pkg)) {
				console.log('\n')
				console.log(chalk.green(`YNPM-[INFO]:node_modules/${pkg} to be deleted, please wait!`));
				deleteFolder(node_modules + '/' + pkg, node_modules + '/' + pkg)
			}
			spinner.stop();
			console.log(chalk.green(`YNPM-[INFO]:node_modules/${pkg} has been deleted!`));
		} else {
			if(fs.existsSync(node_modules)) {
				console.log('\n')
				console.log(chalk.green(`YNPM-[INFO]:node_modules to be deleted, please wait!`));
				deleteFolder(node_modules, node_modules)
			}
			spinner.stop();
			console.log(chalk.green(`YNPM-[INFO]:node_modules has been deleted!`));
		}
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}

