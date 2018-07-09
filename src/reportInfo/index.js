'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const co = require('co');

const {getRc,setRc,getHttpConfig} = require('../utils');

// const httpConfig = {
//   host: YNPM_SERVER, 
//   port:3001,
//   path:"/user/getTokenValidate",
//   // method:"get",
//   // path:"/package/get",
//   // headers:{
//   //   'Content-Type':'application/x-www-form-urlencoded',
//   //   // 'Content-Length':contents.length
//   // }
// }

function get(options,params) {
  let url = options.host?options.host:"127.0.0.1";
  url += options.port?":"+options.port:"";
  // url += options.method?options.port:"";
  url += options.path?options.path:"";
  // let met = options.method.toUpperCase();
  // if(met != "GET")return;
  
  let par = "?",i = 0 ,len = Object.keys(params).length;
  for(let attr in params){
    i++;
    let _att = attr + "="+ params[attr];
    len == i?"": _att += "&";
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
  let parame = JSON.parse(getRc("ynpm"));
  let config = getHttpConfig({
    path:"/user/getUserValidate",
  });
  return get(config,parame);
}

module.exports = {
   userInfo
}

