'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const co = require('co');

const {getRc,setRc} = require('../utils');

const httpConfig = {
  host: 'http://localhost', 
  port:3001,
  path:"/user/getTokenValidate",
  // method:"get",
  // path:"/package/get",
  // headers:{
  //   'Content-Type':'application/x-www-form-urlencoded',
  //   // 'Content-Length':contents.length
  // }
}

function get(options,params) {
  let url = options.host?options.host:"127.0.0.1";
  url += ":";
  url += options.metporthod?options.port:"3001";
  url += options.path?options.path:"";
  // let met = options.method.toUpperCase();
  // if(met != "GET")return;
  let par = "?"; 
  for(let attr in params){ 
    let _att = attr + "="+ params[attr] + "&"; 
    par += _att;
  };
  url += par;
  console.log("url: "+url);
  return fetch(url)
  .then(res => res.text())
  .then(body =>{
    let data = null;
    try{
      let res = JSON.parse(body);
      if(!isEmptyObject(res.data)){
        data = res.data;
      }
    }catch(err){};
    return data;
  }); 
}

function isEmptyObject(obj){
  for(var key in obj){
      return false
  };
  return true
};

function userInfo(){
  // return co(function* (){ 

  // }).catch(err => {
  //   console.error(chalk.red('\n' + err));
  // });
  let parame = JSON.parse(getRc("ynpm"));
  let a = {user:"aa",ssk:"434"};
  return get(httpConfig,a);
}

module.exports = {
   userInfo
}

