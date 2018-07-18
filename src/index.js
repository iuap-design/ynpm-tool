const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co'); 
const {getRc,setRc,getPing,getByAtrrBool,consoleLog} = require('./utils');
const help = require('./help');
const install = require('./install');
const publish = require('./publish');

function getHelp() {
  console.log(chalk.green(" Usage : "));
  console.log();
  console.log(chalk.green(" ac sample init sample"));
  console.log();
  process.exit(0);
}

function getVersion() {
  console.log(chalk.green(require("../package.json").version));
  process.exit(0);
}

function init(fun){ 
  // Ping内网
  const {Ping_Response,registry} = getPing();
  // const spinner = ora().start();
  
  if(Ping_Response.avg) {
      console.log(chalk.dim('Yonyou Mirror Downloading...\n'));
  } else {
      console.log(chalk.dim('CNPM Mirror Downloading...\n'));
  }
  return fun(registry); 
}


module.exports = {
  plugin: function(options,global) {
    commands = options.cmd;
    const argvs = process.argv;
    switch (commands) {
        case "-h":
        case "-help":
            help.help();
            break;
        case "-v":
        case "-version":
            help.version();
            break;
        case "install":
            co(function* (){
              // Ping内网;
              install(yield getPing());
            }).catch(err => {
              console.error(chalk.red('\n' + err));
            });
            break;
        case "publish":
          co(function* (){
            // Ping内网;
            publish(yield getPing());
          }).catch(err => {
            console.error(chalk.red('\n' + err));
          });
          break;
        case "set":
          let config = setRc("ynpm"); 
          break;
        default:
          help.help();
    }
  }
}