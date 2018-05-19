'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const npminstall = require('npminstall');
const utils = require('./utils');

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
    console.log(_pack);
    const spinner = ora().start();
    spinner.color = 'green';
    spinner.text = '-=================Installing package ⬇️...';

    co(function* (){
      yield npminstall({
        root: process.cwd(),
        pkgs: _pack,
        registry: registry,
      });

      spinner.stop();
      process.exit(0);
    }).catch(err => {
      console.error(chalk.red('\n' + err));
    });
}
 