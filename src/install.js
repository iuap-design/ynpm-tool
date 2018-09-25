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
const { replaceErrMsg } = require('./utils');
const { addDownloadNum, packageDownloadDetail } = require('./reportInfo/index');

function countStrLeng(str,subStr){
    let strs = str.split('');
    let count = 0;
    strs.forEach(st=>{
        if(st == subStr){
            count ++;
        }
    })
    return count;
}

function console_log(ifHasLog,msg){
    if(ifHasLog == 'dev') {
        console.log(msg)
    }
    return
}

function getResultPkgs(paramArr){
    let obj={}
    paramArr.forEach((item)=>{
        let temp = item.replace(/\+\s+/,'').trim()
        let index = temp.lastIndexOf('@')
        obj[temp.slice(0,index)]='^'+temp.slice(index+1)
    })
    return obj;
}


module.exports = (registry,ifHasLog) => {
    const argvs = process.argv;
    let _pack = [];
    
    let pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'),'utf-8'));
    let _package;
    let commIndex = argvs.findIndex(comm=>comm == "--save");
    let aliasCommIndex = argvs.findIndex(comm=>comm == "-S");
    let devCommIndex = argvs.findIndex(comm=>comm == "--save-dev");
    let aliasDevCommIndex = argvs.findIndex(comm=>comm == "-D");
    let globalCommIndex = argvs.findIndex(comm=>comm == "-g");
    let commLeng = argvs.length-1;
    if(commIndex == commLeng || devCommIndex == commLeng || aliasCommIndex == commLeng || aliasDevCommIndex == commLeng || globalCommIndex == commLeng){//npm install   xx  --save        
        console_log(ifHasLog, 'npm install   xx  --save ')
        _package = argvs.slice(3,commLeng)
        _pack  = getPackMsg(_package)
    }else if(commIndex == 3 || devCommIndex == 3 || aliasCommIndex == 3 || aliasDevCommIndex == 3 || globalCommIndex == 3){//npm install --save  xx 
        console_log(ifHasLog, 'npm install --save  xx')
        _package = argvs.slice(4,commLeng+1)
        _pack  = getPackMsg(_package)
    }else if(argvs.length == 3 && argvs[2] == "install"){//npm install
        //ynpm install 命令
        try {
            console_log(ifHasLog, 'npm install')
            let dependencies = {};
            pkgJson.dependencies = pkgJson.dependencies||{}
            pkgJson.devDependencies = pkgJson.devDependencies||{}
            dependencies = Object.assign(pkgJson.dependencies,pkgJson.devDependencies);
            Object.keys(dependencies).forEach(name => {
                _pack.push({ name: name, version: dependencies[name] })
            })
        } catch(e) {
            console.error(chalk.red('\n package.json is not de find !'));
        }
    }
    const spinner = ora().start();
    spinner.color = 'green';
    // HOST_REGISTRY
    let allInner = installValidate(_pack, spinner);//内网缓存中下载
    let pkgs = _pack
    co(function* (){
        const argvs = process.argv;
        let npm_registry = `npm --registry=${registry} `; 
        const argv_part = argvs.slice(2).join(' ');
        let arg_install = npm_registry + argv_part;
        let packTotal = pkgs.length;
        let startTime = new Date()
        showProcess(spinner,pkgs);//进度
        let unInstallPack = 'node-sass'
        let ifFind = pkgs.findIndex(item=> item.name == unInstallPack)
        if(ifFind > -1){
            let tempRegitstry = registry.split('repository/ynpm-all/')[0]
            let sassCommon = `SASS_BINARY_SITE=${tempRegitstry}mirrors/node-sass/ npm install node-sass`
            console_log(ifHasLog,sassCommon)
            yield npminstall(sassCommon, registry)
        }
        console_log(ifHasLog, arg_install)
        let resultInstall = yield npminstall(arg_install, registry);

        //如果报错就不进行下去
        if(!resultInstall){
            stop(spinner);
            return
        }
        const printResultInstall = resultInstall
        
        let formatResult
        //ynpm install时`up to date in 1.435s` 不处理
        
        let tempPkgs = {}
        // --save 时候写入package.json
        if(commIndex > -1 || aliasCommIndex > -1) {
            // for(let pkg of formatResult) {
            //     tempPkgs[pkg.name] = pkg.version
            // }
            if(resultInstall.indexOf('@') > -1) {
                resultInstall = resultInstall.match(/(\+.*@\d+(\.\d+)*)/g)
                console_log(ifHasLog, resultInstall)
                formatResult = getResultPkgs(resultInstall)
            }
            console_log(ifHasLog, formatResult)
            pkgJson.dependencies = Object.assign(pkgJson.dependencies||{},formatResult)
            console_log(ifHasLog, pkgJson)
            //更新package.json
            updateDependencies(pkgJson);
            // --save-dev 时候写入package.json
        } else if(devCommIndex > -1 || aliasDevCommIndex > -1) {
            // for(let pkg of formatResult) {
            //     tempPkgs[pkg.name] = pkg.version
            // }
            if(resultInstall.indexOf('@') > -1) {
                resultInstall = resultInstall.match(/((\+\-).*@\d+(\.\d+)*)/g)
                console_log(ifHasLog, resultInstall)
                formatResult = getResultPkgs(resultInstall)
            }
            console_log(ifHasLog, formatResult)
            pkgJson.devDependencies = Object.assign({},pkgJson.devDependencies,formatResult)
            console_log(ifHasLog, pkgJson)
            //更新package.json
            updateDependencies(pkgJson);
        }
        yield addDownloadNum({installPackMap:JSON.stringify(pkgs)})
        yield packageDownloadDetail(JSON.stringify(formatResult))
        console.log('\n\n',printResultInstall)
        console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
        stop(spinner);
    }).catch(err => {
        console.error(chalk.red('\n' + replaceErrMsg(err,registry)));
        stop(spinner);
    });    
}


