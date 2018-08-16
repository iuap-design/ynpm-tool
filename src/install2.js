var exec = require('child-process-promise').exec;

var spawn = require('child-process-promise').spawn;

module.exports = (registry,ifHasLog) => {
  const argvs = process.argv;
  let npm_registry = `npm --registry=${registry} `; 
  const argv_part = argvs.slice(2).join(' ');
  let arg_install = npm_registry + argv_part;
  exec(arg_install)
    .then(function (result) {
        // var a  = arguments;
        // console.log("a===",a);
        // console.log("\n");
        // console.log("b===",result);
        // console.log("\n");
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
    .catch(function (err) {
        console.error('ERROR: ', err);
    });

  // console.log(`--registry=${registry} ${argv_part}`)

  // var promise = spawn(`npm`, [`--registry=${registry} ${argv_part}`]);

  // var childProcess = promise.childProcess;

  // console.log('[spawn] childProcess.pid: ', childProcess.pid);
  // childProcess.stdout.on('data', function (data) {
  //     console.log('[spawn] stdout: ', data.toString());
  // });
  // childProcess.stderr.on('data', function (data) {
  //     console.log('[spawn] stderr: ', data.toString());
  // });

  // promise.then(function () {
  //         console.log('[spawn] done!');
  //     })
  //     .catch(function (err) {
  //         console.error('[spawn] ERROR: ', err);
  //     });
}

