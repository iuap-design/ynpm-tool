const path = require('path');
const spawn = require('cross-spawn');
const ora = require('ora');
const co = require('co');
const npmBin = path.join(__dirname, '..', 'node_modules', '.bin', 'npm');
const argvs = process.argv;
const env = Object.assign({}, process.env);
const CWD = process.cwd();

const stdio = [
	process.stdin,
	process.stdout,
	process.stderr,
];

module.exports = (registry) => {
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		const argv = argvs.slice(2);
		argv.push(`--registry=${registry}`);
		if (!~argv.indexOf('--save') || !~argv.indexOf('--save-dev')) {
			argv.push('--no-save');
		}
		const child = spawn(npmBin, argv, {
			env,
			cwd: CWD,
			stdio,
		});
		child.on('exit', code => {
			process.exit(code);
		});
		spinner.stop();
		process.exit(0);
	}).catch(err => {
		console.error(chalk.red('\n' + err));
	});
}

