const { exec, spawn } = require("child_process");
let diskusage = require('diskusage-ng');
let fs = require('fs');
let _Logs = require('./Logs');

class Downloader {
    formatBytes(bytes, decimals) {
        if(bytes === 0) return '0 Bytes';
        var k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getSizePatch(patch) {
        return new Promise((resolve, reject) => {
            diskusage(patch, (err, usage) => {
                try {
                    if (err) {
                        _Logs.error(err);
                        reject(err);
                    } else {
                        let info = {
                            available: usage.available,
                            total: usage.total,
                            used: usage.used
                        };
                        _Logs.info(JSON.stringify(info));
                        resolve(info);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    checkPatch(patch) {
        return new Promise((resolve, reject) => {
            fs.stat(patch, function (err) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    doneRClone() {

    }

    setConfig(_Config) {
        this._Config = _Config;
    }

    startRClone(plot_id, patch, token) {
        return new Promise((resolve, reject) => {
            try {

                let command = (this._Config.env.debug ? '' : 'start ') + `rclone.exe -v copy gdrive:${plot_id} ${patch}  --drive-chunk-size 50M --progress --drive-token ${token} --config rclone.conf`;
                _Logs.info(command);

                let coffeeProcess = exec(command, {encoding: "utf8"});

                coffeeProcess.stdout.pipe(process.stdout);

                coffeeProcess.on('error', (error) => {
                    _Logs.error('.startRClone error', error);
                });
                coffeeProcess.on('uncaughtException', (error) => {
                    _Logs.error('.startRClone Exception', error);
                });
                coffeeProcess.stdout.on('end', (data) => {
                    console.log('.startRClone end', data);
                    this.doneRClone();
                });
                coffeeProcess.stderr.on('data', (data) => {
                    _Logs.error('.startRClone stderr', JSON.stringify(data));
                });
                coffeeProcess.on('close', (code, signal) => {
                    _Logs.info('.startRClone close');
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    startDownload(plot_id, patch, token) {
        return new Promise((resolve, reject) => {
            this.checkPatch(patch).then(() => {
                return this.startRClone(plot_id, patch, JSON.stringify(token));
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('Error:' + (err.code ? err.code : '') + ' ' + (err.message ? err.message : ''));
            })
        });
    }
}

module.exports = new Downloader();