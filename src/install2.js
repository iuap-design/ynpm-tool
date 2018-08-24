var exec = require('child-process-promise').exec;

var spawn = require('child-process-promise').spawn;

module.exports = (registry,ifHasLog) => {
  const argvs = process.argv;
  let npm_registry = `npm --registry=${registry} `; 
  const argv_part = argvs.slice(2).join(' ');
  let arg_install = npm_registry + argv_part;
  exec(arg_install)
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
    .catch(function (err) {
        console.error('ERROR: ', err);
    }); 
}

