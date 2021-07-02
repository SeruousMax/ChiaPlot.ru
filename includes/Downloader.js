const { spawn } = require("child_process");
const path = require('path');
let diskusage = require('diskusage-ng');
let fs = require('fs');
let _Logs = require('./Logs');
let _ChiaApi = require('./ChiaApi');
let dateFormat = require("dateformat");

class Downloader {
    plots = {}

    formatBytes(bytes, decimals) {
        if(bytes === 0) return '0 Bytes';
        let k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getDownloadingCount(dir_name) {
        let count = 0;
        for (let plot_id in this.plots) {
            let plot = this.plots[plot_id];
            if ((plot.dir_name === dir_name) && (plot.status === 'downloading')) count++;
        }
        return count;
    }

    async getSizeDir(dir_name) {
        return new Promise((resolve, reject) => {
            diskusage(dir_name, (err, usage) => {
                try {
                    if (err) {
                        if (fs.existsSync(dir_name)) {
                            let info = {
                                available: 0,
                                available_after: 1,
                                total: 0,
                                used: 0
                            };
                            resolve(info);
                        } else {
                            _Logs.error(err);
                            reject(err);
                        }
                    } else {
                        let info = {
                            available: usage.available,
                            available_after: usage.available - (108820103168 + 1088201031) * (this.getDownloadingCount(dir_name) + 1), //101 Gb + 1%
                            total: usage.total,
                            used: usage.used
                        };
                        resolve(info);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    async checkDirs(dirs) {
        for (let dir of dirs) {
            if (fs.existsSync(dir.name)) {
                //file exists
            }
        }
        let result_dir = null;
        for (let dir of dirs) {
            let info = await this.getSizeDir(dir.name);
            if (info.available_after > 0) {
                result_dir = dir;
                break;
            }
            _Logs.info(JSON.stringify({
                dir_name: dir.name,
                total: this.formatBytes(info.total),
                available: this.formatBytes(info.available),
                available_after: this.formatBytes(info.available_after),
                used: this.formatBytes(info.used)
            }));
        }
        return result_dir;
    }

    doneRClone(plot_id, dir, filename) {
        try {
            fs.rename(path.join(dir.name, plot_id.toString(), filename), path.join(dir.name, filename), (err) => {
                if (err) {
                    _Logs.error('.doneRClone rename', err);
                    _ChiaApi.sendAlert(plot_id, 'error', err.message).then().catch(() => {});
                } else {
                    try {
                        fs.rmdir(path.join(dir.name, plot_id.toString()), {recursive: true}, () => {

                        });
                    } catch (e) {
                        _Logs.error('.doneRClone rmdir', e);
                    }
                }
            });
        } catch (e) {
            _Logs.error('.doneRClone before rename', e);
            _ChiaApi.sendAlert(plot_id, 'error', e.message).then().catch(() => {});
        }
        this.plots[plot_id]['status'] = 'downloaded';
        this.plots[plot_id]['date_done'] = dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss");
        _ChiaApi.sendAlert(plot_id, 'done').then().catch(() => {
            _ChiaApi.sendAlert(plot_id, 'done').then().catch(() => {});
        });
        _ChiaApi.setDownloaded(plot_id).then();
    }

    errorRClone(plot_id, message) {
        _Logs.error('.errorRClone', plot_id);
        this.plots[plot_id]['status'] = 'error';
        _ChiaApi.unSetDownloading(plot_id).then();
        _ChiaApi.sendAlert(plot_id, 'error', message).then().catch(() => {
            _ChiaApi.sendAlert(plot_id, 'error', message).then().catch(() => {});
        });
    }

    setConfig(_Config) {
        this._Config = _Config;
        _ChiaApi.setConfig(_Config);
    }

    startRClone(plot_id, dir, token, filename, google_disk_id, root_folder) {
        return new Promise((resolve, reject) => {
            try {
                _ChiaApi.setDownloading(plot_id).then();
                this.plots[plot_id] = {
                    id: plot_id,
                    dir_name: dir.name,
                    filename: filename,
                    status: 'downloading',
                    date_start: dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss"),
                    date_done: null,
                    log: ''
                };
                //let command = `cmd | rclone copy gdrive:${plot_id} ${dir.name}/${plot_id} --use-json-log --drive-chunk-size 64M --drive-token ${token} --progress --config rclone.conf `;
                //_Logs.info(command);

                //this.plots[plot_id].process = exec(command, {windowsHide: true});

                let params = [
                    'copy',
                    //'-vv',
                    `drive${google_disk_id}:${plot_id}`, `${dir.name}/${plot_id}`,
                    '--use-json-log',
                    '--size-only',
                    '--ignore-checksum',
                    '--drive-chunk-size', '64M',
                    //'--drive-token', JSON.parse(token),
                    '--progress', '--config', 'rclone.conf',
                    '--retries', '10',
                    '--retries-sleep', '10s',
                    '--log-level', 'DEBUG',
                ];

                if ((root_folder) && (root_folder !== '')) {
                    params.push('--drive-root-folder-id');
                    params.push(root_folder);
                }

                this.plots[plot_id].process = spawn('rclone', params);
                _Logs.info(params);


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
                    _Logs.error('.startRClone stderr data', this.plots[plot_id].log);
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

    checkForDownload(plot_id, dirs, token, filename) {
        return new Promise((resolve, reject) => {
            let exist = null;
            for (let dir of dirs) {
                if (fs.existsSync(path.join(dir.name, filename))) {
                    exist = dir.name;
                    _ChiaApi.setDownloaded(plot_id).then().catch();
                }
            }
            if (exist) {
                reject('The plot already exists in directory ' + exist);
            } else {
                resolve();
            }
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

    startDownload(plot_id, dirs, token, filename, google_disk_id, config, root_folder) {
        return new Promise((resolve, reject) => {
            if (this.plots[plot_id]) {
                if (this.plots[plot_id].status === 'downloading') {
                    reject('Downloading plot №' + plot_id + ' in progress');
                    _ChiaApi.setDownloading(plot_id).then();
                    return;
                }
            }
            let error = (err) => {
                let error = '';
                if (typeof err === "string")
                    error = err;
                else
                    error = (err.code ? err.code : '') + ' ' + (err.message ? err.message : '');
                reject('Error: ' + error);
            }
            let selectedDir = '';
            this.checkDirs(dirs).then((dir) => {
                if (dir) {
                    selectedDir = dir;
                    return this.writeConfig(config);
                } else {
                    return new Promise((resolve, reject) => {reject('Disk space is low in directories')});
                }
            }).then(() => {
                return this.checkForDownload(plot_id, dirs, token, filename);
            }).then(() => {
                this.startRClone(plot_id, selectedDir, JSON.stringify(token), filename, google_disk_id, root_folder).then(() => {
                    resolve();
                }).catch((err) => {
                    error(err);
                });
            }).catch((err) => {
                error(err);
            });
        });
    }

    constructor() {
        this.startGettingNew();
    }

    startGettingNew() {
        setTimeout(() => {
            this.getNewDownload().then(() => {
                this.startGettingNew();
            }).catch(() => {
                this.startGettingNew();
            });
        }, 10000);
    }

    getNewDownload() {
        return new Promise((resolve, reject) => {
            let count_run = 0;
            let downloading_plots = [];
            for (let plot_id in this.plots) {
                let item = this.plots[plot_id];
                if (item.status === 'downloading') {
                    count_run++;
                    downloading_plots.push(plot_id);
                }
            }

            if (count_run > 0)
                _ChiaApi.pingDownloading(downloading_plots).then(() => {}).catch(() => {});

            if (this._Config.env.auto) {
                try {
                    let count_need_run = this._Config.env.auto_count - count_run;

                    if (count_need_run > 0) {
                        _ChiaApi.getFinished().then((data) => {
                            if (this._Config.env.dirs.length > 0) {
                                if (data['plot']) {
                                    this.startDownload(data['plot']['id'], this._Config.env.dirs, data['plot']['token'], data['plot']['filename'], data['plot']['google_disk_id'], data['plot']['config'], data['plot']['root_folder']).then();
                                }
                            }
                            resolve();
                        }).catch((e) => {
                            reject();
                        });
                    } else {
                        resolve();
                    }
                } catch (err) {
                    _Logs.error(err);
                    reject();
                }
            } else {
                resolve();
            }
        });
    }

}

module.exports = new Downloader();