const path = require('path');
const spawn = require('cross-spawn');
const npmBin = path.join(__dirname, '..', 'node_modules', '.bin', 'npm');
const argvs = process.argv;
const env = Object.assign({}, process.env);
const CWD = process.cwd();
const stdio = [
    process.stdin,
    process.stdout,
    process.stderr,
];

module.exports = () => {
    const child = spawn(npmBin, argvs.slice(2), {
        env,
        cwd: CWD,
        stdio,
    })
    child.on('exit', code => {
        process.exit(code);
    });
}

