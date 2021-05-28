var exec = require('child_process').exec;
var coffeeProcess = exec('start E:\\rclone.exe -v copy gdrive1:84 E:\\  --drive-chunk-size 1M --progress', {windowsHide: false});

coffeeProcess.stdout.pipe(process.stdout);

coffeeProcess.on('error', function(error) {
    console.log(error);
});
coffeeProcess.on('uncaughtException', function (error) {
    console.log(error);
});
coffeeProcess.stdout.on('end', function(data) {
    console.log(data);
});
coffeeProcess.stderr.on('data', function(data) {
    console.log(data);
});
coffeeProcess.on('close', (code, signal) => {
    console.log('close');
});