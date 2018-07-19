
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const co = require('co');
const ora = require('ora');
const tcpp = require('tcp-ping');
const exec = require('child_process').exec;
const thunkify = require("thunkify");
const Exec = thunkify(exec);
const Ping = thunkify(tcpp.ping);
const process_new = require('process');
const {HOST_REGISTRY,YON_MIRROR,IPCOMPANY,YON_INNER_MIRROR} = require('./utils');
const {addDownloadNum} = require('./reportInfo/index');

module.exports = (registry) => { 
    const argvs = process.argv;
    let _pack = [];
    //ynpm install 不用更新packagejson
    let isupdatepackdep = false;
    //默认 更新 dependence  
    let isupdatedevdepend = false;
    
    if(argvs[3] == "--save" || argvs[3] == "--save-dev"){
        for(let i =4; i < argvs.length; i++){
            let pacgName = argvs[i].split("@");
            //防止包名中有@开头的(@yonyou/ac-button)
            if(pacgName[0] === '') {
                if(argvs[3] == "--save") {
                    _pack.push({name: '@'+pacgName[1], version:'latest',postfix:'--save'})
                }else{
                    _pack.push({name: '@'+pacgName[1], version:'latest',postfix:'--save-dev'})
                }
            } else {
                if(pacgName.length == 2){
                    if(argvs[3] == "--save") {
                        _pack.push({name: pacgName[0], version:pacgName[1],postfix:'--save'})
                    }else{
                        _pack.push({name: pacgName[0], version:pacgName[1],postfix:'--save-dev'})
                    }
                }else{
                    if(argvs[3] == "--save") {
                        _pack.push({name: argvs[i], version:'latest',postfix:'--save'})
                    }else{
                        _pack.push({name: argvs[i], version:'latest',postfix:'--save-dev'})
                    }
                }
            }
        }
        if(argvs[3] == "--save-dev") {
            isupdatedevdepend = true
        }
        isupdatepackdep = true
    }else if(argvs[argvs.length-1] == "--save" || argvs[argvs.length-1] == "--save-dev"){
        for(let i =(argvs.length-2); i > 0; i--){
            if(argvs[i] == "install")break;
            let pacgName = argvs[i].split("@");
            //防止包名中有@开头的(@yonyou/ac-button)
            if(pacgName[0] === '') {
                if(argvs[3] == "--save") {
                    _pack.push({name: '@'+pacgName[1], version:'latest',postfix:'--save'})
                }else{
                    _pack.push({name: '@'+pacgName[1], version:'latest',postfix:'--save-dev'})
                }
            } else {
                if(pacgName.length == 2){
                    if(argvs[argvs.length-1] == "--save") {
                        _pack.push({name: pacgName[0], version:pacgName[1],postfix:'--save'})
                    }else{
                        _pack.push({name: pacgName[0], version:pacgName[1],postfix:'--save-dev'})
                    }
                }else{
                    if(argvs[argvs.length-1] == "--save") {
                        _pack.push({name: argvs[i], version:'latest',postfix:'--save'})
                    }else{
                        _pack.push({name: argvs[i], version:'latest',postfix:'--save-dev'})
                    }
                }
            }
        }
        if(argvs[argvs.length-1] == "--save-dev") {
            isupdatedevdepend = true
        }
        isupdatepackdep = true
    } else if( argvs.length == 3 && argvs[2] == "install" ) { 
        //ynpm install 命令
        try {
            let pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'),'utf-8'))
            let dependencies = pkgJson.dependencies
            let dependencies_arr = Object.keys(dependencies)
            let devDependencies = pkgJson.devDependencies
            let devDependencies_arr = Object.keys(devDependencies)
            for(let i = 0; i< dependencies_arr.length; i++) {
                _pack.push({ name: dependencies_arr[i], version: dependencies[dependencies_arr[i]], postfix:'--save'})
            }
            for(let i = 0; i< devDependencies_arr.length; i++) {
                _pack.push({ name: devDependencies_arr[i], version: devDependencies[devDependencies_arr[i]], postfix:'--save-dev'})
            }
        } catch(e) {
            console.log(`package.json 找不到或者格式不对`)
        }
        
    } 
    const spinner = ora().start();
    spinner.color = 'green'; 
    // HOST_REGISTRY
    let allInner = install(spinner,process.cwd(),_pack,YON_MIRROR,isupdatepackdep,isupdatedevdepend);//内网缓存中下载
}


