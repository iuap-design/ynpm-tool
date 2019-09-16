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
const {getRcFile,getRc,HOST_REGISTRY,getPckParams,replaceErrMsg,getIPAdress,uploadReadme} = require('./utils');
const help = require('./help');

const IP_Req = thunkify(request);
const Exec = thunkify(exec);

module.exports = (registry) => {
    const argvs = process.argv;
    const ip = getIPAdress();
    const spinner = ora().start();
    spinner.color = 'green';
    co(function* (){
        if(argvs[2] == 'publish'){
            var ynpmConfig = getRc("ynpm");
            ynpmConfig.sshk=ynpmConfig._auth
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
                let userconfig = getRcFile('ynpm')
                var arg_publish_inner = `npm --registry=${HOST_REGISTRY} --userconfig=${userconfig} publish`;
                spinner.text = 'Publishing your package in Yonyou Local Area Net';
                try{
                    let publish_result = yield Exec(arg_publish_inner);
                }catch(e){
                    console.error(replaceErrMsg(e,HOST_REGISTRY))
                    console.error(chalk.red('\n' + 'please check the package.json\'s version, if had try many time, \n please connect admin\'s email wangshih@yonyou.com or chenpanf@yonyou.com !'));
                    spinner.stop();
                    process.exit(0);
                }
                let params = getPckParams(packOrigin)
                let pckMsg = yield setPackage({ip, userId: data.user_id, name:params.name, author: ynpmConfig.email, version:params.version, packageInfo:escape(JSON.stringify(params))})
                let upload = yield uploadReadme();
                console.log('\n')
                console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
            } else {
                console.error("Error: Cant Find User, Please Use `npm set user=xxx && npm set email=xxx` or Contact Admin to Create User!");
            }
        }
        spinner.stop();
        process.exit(0);
    }).catch(err => {
      console.error(chalk.red('\n' + replaceErrMsg(err,HOST_REGISTRY)));
    });
}

