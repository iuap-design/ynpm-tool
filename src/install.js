'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const npminstall = require('npminstall');
const {HOST_REGISTRY,DEAFAULT_MIRROR} = require('./utils');

module.exports = (registry) => { 
    const argvs = process.argv;
    let _pack = [];
    if(argvs[3] == "--save"){
        for(let i =4; i < argvs.length; i++){
            let pacgName = argvs[i].split("@");
            if(pacgName.length == 2){
                _pack.push({name: pacgName[0], version:pacgName[1]})
            }else{
                _pack.push({ name: argvs[i], version:'latest' });
            }
        }
    }else if(argvs[argvs.length-1] == "--save"){
        for(let i =(argvs.length-2); i > 0; i--){
            if(argvs[i] == "install")break;
            let pacgName = argvs[i].split("@");
            if(pacgName.length == 2){
                _pack.push({name: pacgName[0], version:pacgName[1]})
            }else{
                _pack.push({ name: argvs[i], version:'latest' });
            }
        }
    }
    // _pack.push({ name:'@yonyou/ac-button' , version:'latest'});
    // console.log("---",_pack);
    const spinner = ora().start();
    spinner.color = 'green';
    spinner.text = 'Installing package ⬇️...';

    console.log("_pack----__dirname",__dirname)
    // HOST_REGISTRY
    let allInner = install(spinner,process.cwd(),_pack,DEAFAULT_MIRROR);//内网缓存中下载
    // if(allInner)return;
    // let privateInner = install(spinner,process.cwd(),registry);//内网发包中下载
    // if(privateInner)return;
}


function install(spinner,root,pkgs,registry){
    console.log("process.cwd()----",process.cwd())
    co(function* (){
        yield npminstall({
            root:process.cwd(),
            // pkgs,
            // :[ { name: 'bee-table', version: '1.2.7' } ],
            registry: 'https://registry.npm.taobao.org',
            // registry,
        });
        spinner.stop();
        process.exit(0);
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        spinner.stop();
        process.exit(0);
    });
}
 