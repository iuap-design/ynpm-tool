'use strict';

//  Nexus OSS 3.3 Info
 const IPCOMPANY = '172.16.75.107';
 const YON_MIRROR = 'http://172.16.75.107:8081/repository/ynpm-group/';
 const DEAFAULT_MIRROR = 'https://registry.npm.taobao.org';
 const HOST_REGISTRY = 'http://172.16.75.107:8081/repository/ynpm-host/';
 const CDNJSON = 'http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/ynpm/ynpm.json'

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

function getCommands(fileName){
  let config = {}; 
  let argvs = process.argv;
  try{
      console.log(argvs);
      if(argvs[2] == "set" && argvs[3] == "sshk"){
        console.log("argvs[2]---ff- ",argvs[2].toString() +" ==== "+ argvs[3]);
        let data = fs.readFileSync(getRcFile(fileName),"utf-8");
        data = JSON.parse(data);
        data["sshk"] = btoa(data.user+":"+data.email);
        console.log(data["sshk"]);
        console.log(chalk.green(`
        help:
        ------------------------请复制你的sshk----------------------------
        ${data["sshk"]}
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
    try{ 
      if(getValidateRc(fileName) == ""){
          let comm = getCommands(fileName);
          comm?fs.writeFileSync(getRcFile(fileName),JSON.stringify(comm)):"";
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
  CDNJSON,
  setRc,
  getRc,
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


// var Global = function() {
//   console.log(" Global ");
// };

// Global.prototype = {

//   registry : '',
//   /**
//    * Ping_Response
//    */
//   Ping_Response: {}, 


//   getPing: () => {
//     return co(function* (){
//       // Ping内网
//      const Ping_Response = yield Ping({
//          address: IPCOMPANY,
//          port: 8081,
//          timeout: 50,
//          attempts: 1
//      })
//      let registry = Ping_Response.avg ? YON_MIRROR : DEAFAULT_MIRROR;
//      console.log("registry",registry);
//      this.registry = registry;
//      this.Ping_Response = registrPing_Responsey;
//    }).catch(err => {
//      console.error(chalk.red('\n' + err));
//    });
//   }
// }

// module.exports = new Global();
