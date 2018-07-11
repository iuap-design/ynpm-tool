'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const npminstall = require('npminstall');
const {HOST_REGISTRY,DEAFAULT_MIRROR,YON_MIRROR} = require('./utils');

module.exports = (registry) => { 
    const argvs = process.argv;
    let _pack = [];
    console.log('argvs', argvs[argvs.length-1])
    console.log('argvs', argvs[3])

    if(argvs[2] == 'i' || argvs[2] == 'install'){
        let a = argvs.slice(2).join(' ');
        console.log("a",a)
    }
    if(argvs[3] == "--save"){
        for(let i =4; i < argvs.length; i++){
            let pacgName = argvs[i].split("@");
            //防止包名中有@开头的(@yonyou/ac-button)
            if(pacgName[0] === '') {
                _pack.push({name: '@'+pacgName[1], version:'latest'})
            } else {
                if(pacgName.length == 2){
                    _pack.push({name: pacgName[0], version:pacgName[1]})
                }else{
                    _pack.push({ name: argvs[i], version:'latest' });
                }
            }
        }
    }else if(argvs[argvs.length-1] == "--save"){
        for(let i =(argvs.length-2); i > 0; i--){
            if(argvs[i] == "install")break;
            let pacgName = argvs[i].split("@");
            //防止包名中有@开头的(@yonyou/ac-button)
            if(pacgName[0] === '') {
                _pack.push({name: '@'+pacgName[1], version:'latest'})
            } else {
                if(pacgName.length == 2){
                    _pack.push({name: pacgName[0], version:pacgName[1]})
                }else{
                    _pack.push({ name: argvs[i], version:'latest' });
                }
            }
        }
    }
    // _pack.push({ name:'@yonyou/ac-button' , version:'latest'});
    // console.log("---",_pack);
    const spinner = ora().start();
    spinner.color = 'green';
    spinner.text = 'Installing package ⬇️...';

    // console.log("_pack----__dirname",__dirname)
    console.log("_pack",_pack);
    // HOST_REGISTRY
    let allInner = install(spinner,process.cwd(),_pack,YON_MIRROR);//内网缓存中下载
    // if(allInner)return;
    // let privateInner = install(spinner,process.cwd(),registry);//内网发包中下载
    // if(privateInner)return;
}


function install(spinner,root,pkgs,registry){
    co(function* (){
        console.log("pkgs---k",pkgs);
        yield npminstall({
            root:process.cwd(),
            pkgs,
            // :[ { name: 'bee-table', version: '1.2.7' } ],
         //  registry: 'https://registry.npm.taobao.org',
          registry,
        });
        updateDependencies(root, pkgs)
        spinner.stop();
        process.exit(0);
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        spinner.stop();
        process.exit(0);
    });
}
function updateDependencies(root, pkgs) {
    let node_modules
    let pkgJson = JSON.parse(fs.readFileSync(path.join(`${root}`, 'package.json')))
    !pkgJson.dependencies?pkgJson.dependencies={}:null
    console.log(pkgs)
    for(let pkg of pkgs) {
        node_modules = JSON.parse(fs.readFileSync(path.join(`${root}/node_modules/${pkg.name}/`, 'package.json')))
        pkgJson.dependencies[node_modules.name] = node_modules.version
    }
    fs.writeFileSync(path.join(`${root}`, 'package.json'), JSON.stringify(pkgJson, null, '  '), 'utf-8')
}