const path = require('path');
const chalk = require('chalk');
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
		const lockFile = './package-lock.json';
		const node_modules = './node_modules';
		const packageJson = require(CWD + '/package.json');
		const pkg = argvs[3];
		let result = false;
		if(packageJson){ //获取更新大包
			const test = (obj) => {
				for(let i in obj) {
					const strArr = i.split('/')
					if(strArr[0] === pkg) {
						result = true
					}
				}
			};
			test(packageJson.dependencies);
			test(packageJson.devDependencies);
		}
		fs.exists(lockFile, (exists) => {
			if(exists) {
				fs.unlinkSync(lockFile);
			}
		});
		if(pkg) {
			console.log(chalk.green(`node_modules/${pkg} will be deleted, please wait!`));
			deleteFolder(node_modules + '/' + pkg, node_modules + '/' + pkg)
		} else {
			console.log(chalk.green(`node_modules will be deleted, please wait!`));
			deleteFolder(node_modules, node_modules)
		}
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}

