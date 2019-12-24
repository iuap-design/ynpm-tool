'use strict';
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const childProcess = require('child_process')
const exec = childProcess.exec;
const thunkify = require("thunkify");
const Exec = thunkify(exec);
var spawn = require('cross-spawn')
const {replaceErrMsg} = require('./utils');
const {addDownloadNum, packageDownloadDetail} = require('./reportInfo/index');

function countStrLeng(str, subStr) {
	let strs = str.split('');
	let count = 0;
	strs.forEach(st => {
		if (st == subStr) {
			count++;
		}
	})
	return count;
}

function console_log(ifHasLog, msg) {
	if (ifHasLog == 'dev') {
		console.log(msg)
	}
	return
}

function getResultPkgs(paramArr) {
	let obj = {}
	paramArr.forEach((item) => {
		let temp = item.replace(/\+\s+/, '').trim()
		let index = temp.lastIndexOf('@')
		obj[temp.slice(0, index)] = '^' + temp.slice(index + 1)
	})
	return obj;
}


module.exports = (registry, ifHasLog) => {
	const argvs = process.argv;
	const pkgPath = path.join(process.cwd(), 'package.json');
	let _pack = [];
	let pkgJson = {};
	if (fs.existsSync(pkgPath)) {
		pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	}
	let _package;
	let commIndex = argvs.findIndex(comm => comm == "--save");
	let aliasCommIndex = argvs.findIndex(comm => comm == "-S");
	let devCommIndex = argvs.findIndex(comm => comm == "--save-dev");
	let aliasDevCommIndex = argvs.findIndex(comm => comm == "-D");
	let globalCommIndex = argvs.findIndex(comm => comm == "-g");
	let commLeng = argvs.length - 1;
	if (argvs.length !== 3 && !~commIndex && !~devCommIndex && !~aliasCommIndex && !~aliasDevCommIndex && !~globalCommIndex) {
		//no --save -S --save-dev -D -g
		console_log(ifHasLog, 'npm install xx');
		_package = argvs.slice(3, commLeng + 1);
		_pack = getPackMsg(_package);
	} else if (commIndex == commLeng || devCommIndex == commLeng || aliasCommIndex == commLeng || aliasDevCommIndex == commLeng || globalCommIndex == commLeng) {//npm install   xx  --save
		console_log(ifHasLog, 'npm install   xx  --save ')
		_package = argvs.slice(3, commLeng)
		_pack = getPackMsg(_package)
	} else if (commIndex == 3 || devCommIndex == 3 || aliasCommIndex == 3 || aliasDevCommIndex == 3 || globalCommIndex == 3) {//npm install --save  xx
		console_log(ifHasLog, 'npm install --save  xx')
		_package = argvs.slice(4, commLeng + 1)
		_pack = getPackMsg(_package)
	} else if (argvs.length == 3 && argvs[2] == "install") {//npm install
		//ynpm install 命令
		try {
			console_log(ifHasLog, 'npm install')
			let dependencies = {};
			pkgJson.dependencies = pkgJson.dependencies || {}
			pkgJson.devDependencies = pkgJson.devDependencies || {}
			dependencies = Object.assign(pkgJson.dependencies, pkgJson.devDependencies);
			Object.keys(dependencies).forEach(name => {
				_pack.push({name: name, version: dependencies[name]})
			})
		} catch (e) {
			console.error(chalk.red('\n package.json is not de find !'));
		}
	}
	const spinner = ora().start();
	spinner.color = 'green';
	// HOST_REGISTRY
	let allInner = installValidate(_pack, spinner);//内网缓存中下载
	let pkgs = _pack
	co(function* () {
		const argvs = process.argv;
		const argv_part = argvs.slice(2).join(' ');
		console_log(ifHasLog, 'process.argv', process.argv)
		console_log(ifHasLog, 'arg_install')
		let resultInstall = yield npminstall(argv_part, registry);
		//如果报错就不进行下去
		if (resultInstall.status !== 0) {
			stop(spinner, resultInstall.status);
			return
		}
		let formatResult

		let tempPkgs = {}
		yield addDownloadNum({installPackMap: JSON.stringify(pkgs)})
		yield packageDownloadDetail(JSON.stringify(formatResult))
		console.log('\n')
		console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
		stop(spinner);
	}).catch(err => {
		console.error(chalk.red('\n' + replaceErrMsg(err, registry)));
		stop(spinner);
	});
}


function getPackMsg(_pack) {
	let _package = [];
	_pack.forEach(pa => {
		let count = countStrLeng(pa, "@");
		let obj = {name: "", version: "latest"};
		let _pas = pa.split("@");
		if (count == 2) {
			obj.name = "@" + _pas[1];
			obj.version = _pas[2];
		} else {
			let ind = pa.indexOf("@");
			if (ind == -1) {
				obj.name = pa;
			} else {
				obj.name = (ind == 0 ? "@" + _pas[1] : _pas[0]);
				obj.version = ind == 0 ? "latest" : _pas[1];
			}
		}
		_package.push(obj)
	})
	return _package
}

function stop(spinner, code = 0) {
	if (!spinner) return;
	spinner.stop();
	process.exit(code);
}

/**
 * npm install validate after
 * @param {*} pkgs  package object
 * @param {*} registry  url
 */

function installValidate(pkgs, spinner) {
	if (pkgs && pkgs.length < 1) {
		console.error(chalk.red('\n sorry,error options or package is null !'));
		stop(spinner);
		return;
	}
}


function npminstall(arg_install, registry) {
	return co(function* () {
		try {
			// let res = yield Exec(arg_install, {
			//     // env: parsedArgs.env,
			//     cwd: process.cwd(),
			//     stdio: [
			//         process.stdin,
			//         process.stdout,
			//         process.stderr
			//     ]
			// });
			// return eval(res)[0];
			const argvs = process.argv;
			let command = argvs.splice(2)
			command.concat(['--registry', registry])
			// console.log('command', command.concat(['--registry', registry]))
			var child = yield spawn.sync('npm', command.concat(['--registry', registry]), {
				// env: parsedArgs.env,
				cwd: process.cwd(),
				stdio: [
					process.stdin,
					process.stdout,
					process.stderr
				]
			})
			return child
		} catch (err) {
			console.error(chalk.red('\n' + replaceErrMsg(err, registry)));
			return false;
		}
	}).catch(err => {
		console.error(chalk.red('\n' + replaceErrMsg(err, registry)));
		return false;
	});
}

/**
 * 修改dependencies文件
 * @param {*} packJson
 * @param {*} dependencies
 * @param {*} type
 */
function updateDependencies(packJson) {
	let root = process.cwd();
	fs.writeFileSync(path.join(`${root}`, 'package.json'), JSON.stringify(packJson, null, '  '), 'utf-8')
}

function showProcess(spinner, pkgs) {
	let text1 = `.`;
	let text2 = `..`;
	let text3 = `...`;
	let time = 0, value, index = 0;
	let pkgLeng = pkgs.length
	setInterval(() => {
		let item = pkgs[index];
		if (time % 3 === 0) {
			value = text1
		} else if (time % 3 === 1) {
			value = text2
		} else {
			value = text3
		}
		if (index < pkgLeng - 1) {
			spinner.text = `[${pkgLeng}/${index}]Installing ${item.name} package ⬇️ ${value}`
		} else {
			spinner.text = `[${pkgLeng}/${pkgLeng}]Installing ${pkgs[pkgLeng - 1].name} package ⬇️ ${value}`
		}
		index++
		time++
		time === 3 ? time = 0 : null
	}, 800)
}