function install(spinner,root,pkgs,registry,isupdatepackdep,isupdatedevdepend){    
    co(function* (){
        const argvs = process.argv;

        // Ping内网
        const Ping_Response = yield Ping({
            address: IPCOMPANY,
            port: 8081,
            timeout: 50,
            attempts: 1
        })
        // let registry = Ping_Response.avg ? YON_INNER_MIRROR : YON_MIRROR
        let registry = YON_MIRROR
        const spinner = ora().start();
        spinner.color = 'green';
        
        let npm_registry = `npm --registry=${registry} `;
        
        if(Ping_Response.avg) {
            console.log(chalk.dim('Yonyou Inner Mirror Downloading...\n'));
        } else {
            console.log(chalk.dim('Yonyou Mirror Downloading...\n'));
        }
        const argv_part = argvs.slice(2).join(' ');
        let arg_install = npm_registry + argv_part;
        // execSync(arg_install);
        
        let installPackMap = new Map(),sum=0;
        let arg_common,foot,total=pkgs.length;
        console.time(`updated ${total} packages in`);
        // let status = yield npminstall(arg_install);
        // console.timeEnd("sort");
        // spinner.stop();
        // process.exit(0);
        // return;
        showProcess(spinner,pkgs)
        // console.log(arg_install)
        let status = yield npminstall(arg_install);
        //如果报错就不进行下去
        if(!status){
            spinner.stop();
            process.exit(0);
            return
        }
        // for(let pack = 0; pack < pkgs.length; pack++){
        //     foot = Math.floor((pack+1)/total*100) + "%";
        //     spinner.text = `[${total}/${pack}] Installing ${pkgs[pack].name} package ⬇️...   ${foot}`;
        //     arg_command = `${arg_install} ${pkgs[pack].name}  ${pkgs[pack].postfix}`
        //     console.log('arg_command',arg_command)
        //     let status = yield npminstall(arg_command);
        //     // if(status){
        //         //包下载量统计。
        //         // installPackMap.set("name", pkgs[pack].name)
        //         // installPackMap.set("version", pkgs[pack].version)
        //     // }
        // }
        console.log('\n')
        console.timeEnd(`updated ${total} packages in`);
        spinner.stop();
        // console.log(chalk.bold('\n\nInstall Info:\n' + data[0]));
        // console.log(chalk.yellow('Warn Info:\n' + data[1]));
        console.log('\n')
        console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
        if(isupdatepackdep) {
            updateDependencies(root, pkgs,isupdatedevdepend)
        }
        
        let spinner_axios = ora().start();
        spinner_axios.color = 'green';
        //统计下载次数
        addDownloadNum({installPackMap:JSON.stringify(pkgs)})
        setTimeout(()=>{
            spinner_axios.stop();
            process.exit(0);
        },50)
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        spinner.stop();
        process.exit(0);
    });
}

function npminstall(arg_install){
    return co(function* (){
        try {
            // console.log('===',arg_process)
            yield Exec(arg_install);
            return true;
        } catch (err) {
            console.error(chalk.red('\n' + err));
            return false;
        }
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        return false;
    });
}

function install_bak(spinner,root,pkgs,registry){
    co(function* (){
        yield npminstall({
            root:process.cwd(),
            pkgs,
            // :[ { name: 'bee-table', version: '1.2.7' } ],
         //  registry: 'https://registry.npm.taobao.org',
          registry,
        });
        
        spinner.stop();
        process.exit(0);
    }).catch(err => {
        console.error(chalk.red('\n' + err));
        spinner.stop();
        process.exit(0);
    });
}
function updateDependencies(root, pkgs, isupdatedevdepend) {
    // let root = process.cwd
    let node_modules
    let pkgJson = JSON.parse(fs.readFileSync(path.join(`${root}`, 'package.json')))
    !pkgJson.dependencies?pkgJson.dependencies={}:null
    if(isupdatedevdepend) {
        for(let pkg of pkgs) {
            node_modules = JSON.parse(fs.readFileSync(path.join(`${root}/node_modules/${pkg.name}/`, 'package.json')))
            pkgJson.devDependencies[node_modules.name] = node_modules.version
        }
    } else {
        for(let pkg of pkgs) {
            node_modules = JSON.parse(fs.readFileSync(path.join(`${root}/node_modules/${pkg.name}/`, 'package.json')))
            pkgJson.dependencies[node_modules.name] = node_modules.version
        }
    }
    fs.writeFileSync(path.join(`${root}`, 'package.json'), JSON.stringify(pkgJson, null, '  '), 'utf-8')
}


function showProcess(spinner,pkgs) {
    let text1 = `.`;
    let text2 = `..`;
    let text3 = `...`;
    let time = 0,value,index=0;
    let pkg_arr = pkgs.map((item)=>item.name)
    let pkg_arr_len = pkg_arr.length
    setInterval(() => {
        if(time%3===0){
            value = text1
        }else if(time%3===1){
            value = text2
        }else {
            value = text3
        }
        if(index<pkg_arr_len-1){
            spinner.text = `[${pkg_arr_len}/${index}]Installing ${pkg_arr[index]} package ⬇️ ${value}`
        }else {
            spinner.text = `[${pkg_arr_len}/${pkg_arr_len}]Installing ${pkg_arr[pkg_arr_len-1]} package ⬇️ ${value}`
        }
        index++
        time++
        time===3?time=0:null
    },800)
}
