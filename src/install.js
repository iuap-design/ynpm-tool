
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const exec = require('child_process').exec;
const thunkify = require("thunkify");
const Exec = thunkify(exec);
const {addDownloadNum} = require('./reportInfo/index');

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

function setDependencies(package){
    let dependencies = {};
    package.forEach(data=>{
        dependencies.name = data.name;
        dependencies.version = data.version;
    })
    return dependencies;
}

module.exports = (registry) => { 
    const argvs = process.argv;
    let _pack = [];
    
    let pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'),'utf-8'));

    let package = [];
    let commIndex = argvs.findIndex(comm=>comm == "--save");
    let devCommIndex = argvs.findIndex(comm=>comm == "--save-dev");
    let commLeng = argvs.length-1;
    if(commIndex == commLeng || devCommIndex == commLeng){
        package = argvs.slice(3,commLeng)
        _pack  = getPackMsg(package)
    }else if(commIndex == 3 || devCommIndex == 3){
        package = argvs.slice(4,commLeng+1)
        _pack  = getPackMsg(package)
    }else if(argvs.length == 3 && argvs[2] == "install"){
        //ynpm install 命令
        try {
            let dependencies = {};
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
        console.time(`updated ${packTotal} packages in`);
        showProcess(spinner,pkgs);//进度
        let status = yield npminstall(arg_install);
        //如果报错就不进行下去
        if(!status){
            stop(spinner);
            return
        }
        let tempPkgs = {}
        // --save 时候写入package.json
        if(commIndex > -1) {
            for(let pkg of pkgs) {
                tempPkgs[pkg.name] = pkg.version
            }
            pkgJson.dependencies = Object.assign(pkgJson.dependencies,tempPkgs)
            //更新package.json
            updateDependencies(pkgJson);
            // --save-dev 时候写入package.json
        } else if(devCommIndex > -1) {
            for(let pkg of pkgs) {
                tempPkgs[pkg.name] = pkg.version
            }
            pkgJson.devDependencies = Object.assign(pkgJson.devDependencies,tempPkgs)
            //更新package.json
            updateDependencies(pkgJson);
        }
        addDownloadNum({installPackMap:JSON.stringify(pkgs)})

        console.log('\n')
        console.timeEnd(`updated ${packTotal} packages in`);
        console.log('\n')
        console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
        setTimeout(()=>{
            stop(spinner);
        },30)
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        stop(spinner);
    });
    
}

function getPackMsg(_pack) {
    let package = [];
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
        package.push(obj)
    })
    return package
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
        console.error(chalk.red('\n sorry,package is null !'));
        stop(spinner);
        return;
    }
}

function npminstall(arg_install){
    return co(function* (){
        try {
            // console.log('===',arg_process)
            yield Exec(arg_install);
            return true;
        } catch (err) {
            console.error(chalk.red('\n' + err));
            return false;
        }
    }).catch(err => {
        console.error(chalk.red('\n' + err));
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
