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
            ynpm reinstall
            ynpm reinstall <pkg>
       
          Options:
          ----------------------------------------------------
            --save, -S, --save-dev, -D: save installed dependencies into package.json
            -g, --global: install devDependencies to global directory
       
          Others:
          ----------------------------------------------------
            ynpm --registry: change default mirror address
            ynpm sync <pkg>: Synchronize npm to ynpm
            ynpm download <pkg>: download package
            ynpm delete <pkg>: delete package from node_modules
            ynpm fix <pkg>: fix
          `
		));
		console.log();
	},
	setConfig: () => {
		console.log(chalk.green(`
      help:
      ------------------------请设置npm发包账户信息----------------------------
      设置用户名（友互通登录账号）
      $ ynpm set user=liushld@yonyou.com
      设置ynpm登录账号（域账号）
      $ ynpm set ynpmUser=liushld
      设置ynpm登录密码（域账号密码）
      $ ynpm set ynpmPassword=liushld
      ------------------------请设置npm发包账户信息----------------------------
      `));
	},
	version: () => {
		const cVesion = require("../package.json").version;
		console.log();
		console.log(chalk.green('Yonyou Package Manager(ynpm) Version : ' + cVesion));
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
        https://modulestore.yonyoucloud.com/

        ${sshk}

        -------------------end----------------------
        `));
	},
	error: (msg) => {
		console.log(chalk.red("Error : " + msg));
	}
}
