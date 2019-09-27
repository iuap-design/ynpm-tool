const path = require('path');
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
        const argv = argvs.slice(2);
        argv.push(`--registry=${YON_INNER_MIRROR}`);
        const child = spawn(npmBin, argv, {
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

