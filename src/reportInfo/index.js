'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const {getRc,setRc} = require('../utils');

const httpConfig = {
  host: 'http://localhost', 
  port:3001,
  path:"/user/getLoginUserInfo",
  // headers:{
  //   'Content-Type':'application/x-www-form-urlencoded',
  //   // 'Content-Length':contents.length
  // }
}

function ajax(options,resu,params){
  let url = options.host?options.host:"127.0.0.1";
  url += ":";
  url += options.metporthod?options.port:"3001";
  url += options.path?options.path:"";
  console.log("url: "+url);
  fetch(url)
  .then(res => res.text())
  .then(body =>{
    resu(body);
  });
}


module.exports = {
    userInfo: () => {
      let parame = getRc("ynpm");
      ajax(httpConfig,(data)=>{

        console.log(" ------------ "+data);
      });
    },
 
    version: () => {
        console.log();
        console.log(chalk.green('Yonyou Package Manager(ynpm) Version : ' + require('../package.json').version));
        console.log();
        process.exit();
    },
    info: (msg) => {
        // console.log();
        console.log(chalk.cyan("Info : " + msg));
        // console.log();
    },
    error: (msg) => {
        // console.log();
        console.log(chalk.red("Error : " + msg));
        // console.log();
    }
}