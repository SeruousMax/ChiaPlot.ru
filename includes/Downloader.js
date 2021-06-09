const { spawn } = require("child_process");
const path = require('path');
let diskusage = require('diskusage-ng');
let fs = require('fs');
let _Logs = require('./Logs');
let _ChiaApi = require('./ChiaApi');
let dateFormat = require("dateformat");

class Downloader {
    plots = {}
    /*
    formatBytes(bytes, decimals) {
        if(bytes === 0) return '0 Bytes';
        let k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getSizeDir(dir) {
        return new Promise((resolve, reject) => {
            diskusage(dir, (err, usage) => {
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
    }*/

    checkDir(dir) {
        return new Promise((resolve, reject) => {
            fs.stat(dir, function (err) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    doneRClone(plot_id, dir, filename) {
        try {
            fs.rename(path.join(dir, plot_id.toString(), filename), path.join(dir, filename), (err) => {
                if (err) {
                    _Logs.error('.doneRClone rename', err);
                } else {
                    try {
                        fs.rmdir(path.join(dir, plot_id.toString()), {recursive: true}, () => {

                        });
                    } catch (e) {
                        _Logs.error('.doneRClone rmdir', e);
                    }
                }
            });
        } catch (e) {
            _Logs.error('.doneRClone before rename', e);
        }
        this.plots[plot_id]['status'] = 'downloaded';
        this.plots[plot_id]['date_done'] = dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss");
        _ChiaApi.sendAlert(plot_id, 'done').then().catch(() => {
            _ChiaApi.sendAlert(plot_id, 'done').then().catch(() => {});
        });
        _ChiaApi.setDownloaded(plot_id).then();
        this.getNewDownload();
    }

    errorRClone(plot_id, message) {
        _Logs.error('.errorRClone', plot_id);
        this.plots[plot_id]['status'] = 'error';
        _ChiaApi.unSetDownloading(plot_id).then();
        _ChiaApi.sendAlert(plot_id, 'error', message).then().catch(() => {
            _ChiaApi.sendAlert(plot_id, 'error', message).then().catch(() => {});
        });
        setTimeout(() => {
            this.getNewDownload();
        }, 60000);
    }

    setConfig(_Config) {
        this._Config = _Config;
        _ChiaApi.setConfig(_Config);
        this.getNewDownload();
    }

    startRClone(plot_id, dir, token, filename, doogle_disk_id) {
        return new Promise((resolve, reject) => {
            try {
                _ChiaApi.setDownloading(plot_id).then();
                this.plots[plot_id] = {
                    id: plot_id,
                    dir: dir,
                    filename: filename,
                    status: 'downloading',
                    date_start: dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss"),
                    date_done: null,
                    log: ''
                };
                //let command = `cmd | rclone copy gdrive:${plot_id} ${dir}/${plot_id} --use-json-log --drive-chunk-size 64M --drive-token ${token} --progress --config rclone.conf `;
                //_Logs.info(command);

                //this.plots[plot_id].process = exec(command, {windowsHide: true});
                let params = [
                    'copy',
                    `drive${doogle_disk_id}:${plot_id}`, `${dir}/${plot_id}`,
                    '--use-json-log',
                    '--drive-chunk-size', '64M',
                 //   '--drive-token', JSON.parse(token),
                    '--progress', '--config', 'rclone.conf',
                    '--retries', '100',
                    '--retries-sleep', '10s',
                    '--log-level', 'DEBUG',
                ];
                this.plots[plot_id].process = spawn('rclone', params);
                console.log(params);


                this.plots[plot_id].process.on('error', (error) => {
                    this.plots[plot_id].log += error.message;
                    this.errorRClone(plot_id, error.message);
                    this.plots[plot_id].log += error.message;
                    _Logs.error('.startRClone error', error);
                });
                this.plots[plot_id].process.on('uncaughtException', (error) => {
                    this.plots[plot_id].log += error.message;
                    this.errorRClone(plot_id, error.message);
                    this.plots[plot_id].log += error.message;
                    _Logs.error('.startRClone Exception', error);
                });

                this.plots[plot_id].process.stdout.on('data', (data) => {
                    this.plots[plot_id].log += data;

                    this.plots[plot_id].log = this.plots[plot_id].log.substr(-2000);

                    //console.log('.startRClone stdout data', this.plots[plot_id].log);
                });
                this.plots[plot_id].process.stdout.on('end', (data) => {
                    if (data) {
                        this.plots[plot_id].log += data;
                        this.plots[plot_id].log = this.plots[plot_id].log.substr(-2000);
                    }
                    if (
                        (this.plots[plot_id].log.match(/Checks:(.*)1 \/ 1,/gi)) && (!this.plots[plot_id].log.match(/Transferred:(.*)0 \/ 1,/gi)) ||
                        (this.plots[plot_id].log.match(/Transferred:(.*)1 \/ 1,/gi)) && (!this.plots[plot_id].log.match(/Checks:(.*)0 \/ 1,/gi)) ||
                        (this.plots[plot_id].log.match(/Checks:(.*)1 \/ 1,/gi)) && (this.plots[plot_id].log.match(/Transferred:(.*)1 \/ 1,/gi))
                    ) {
                        this.doneRClone(plot_id, dir, filename);
                    }
                });
                this.plots[plot_id].process.stderr.on('data', (data) => {
                    this.plots[plot_id].log += data;
                    this.plots[plot_id].log = this.plots[plot_id].log.substr(-2000);
                });

                this.plots[plot_id].process.stderr.on('end', (data) => {
                    this.plots[plot_id].process.kill();
                    _ChiaApi.unSetDownloading(plot_id).then();
                    console.log('.startRClone stderr data', this.plots[plot_id].log);
                    if (!this.plots[plot_id].log.match(/Transferred:(.*)1 \/ 1,/gi))
                        this.errorRClone(plot_id, this.plots[plot_id].log);
                });

                this.plots[plot_id].process.on('close', (code, signal) => {
                    this.plots[plot_id].log += ' Closed';
                    _ChiaApi.unSetDownloading(plot_id).then();
                    _Logs.info('.startRClone close');
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    checkForDownload(plot_id, dir, token, filename) {
        return new Promise((resolve, reject) => {
            fs.stat(path.join(dir, filename), (err, stats) => {
                if (err) {
                    resolve();
                } else {
                    _ChiaApi.setDownloaded(plot_id);
                    this.getNewDownload();
                    reject('The plot already exists in directory');
                }
            });
        });
    }

    writeConfig(config) {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFileSync("rclone.conf", config);
                resolve();
            } catch(e) {
                reject(e);
            }
        });
    }

    startDownload(plot_id, dir, token, filename, doogle_disk_id, config) {
        return new Promise((resolve, reject) => {
            if (this.plots[plot_id]) {
                if (this.plots[plot_id].status === 'downloading') {
                    reject('Downloading plot №' + plot_id + ' in progress');
                    _ChiaApi.setDownloading(plot_id).then();
                    this.getNewDownload();
                    return;
                }
            }
            this.checkDir(dir).then(() => {
                return this.writeConfig(config);
            }).then(() => {
                return this.checkForDownload(plot_id, dir, token, filename);
            }).then(() => {
                return this.startRClone(plot_id, dir, JSON.stringify(token), filename, doogle_disk_id);
            }).then(() => {
                resolve();
            }).catch((err) => {
                let error = '';
                if (typeof err === "string")
                    error = err;
                else
                    error = (err.code ? err.code : '') + ' ' + (err.message ? err.message : '');
                reject('Error: ' + error);
            });
        });
    }

    getNewDownload() {
        if (this._Config.env.auto) {
            setTimeout(() => {
                _ChiaApi.getFinished().then((data) => {
                    if (this._Config.env.patch) {
                        if (data['plot']) {
                            this.startDownload(data['plot']['id'], this._Config.env.patch, data['plot']['token'], data['plot']['filename'], data['plot']['google_disk_id'], data['plot']['config']).then();
                        } else {
                            this.getNewDownload();
                        }
                    }
                }).catch((e) => {
                    setTimeout(() => {
                        this.getNewDownload();
                    }, 3000);
                });
            }, 5000);
        }
    }

}

module.exports = new Downloader();