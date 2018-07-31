'use strict';

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

module.exports = {
    help: () => {
        console.log(chalk.green('Usage :'));
        console.log();
        
        console.log(chalk.green(
          `
          Usage:
          ----------------------------------------------------
            ynpm install
            ynpm install <pkg>
            ynpm install <pkg>@<tag>
            ynpm install <pkg>@<version>
            ynpm install <pkg>@<version range>
            ynpm install <folder>
            ynpm install <tarball file>
            ynpm install <tarball url>
            ynpm install <git:// url>
            ynpm install <github username>/<github project>
       
          Options:
          ----------------------------------------------------
            --save, -S, --save-dev, -D: save installed dependencies into package.json
            -g, --global: install devDependencies to global directory
       
          Others:
          ----------------------------------------------------
            ynpm --registry: change default mirror address
       
          `
        ));
      console.log();
    },
    setConfig: () => {
      console.log(chalk.green(`
      help:
      ------------------------请设置npm发包账户信息----------------------------
      设置用户名
      $ ynpm set user="xx"
      设置email
      $ ynpm set email=xx@yonyou.com 
      生成key
      $ ynpm sshk
      ------------------------请设置npm发包账户信息----------------------------
      `));
    },
    version: () => {
        console.log();
        console.log(chalk.green('Yonyou Package Manager(ynpm) Version : ' + require('../package.json').version));
        console.log();
        process.exit();
    },
    info: (msg) => {
      console.log(chalk.cyan("Info : " + msg)); 
    },
    showSSHKMsg: (sshk) => {
      console.log(chalk.green(`
        help:
        -------------请复制你的sshk到-----------------
        https://package.yonyoucloud.com#setting 设置您的key

        ${sshk}

        -------------------end----------------------
        `));
    },
    error: (msg) => {
      console.log(chalk.red("Error : " + msg));
    }
}