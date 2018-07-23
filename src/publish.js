'use strict';

const path = require('path');
const fs = require('fs');
const thunkify = require("thunkify");
const request = require('request');
const exec = require('child_process').exec;
const ora = require('ora');
const co = require('co');
const chalk = require('chalk');
const {userInfo, setPackage} = require('./reportInfo/index');
const {getRc,HOST_REGISTRY,getPckParams} = require('./utils');
const help = require('./help');

const IP_Req = thunkify(request);
const Exec = thunkify(exec);

module.exports = (registry) => {
    const argvs = process.argv;
    
    const spinner = ora().start();
    spinner.color = 'green';

    co(function* (){
        if(argvs[2] == 'publish'){
            
            var ynpmConfig = JSON.parse(getRc("ynpm"));
            //validate user rolse
            let data = yield userInfo();
            if(!data){
                help.setConfig();
                spinner.stop();
                process.exit(0);
            }
            var packOrigin = JSON.parse(fs.readFileSync(path.join(process.cwd(),'package.json')));

            if(ynpmConfig.user && ynpmConfig.sshk && data){
                console.log('Aviable: Pass Validation, Start to Publish...')
                var arg_publish_inner = `npm --registry=${HOST_REGISTRY} publish`;
                spinner.text = 'Publishing your package in Yonyou Local Area Net ---';
                try{
                    let publish_result = yield Exec(arg_publish_inner);
                }catch(e){
                    console.error(e)
                    console.error(chalk.red('\n' + 'please check the package.json\'s version, if has try a lot of time, \n please connect admin\'s email wangshih@yonyou.com or chenpanf@yonyou.com !'));
                    spinner.stop();
                    process.exit(0);
                }
                let params = getPckParams(packOrigin)
                let pckMsg = yield setPackage({userId: data.user_id, name:params.name, author: ynpmConfig.user, version:params.version, packageInfo:escape(JSON.stringify(params))})
                console.log('\n')
                console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
            } else if(publish_result[parseAuth]) {
                console.error(`Error: Overflow User Privilege, Publish Package Scoped with "@${jsonRes[parseAuth]}" or Contact Admin to Extend Privilege!`);
            } else {
                console.error("Error: Cant Find User, Please Use `npm config set _auth=base64String` or Contact Admin to Create User!");
            }
        }
        // else if(argvs[2] == 'publish' && argvs[3] != 'inner'){
        //     var arg_publish = `npm publish`;
        //     spinner.text = 'Publishing your package on NPM Official Repos';
        //     var data = yield Exec(arg_publish);
        // }
        
        spinner.stop();
        process.exit(0);
    }).catch(err => {
      console.error(chalk.red('\n' + err));
    });
}
 
