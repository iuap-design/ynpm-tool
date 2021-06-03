'use strict';
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const formData = require('form-data');
const co = require('co');
const tcpp = require('tcp-ping');
const thunkify = require("thunkify");
const btoa = require('btoa');
let objectAssign = require('object-assign');
const propertiesParser = require('properties-parser')
const Ping = thunkify(tcpp.ping);

const help = require('./help');
const userPath = process.env.HOME || process.env.USERPROFILE;
const fileName = "ynpm";


//  Nexus OSS 3.12 Info
const IPCOMPANY = '10.3.15.79';//内网
let YON_INNER_MIRROR, HOST_REGISTRY, YON_MIRROR,YON_FAST_MIRROR, YON_OUTSIDE_MIRROR,HOST_REGISTRY_OUTSIDE,YON_OUTSIDE_MIRROR_PRE;

if(getRc(fileName) && getRc(fileName).nexus !== 'old') {
	YON_INNER_MIRROR = 'http://maven.yonyou.com/nexus/repository/ynpm-all/'; //
	YON_MIRROR = 'http://maven.yonyou.com/nexus/repository/ynpm-all/';
	YON_OUTSIDE_MIRROR = 'http://125.35.5.158:9000/repository/ynpm-group/';
	YON_OUTSIDE_MIRROR_PRE = 'http://125.35.5.158:9000/repository/ynpm-pre/';
	YON_FAST_MIRROR = 'http://maven.yonyou.com/nexus/repository/ynpm-fast/';
	HOST_REGISTRY = 'http://maven.yonyou.com/nexus/repository/ynpm-private/';
	HOST_REGISTRY_OUTSIDE = 'http://125.35.5.158:9000/repository/ynpm-outside/';
} else {
	YON_INNER_MIRROR = 'http://'+IPCOMPANY+':80/repository/ynpm-all/';
	YON_MIRROR = 'http://ynpm.yonyoucloud.com/repository/ynpm-all/';
	YON_OUTSIDE_MIRROR = 'http://125.35.5.158:9000/repository/ynpm-group/';
	YON_OUTSIDE_MIRROR_PRE = 'http://125.35.5.158:9000/repository/ynpm-pre/';
	YON_FAST_MIRROR = 'http://maven.yonyou.com/nexus/repository/ynpm-fast/';
	HOST_REGISTRY = 'http://'+IPCOMPANY+':80/repository/ynpm-private/';
	HOST_REGISTRY_OUTSIDE = 'http://125.35.5.158:9000/repository/ynpm-outside/';
}
if(getRc(fileName) && getRc(fileName).quick === 'using') {
	YON_INNER_MIRROR = YON_MIRROR = YON_FAST_MIRROR;
}
// const YON_MIRROR = 'http://ynpm.yonyoucloud.com/repository/ynpm-all/';
// const YON_MIRROR = 'http://maven.yonyou.com/repository/';
// const HOST_REGISTRY = 'http://'+IPCOMPANY+':80/repository/ynpm-private/';
// const HOST_REGISTRY = 'http://172.20.53.74:8081/repository/ynpm-private/';
const YNPM_SERVER = "https://package.yonyoucloud.com/npm";
const SERVER = "http://libraui-backend.online.app.yyuap.com/npm";
const HOST_MAIN = '127.0.0.1:3000'
// const YNPM_SERVER = "http://127.0.0.1:3567/npm";
// const YNPM_SERVER = "https://modulestore.yonyoucloud.com/api/npm";




/**
 * 根据数据源寻找属性是否存在
 * @param {array }}} array 数据源
 * @param {string} attr 属性
 */
function getByAtrrBool(array,attr){
	let b = false;
	for(let index = 0; index < array.length; index++) {
		const element = array[index];
		element == attr?b = true:"";
	}
	return b;
}

/**
 *server 接口设置
 * @param {*} config
 * @returns
 */
function getHttpConfig(config){
	return Object.assign({
		host: YNPM_SERVER
	},config)
}

