'use strict';

//  Nexus OSS 3.12 Info
const IPCOMPANY = '172.20.23.233';//内网
const YON_INNER_MIRROR = 'http://172.20.23.233:8081/repository/ynpm-all/';
//外网
const YON_MIRROR = 'http://123.103.9.196:8081/repository/ynpm-all/';
const HOST_REGISTRY = 'http://172.20.23.233:8081/repository/ynpm-private/';
const YNPM_SERVER = "http://package.yonyoucloud.com/npm";
// const YNPM_SERVER = "http://127.0.0.1:3001/npm";

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const tcpp = require('tcp-ping');
const thunkify = require("thunkify");
const btoa = require('btoa');
let objectAssign = require('object-assign');
const propertiesParser = require('properties-parser')
const exec = require('child_process').exec;
const Ping = thunkify(tcpp.ping);

const help = require('./help');
const userPath = process.env.HOME;
const fileName = "ynpm";


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
      if(argvs[2] == "set" && argvs[3].indexOf("email") > -1 ){
        let data = propertiesParser.read(getRcFile(fileName));
        attr = argvs[3].split("=");
        if(attr[1]===undefined){
          console.error('email 不能为空')
          return
        }
        data[attr[0]] = attr[1];
        data["sshk"] = btoa(data.user+":"+data.user);
        data["_auth"] = btoa(data.user+":"+data.user);
        let sshk = data["sshk"];
        help.showSSHKMsg(sshk)
        config = data;
      }else if(argvs[2] == "set" && argvs[3] == "sshk"){
        let data = propertiesParser.read(getRcFile(fileName));
        data["sshk"] = btoa(data.user+":"+data.user);
        data["_auth"] = btoa(data.user+":"+data.user);
        let sshk = data["sshk"];
        help.showSSHKMsg(sshk)
      }else if(argvs[2] == "set"){
        attr = argvs[3].split("=");
        config[attr[0]] = attr[1];
      }else{return null;}
      return config;
  }catch(e){
    return null;
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
          
          // config = JSON.stringify(config);
          // 转换为 a='a' 的格式
          let editor = propertiesParser.createEditor();
          for (var item in config) {
            editor.set(item, config[item]);
          }
          fs.writeFileSync(path,editor.toString())

          // if(config.email && config.sshk) {
          //   let set_npmrc_email_config = `npm config set email=${config.email}`;
          //   let set_npmrc_auth_config = `npm config set _auth=${config.sshk}`;
          //   exec(set_npmrc_email_config,(error, stdout, stderr)=>{
          //     if(error) {
          //       console.error('error: ' + error);
          //       return;
          //     }
          //     exec(set_npmrc_auth_config,(error, stdout, stderr)=>{
          //       if(error) {
          //         console.error('error: ' + error);
          //         return;
          //       }
          //     });
          //   });
          // }
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


module.exports = {
  registry:"",
  IPCOMPANY,
  YON_MIRROR,
  YON_INNER_MIRROR,
  // DEAFAULT_MIRROR,
  HOST_REGISTRY,
  // CDNJSON,
  getHttpConfig,
  setRc,
  getRc,
  getByAtrrBool,
  getPckParams,
  getRcFile,
  getPing: () => {
    return co(function* (){
      // Ping内网
     const Ping_Response = yield Ping({
         address: IPCOMPANY,
         port: 8081,
         timeout: 50,
         attempts: 1
     })
     if(Ping_Response.avg) {
          console.log(chalk.dim('Yonyou Inner Mirror Downloading...\n'));
      } else {
          console.log(chalk.dim(`Yonyou Mirror Downloading...\n`));
      }
     let registry = Ping_Response.avg ? YON_INNER_MIRROR : YON_MIRROR;
     
     this.registry = registry;
     return registry;
   }).catch(err => {
     console.error(chalk.red('\n' + err));
   });
  }
}