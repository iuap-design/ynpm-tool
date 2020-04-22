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

function deleteFolder(path, allPath) {
	try{
		let files = [];
		if (fs.existsSync(path)) {
			files = fs.readdirSync(path);
			files.forEach(function (file, index) {
				let curPath = path + "/" + file;
				if (fs.statSync(curPath).isDirectory()) {
					deleteFolder(curPath);
				} else {
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	}catch(err) {
		deleteFolder(allPath, allPath)
	}
}
module.exports = () => {
	co(function* () {
		const spinner = ora().start();
		spinner.color = 'green';
		const lockFile = './package-lock.json';
		const node_modules = './node_modules';
		const packageJson = require(CWD + '/package.json');
		let q = false
		if(~argvs.indexOf('-q') || ~argvs.indexOf('--q')) {
			const index = argvs.indexOf('-q') > -1 ? argvs.indexOf('-q') : argvs.indexOf('--q')
			q = true;
			argvs.splice(index, 1)
		}
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
			console.log(chalk.green(`node_modules/${pkg} need to be deleted before reloading, please wait!`));
			deleteFolder(node_modules + '/' + pkg, node_modules + '/' + pkg)
		} else {
			console.log(chalk.green(`node_modules need to be deleted before reloading, please wait!`));
			deleteFolder(node_modules, node_modules)
		}
		let argv = argvs.slice(3);
		argv.push(`--registry=${YON_INNER_MIRROR}`);
		argv.push(`--no-save`);
		argv.unshift(`install`);
		if(result) { // 更新@mdf
			argv = ['install', `--registry=${YON_INNER_MIRROR}`, '--no-save']
		}
		if(q) {
			argv.push('-q');
			argv = ['install', `-q`, '--no-save']
		}
		spinner.stop();

		const child = spawn('ynpm', argv, {
			env,
			cwd: CWD,
			stdio,
		});
		child.on('exit', code => {
			process.exit(code);
		});
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}