function getCommands(fileName){
	let config = {};
	let argvs = process.argv;
	try{
		let attr
		if(argvs[2] == "set"){
			let rcConfig = propertiesParser.read(getRcFile(fileName));
			let data = JSON.parse(JSON.stringify(rcConfig));
			attr = argvs[3].split("=");
			data[attr[0]] = attr[1];
			if(argvs[3].indexOf("ynpmUser") > -1 && data['ynpmUser'] !== rcConfig['ynpmUser']) {
				data["sshk"] = data["_auth"] = data.ynpmPassword = '' //更换用户则清理sshk和password
			}
			if((argvs[3].indexOf("ynpmPassword") > -1 && data.user && data.ynpmUser)) {// 新账号将使用账号密码生成sshk
				data["sshk"] = btoa(data.ynpmUser + ":" + data.ynpmPassword);
				data["_auth"] = btoa(data.ynpmUser + ":" + data.ynpmPassword);
			}
			if(data.user && !data.ynpmUser && !data.ynpmPassword) { // 旧账号将使用user生成sshk
				data["sshk"] = btoa(data.user+":"+data.user);
				data["_auth"] = btoa(data.user+":"+data.user);
			}
			if(data["sshk"] && data.ynpmUser && data.ynpmPassword && data.user) {
				help.showSSHKMsg(data["sshk"]);
			}
			config = data;
		} else {
			return null;
		}
		return config;
	}catch(e){
		return null;
	}

}

function getIPAdress(){
	var interfaces = require('os').networkInterfaces();
	for(var devName in interfaces){
		var iface = interfaces[devName];
		for(var i=0;i<iface.length;i++){
			var alias = iface[i];
			if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
				return alias.address;
			}
		}
	}
}

function setRc(fileName){
	let path = getRcFile(fileName);
	try{
		let valida = getValidateRc(fileName);
		if(!valida){
			let comm = getCommands(fileName);
			let editor = propertiesParser.createEditor();
			for (var item in comm) {
				editor.set(item, comm[item]);
			}
			fs.writeFileSync(path,editor.toString())
			// comm?fs.writeFileSync(path,JSON.stringify(comm)):"";
		}else{
			let comm = getCommands(fileName);
			let config = propertiesParser.read(path);
			if(comm){
				config = config||{};
				config = objectAssign(config,comm);
				let editor = propertiesParser.createEditor();
				for (var item in config) {
					editor.set(item, config[item]);
				}
				fs.writeFileSync(path,editor.toString())
			};
		}
	}catch(e){

	}
}


/**
 * 获取文件
 * @param {any} fileName
 * @returns
 */
function getRc(fileName){
	if(getValidateRc(fileName)){
		return propertiesParser.read(getRcFile(fileName));
	}else{
		return null;
	}
}
/**
 * 判断是否有Rc文件
 * @param {any} fileName
 * @returns  true、false
 */
function getValidateRc(fileName){
	try {
		fs.accessSync(getRcFile(fileName),fs.F_OK);
	}catch (e) {
		return false;
	}
	return true;
}

function getRcFile(fileName){
	let  filePath = fileName? userPath+"/."+fileName+"rc":"";
	return filePath;
}
/**
 * package.json中信息抽取有用信息
 * @param {any} jsonParams
 * @returns  json
 */

function getPckParams(jsonParams){
	delete jsonParams.scripts
	delete jsonParams.devDependencies
	delete jsonParams.dependencies
	return jsonParams;
}


