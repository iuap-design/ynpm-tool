'use strict';

//  Nexus OSS 3.3 Info
const IPCOMPANY = '123.103.9.196';
const YON_MIRROR = 'http://123.103.9.196:8081/repository/ynpm-all/';
const DEAFAULT_MIRROR = 'https://registry.npm.taobao.org';
const HOST_REGISTRY = 'http://123.103.9.196:8081/repository/ynpm-private/';
// const CDNJSON = 'http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/ynpm/ynpm.json'

// const YNPM_SERVER = "http://ir6fs8gj.c87e2267-1001-4c70-bb2a-ab41f3b81aa3.app.yyuap.com";
const YNPM_SERVER = "http://127.0.0.1";

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const tcpp = require('tcp-ping');
const thunkify = require("thunkify");
const btoa = require('btoa');
let objectAssign = require('object-assign');
const Ping = thunkify(tcpp.ping);

const userPath = process.env.HOME;
const fileName = "ynpm";
// let rc = require("runtime-configuration");
// const yarnConfig = require('yarn-config-directory');

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

function consoleLog(...arg){
  // const argvs = process.argv;
  console.log("arg:",arg);
  console.log("consoleLogconsoleLogconsoleLogconsoleLogconsoleLog",global.ynpm); 
  // if(global.ynpm.NODE_DEV){
  //   for (let index = 0; index < argvs.length; index++) {
  //     console.log(argvs[index]);
  //   }
  // }
}
/**
 *server 接口设置
 * @param {*} config
 * @returns
 */
function getHttpConfig(config){
  // //开发环境
  // return Object.assign({
  //   host: YNPM_SERVER, 
  //   port:3001,
  //   path:"/api",
  //   // method:"get",
  //   // path:"/package/get",
  //   // headers:{
  //   //   'Content-Type':'application/x-www-form-urlencoded',
  //   //   // 'Content-Length':contents.length
  //   // }
  // },config)
  
  //线上
  return Object.assign({
    host: YNPM_SERVER,
    path:"/api",
    port:"3002"
    // method:"get",
    // path:"/package/get",
    // headers:{
    //   'Content-Type':'application/x-www-form-urlencoded',
    //   // 'Content-Length':contents.length
    // }
  },config)
}

function getCommands(fileName){
  let config = {}; 
  let argvs = process.argv;
  try{
      console.log(argvs);
      if(argvs[2] == "set" && argvs[3] == "sshk"){
        console.log("argvs[2]---ff- ",argvs[2].toString() +" ==== "+ argvs[3]);
        let data = fs.readFileSync(getRcFile(fileName),"utf-8");
        data = JSON.parse(data);
        data["sshk"] = btoa(data.user+":"+data.user);
        let sshk = data["sshk"]+data.email;
        console.log(sshk);
        console.log(chalk.green(`
        help:
        ------------------------请复制你的sshk----------------------------
        ${sshk}
        ------------------------end----------------------------
        `));
        config = data;
      }else if(argvs[2] == "set"){
        let attr = argvs[3].split("=");
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
          comm?fs.writeFileSync(path,JSON.stringify(comm)):"";
      }else{
        let comm = getCommands(fileName); 
        let config = fs.readFileSync(path,"utf-8");
        if(comm){
          config = JSON.parse(config);
          config = objectAssign(config,comm);
          config = JSON.stringify(config);
          fs.writeFileSync(path,config);
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
     return fs.readFileSync(getRcFile(fileName),"utf-8");
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
   console.log("filePath:"+filePath);
  return filePath;
}

module.exports = {
  registry:"",
  IPCOMPANY,
  YON_MIRROR,
  DEAFAULT_MIRROR,
  HOST_REGISTRY,
  // CDNJSON,
  getHttpConfig,
  setRc,
  getRc,
  consoleLog,
  getByAtrrBool,
  getPing: () => {
    return co(function* (){
      // Ping内网
     const Ping_Response = yield Ping({
         address: IPCOMPANY,
         port: 8081,
         timeout: 50,
         attempts: 1
     })
     let registry = Ping_Response.avg ? YON_MIRROR : DEAFAULT_MIRROR;
     if(Ping_Response.avg) {
          console.log(chalk.dim('Yonyou Mirror Downloading...\n'));
      } else {
          console.log(chalk.dim(`CNPM Mirror ${process.argv[2]} ...\n`));
      }
    //  console.log("registry",registry);
     this.registry = registry;
     return registry;
    //  return {Ping_Response,registry};
   }).catch(err => {
     console.error(chalk.red('\n' + err));
   });
  }
}