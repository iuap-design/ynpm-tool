const chalk = require('chalk');
const spawn = require('cross-spawn');
const ora = require('ora');
const argvs = process.argv;
const env = Object.assign({}, process.env);
const CWD = process.cwd();
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
		let delArgv = argvs.slice(2);
		let q = false;
		if(argvs.indexOf('-q') > -1 || argvs.indexOf('--q') > -1) {
			q = true
		}
		if(q) {
			if(delArgv.indexOf('-q')) {
				delArgv.splice(delArgv.indexOf('-q'), 1)
			} else {
				delArgv.splice(delArgv.indexOf('--q'), 1)
			}
		}
		delArgv = delArgv.map(item => item === 'rei' ? 'del' : item);
		const packageJson = require(CWD + '/package.json');
		const pkg = argvs[3];
		delArgv.push('-no-check');
		const delChild = spawn('ynpm', delArgv, {
			env,
			cwd: CWD,
			stdio,
		});
		delChild.on('exit', code => {
			if(code !== 0) {
				process.exit(code);
			}
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
			let argv = ['install', '--no-save', `-no-check`];
			if(q) {
				argv.push('-q');
			}
			spinner.stop();
			const installChild = spawn('ynpm', argv, {
				env,
				cwd: CWD,
				stdio,
			});
			installChild.on('exit', code2 => {
				process.exit(code2);
			});
		});
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}
