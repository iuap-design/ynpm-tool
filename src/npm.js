const path = require('path');
const spawn = require('cross-spawn');
const npmBin = path.join(__dirname, '..', 'node_modules', '.bin', 'npm');
const argvs = process.argv;
const env = Object.assign({}, process.env);
const CWD = process.cwd();
const {HOST_REGISTRY} = require('./utils');

const stdio = [
    process.stdin,
    process.stdout,
    process.stderr,
];

module.exports = () => {
    const argv =  argvs.slice(2);
    argv.push(`--registry=${HOST_REGISTRY}`);
    const child = spawn(npmBin, argv, {
        env,
        cwd: CWD,
        stdio,
    })
    child.on('exit', code => {
        process.exit(code);
    });
}

