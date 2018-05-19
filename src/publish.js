'use strict';

const path = require('path');
const fs = require('fs');
const thunkify = require("thunkify");
const request = require('request');
const exec = require('child_process').exec;
const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const ini = require('ini');
const reportInfo = require('./reportInfo/index');
const utils = require('./utils');
const help = require('./help');

const IP_Req = thunkify(request);
const Exec = thunkify(exec);

module.exports = (registry) => {
    const argvs = process.argv;
    
    const spinner = ora().start();
    spinner.color = 'green';

    co(function* (){
        if(argvs[2] == 'publish' && argvs[3] == 'inner'){
          
        //    let config = JSON.parse(getRc("ynpm"));
        //     if(!config || !config.user || !config.email ){
        //         help.setConfig();
        //         spinner.stop();
        //         process.exit(0);
        //     }
            // reportInfo.userInfo();
            // console.log("验证通过")
            
            // Get Publish Package Info
            var packOrigin = JSON.parse(fs.readFileSync(path.join(process.cwd(),'package.json'))).name;
            var packName = packOrigin.split('/')[0].replace("@","");
            
            // Get Data
            var cdnRes = yield IP_Req(utils.CDNJSON);
            var jsonRes = JSON.parse(cdnRes[cdnRes.length - 1]);
            
            // Get User Info - using offical method - ini
            var _auth;
            var npmConfigReturn = yield Exec('npm get userconfig');
            // npmConfigReturn: [ '/Users/AYA/.npmrc\n', '' ]
            var npmUserConfig = npmConfigReturn[0].trim();
            var iniConfig = ini.parse(fs.readFileSync(npmUserConfig, 'utf-8'))
            var parseAuth = new Buffer(iniConfig._auth, 'base64').toString().split(":")[0];
            console.log("----npmConfigReturn----");
            console.log(npmConfigReturn);
            //  Verify Publish Scoped
            if(jsonRes[parseAuth] && jsonRes[parseAuth].includes(packName)){
                console.log('Aviable: Pass Validation, Start to Publish...')
                var arg_publish_inner = `npm --registry=${utils.HOST_REGISTRY} publish`;
                spinner.text = 'Publishing your package in Yonyou Local Area Net';
                var data = yield Exec(arg_publish_inner);
                
            } else if(jsonRes[parseAuth]) {
                console.error(`Error: Overflow User Privilege, Publish Package Scoped with "@${jsonRes[parseAuth]}" or Contact Admin to Extend Privilege!`);
            } else {
                console.error("Error: Cant Find User, Please Use `npm config set _auth=base64String` or Contact Admin to Create User!");
            }
            
        }else if(argvs[2] == 'publish' && argvs[3] != 'inner'){
            var arg_publish = `npm publish`;
            spinner.text = 'Publishing your package on NPM Official Repos';
            var data = yield Exec(arg_publish);
        }
        spinner.stop();
        process.exit(0);
    }).catch(err => {
      console.error(chalk.red('\n' + err));
    });
}
 