// 过滤敏感 ip地址
function replaceErrMsg(err,key) {
	if(typeof err !== 'string') {
		err = err+''
	}
	return err.replace(new RegExp(key,'g'),"").replace(/npm \-\-registry\=/,'ynpm');
}
// upload
function uploadReadme(name) {
	try {
		let readmeFilePath = path.join(process.cwd(), 'README.md');
		let form = new formData();
		if (fs.existsSync(readmeFilePath)) {
			form.append("readme", fs.readFileSync(readmeFilePath, 'utf-8'));
			form.append("name", name);
			return fetch(getHttpConfig().host + '/package/readmeUpload', {method: 'post', body: form})
				.then(res => res.json())
				.then((res) => {
					if(res.success) {
						console.log('\n')
						console.log(chalk.green('README.md file upload success!'));
					} else {
						console.log('\n')
						console.log(res.msg);
					}
				}).catch(err => {
					console.log('\n');
					console.log(err);
				})
		} else {
			console.log('\n')
			console.log(chalk.yellow('[WARN]:NO README.md file, Please add README.md!'));
			return new Promise((reslove) => reslove());
		}
	} catch (err) {
		console.log(chalk.dim(err));
		return new Promise();
	}
}
// upload cdn
function uploadCDN(name, fileName, path) {
	try {
		let form = new formData();
		if (fs.existsSync(path)) {
			form.append("file", fs.readFileSync(path, 'utf-8'));
			form.append("name", name);
			form.append("fileName", fileName);
			return fetch(HOST_MAIN + '/other/upload', {method: 'post', body: form})
				.then(res => res.json())
				.then((res) => {
					if(res.success) {
						console.log('\n')
						console.log(chalk.green('CDN file upload success!'));
					} else {
						console.log('\n')
						console.log(res.msg);
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
// sync
function sync(name) {
	try {
		let form = new formData();
		form.append("name", name);
		return fetch(getHttpConfig().host + '/package/syncPackage', {method: 'post', body: form})
			.then(res => res.json())
			.then((res) => {
				if(res.success) {
					console.log('\n');
					console.log(chalk.green(`package ${name} synchronization success!`));
				} else {
					console.log('\n');
					console.error(chalk.red('\n' + res.message));
				}
			})
	} catch (err) {
		console.log(chalk.dim(err));
		return new Promise();
	}
}
function fix() {
	try {
		return fetch(getHttpConfig().host + '/package/fix', {method: 'post'})
			.then(res => res.json())
			.then((res) => {
				if(res.success) {
					console.log('\n');
					console.log(chalk.green(`Repair success!`));
				} else {
					console.log('\n');
					console.error(chalk.red('\n' + res.message));
				}
			})
	} catch (err) {
		console.log(chalk.dim(err));
		return new Promise();
	}
}
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
	} catch (err) {
		deleteFolder(allPath, allPath)
	}
}

module.exports = {
	registry:"",
	IPCOMPANY,
	YON_MIRROR,
	YON_INNER_MIRROR,
	YON_OUTSIDE_MIRROR,
	YON_FAST_MIRROR,
	HOST_REGISTRY_OUTSIDE,
	YON_OUTSIDE_MIRROR_PRE,
	// DEAFAULT_MIRROR,
	HOST_REGISTRY,
	SERVER,
	// CDNJSON,
	getHttpConfig,
	setRc,
	getRc,
	getByAtrrBool,
	getPckParams,
	getRcFile,
	deleteFolder,
	sync,
	fix,
	uploadCDN,
	HOST_MAIN,
	replaceErrMsg,
	getIPAdress,
	uploadReadme,
	getPing: (action) => {
		return co(function* (){
			// Ping内网
			const Ping_Response = yield Ping({
				address: IPCOMPANY,
				port: 8081,
				timeout: 50,
				attempts: 1
			})
			if(action === 'install' || action === 'i') { // 只在安装的时候给提示语
				if(Ping_Response.avg) {
					console.log(chalk.dim('YNPM-[INFO]:Yonyou Inner Mirror Downloading...\n'));
				} else {
					console.log(chalk.dim(`YNPM-[INFO]:Yonyou Mirror Downloading...\n`));
				}
			}
			let registry = Ping_Response.avg ? YON_INNER_MIRROR : YON_MIRROR;

			this.registry = registry;
			return registry;
		}).catch(err => {
			console.error(chalk.red('\n' + err));
		});
	}
}