function getPackMsg(_pack) {
    let _package = [];
    _pack.forEach(pa=>{
        let count = countStrLeng(pa,"@");
        let obj ={name:"",version:"latest"};
        let _pas = pa.split("@");
        if(count == 2){
            obj.name = "@"+_pas[1];
            obj.version = _pas[2];
        }else{
            let ind = pa.indexOf("@");
            if(ind == -1){
                obj.name =  pa;
            }else{
                obj.name =  (ind==0?"@"+_pas[1]:_pas[0]);
                obj.version =  ind==0?"latest":_pas[1];
            }
        }
        _package.push(obj)
    })
    return _package
}

function stop(spinner){
    if(!spinner)return;
    spinner.stop();
    process.exit(0);
}

/**
 * npm install validate after
 * @param {*} pkgs  package object 
 * @param {*} registry  url
 */

function installValidate(pkgs, spinner) {
    if(pkgs && pkgs.length < 1){
        console.error(chalk.red('\n sorry,error options or package is null !'));
        stop(spinner);
        return;
    }
}


function npminstall(arg_install, registry){
    return co(function* (){
        try {
            let res = yield Exec(arg_install);
            return eval(res)[0];
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

function showProcess(spinner,pkgs) {
    let text1 = `.`;
    let text2 = `..`;
    let text3 = `...`;
    let time = 0,value,index=0;
    let pkgLeng = pkgs.length
    setInterval(() => {
        let item = pkgs[index];
        if(time%3===0){
            value = text1
        }else if(time%3===1){
            value = text2
        }else {
            value = text3
        }
        if(index<pkgLeng-1){
            spinner.text = `[${pkgLeng}/${index}]Installing ${item.name} package ⬇️ ${value}`
        }else {
            spinner.text = `[${pkgLeng}/${pkgLeng}]Installing ${pkgs[pkgLeng-1].name} package ⬇️ ${value}`
        }
        index++
        time++
        time===3?time=0:null
    },800)
}
