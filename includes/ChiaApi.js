let _Logs = require('./Logs');
let request = require('request');

class ChiaApi {
    setConfig(_Config) {
        this._Config = _Config;
    }
    setDownloaded(plot_id) {
        return  new Promise((resolve, reject) => {
            let data = {
                user_token: this._Config.env.user_token,
                user_id: this._Config.env.user_id,
                plot_id: plot_id,
                version: this._Config.version,
            };
            try {
                _Logs.info(`.setDownloaded | ` + JSON.stringify(data));
                let time = new Date().getTime() / 1000;

                request.post(
                    {
                        url: this._Config.url_api + 'plot/setDownloaded',
                        json: data,
                        timeout: 60000
                    },
                    (err, response, body) => {
                        try {
                            time = Math.round((new Date().getTime() / 1000 - time) * 100) / 100;
                            if (err) {
                                _Logs.error(`.setDownloaded | Response | Time ${time}s ` + JSON.stringify(data), err);
                                reject();
                            } else {
                                if ((response) && (response.statusCode === 200)) {
                                    try {
                                        if (!body.error) {
                                            resolve(body);
                                        } else {
                                            _Logs.warning(`.setDownloaded | Wrong status | Time ${time}s` + JSON.stringify(data), body);
                                            reject();
                                        }
                                    } catch (err) {
                                        _Logs.error(`.setDownloaded | Parse | Time ${time}s` + JSON.stringify(data), body);
                                        reject();
                                    }
                                } else {
                                    _Logs.error(`.setDownloaded | response.statusCode | Time ${time}s | ` + (response ? response.statusCode : 'response undefined') + ` ` + JSON.stringify(data), body);
                                    reject();
                                }
                            }
                        } catch (err) {
                            _Logs.error(`.setDownloaded | After connect ` + JSON.stringify(data), err);
                            reject();
                        }
                    }
                );
            } catch (err) {
                _Logs.error(`.setDownloaded | Before connect ` + JSON.stringify(data), err);
                reject();
            }
        });
    }

    setDownloading(plot_id) {
        return  new Promise((resolve, reject) => {
            let data = {
                user_token: this._Config.env.user_token,
                user_id: this._Config.env.user_id,
                plot_id: plot_id,
                version: this._Config.version,
            };
            try {
                _Logs.info(`.setDownloading | ` + JSON.stringify(data));
                let time = new Date().getTime() / 1000;

                request.post(
                    {
                        url: this._Config.url_api + 'plot/setDownloading',
                        json: data,
                        timeout: 60000
                    },
                    (err, response, body) => {
                        try {
                            time = Math.round((new Date().getTime() / 1000 - time) * 100) / 100;
                            if (err) {
                                _Logs.error(`.setDownloading | Response | Time ${time}s ` + JSON.stringify(data), err);
                                reject();
                            } else {
                                if ((response) && (response.statusCode === 200)) {
                                    try {
                                        if (!body.error) {
                                            resolve(body);
                                        } else {
                                            _Logs.warning(`.setDownloading | Wrong status | Time ${time}s` + JSON.stringify(data), body);
                                            reject();
                                        }
                                    } catch (err) {
                                        _Logs.error(`.setDownloading | Parse | Time ${time}s` + JSON.stringify(data), body);
                                        reject();
                                    }
                                } else {
                                    _Logs.error(`.setDownloading | response.statusCode | Time ${time}s | ` + (response ? response.statusCode : 'response undefined') + ` ` + JSON.stringify(data), body);
                                    reject();
                                }
                            }
                        } catch (err) {
                            _Logs.error(`.setDownloading | After connect ` + JSON.stringify(data), err);
                            reject();
                        }
                    }
                );
            } catch (err) {
                _Logs.error(`.setDownloading | Before connect ` + JSON.stringify(data), err);
                reject();
            }
        });
    }

    unSetDownloading(plot_id) {
        return  new Promise((resolve, reject) => {
            let data = {
                user_token: this._Config.env.user_token,
                user_id: this._Config.env.user_id,
                plot_id: plot_id,
                version: this._Config.version,
            };
            try {
                _Logs.info(`.unSetDownloading | ` + JSON.stringify(data));
                let time = new Date().getTime() / 1000;

                request.post(
                    {
                        url: this._Config.url_api + 'plot/unSetDownloading',
                        json: data,
                        timeout: 60000
                    },
                    (err, response, body) => {
                        try {
                            time = Math.round((new Date().getTime() / 1000 - time) * 100) / 100;
                            if (err) {
                                _Logs.error(`.unSetDownloading | Response | Time ${time}s ` + JSON.stringify(data), err);
                                reject();
                            } else {
                                if ((response) && (response.statusCode === 200)) {
                                    try {
                                        if (!body.error) {
                                            resolve(body);
                                        } else {
                                            _Logs.warning(`.unSetDownloading | Wrong status | Time ${time}s` + JSON.stringify(data), body);
                                            reject();
                                        }
                                    } catch (err) {
                                        _Logs.error(`.unSetDownloading | Parse | Time ${time}s` + JSON.stringify(data), body);
                                        reject();
                                    }
                                } else {
                                    _Logs.error(`.unSetDownloading | response.statusCode | Time ${time}s | ` + (response ? response.statusCode : 'response undefined') + ` ` + JSON.stringify(data), body);
                                    reject();
                                }
                            }
                        } catch (err) {
                            _Logs.error(`.unSetDownloading | After connect ` + JSON.stringify(data), err);
                            reject();
                        }
                    }
                );
            } catch (err) {
                _Logs.error(`.unSetDownloading | Before connect ` + JSON.stringify(data), err);
                reject();
            }
        });
    }

    sendAlert(plot_id, type, message) {
        return  new Promise((resolve, reject) => {
            let data = {
                user_token: this._Config.env.user_token,
                user_id: this._Config.env.user_id,
                plot_id: plot_id,
                version: this._Config.version,
                type: type,
                message: message
            };
            try {
                _Logs.info(`.sendAlert | ` + JSON.stringify(data));
                let time = new Date().getTime() / 1000;

                request.post(
                    {
                        url: this._Config.url_api + 'plot/sendAlert',
                        json: data,
                        timeout: 60000
                    },
                    (err, response, body) => {
                        try {
                            time = Math.round((new Date().getTime() / 1000 - time) * 100) / 100;
                            if (err) {
                                _Logs.error(`.sendAlert | Response | Time ${time}s ` + JSON.stringify(data), err);
                                reject();
                            } else {
                                if ((response) && (response.statusCode === 200)) {
                                    try {
                                        if (!body.error) {
                                            resolve(body);
                                        } else {
                                            _Logs.warning(`.sendAlert | Wrong status | Time ${time}s` + JSON.stringify(data), body);
                                            reject();
                                        }
                                    } catch (err) {
                                        _Logs.error(`.sendAlert | Parse | Time ${time}s` + JSON.stringify(data), body);
                                        reject();
                                    }
                                } else {
                                    _Logs.error(`.sendAlert | response.statusCode | Time ${time}s | ` + (response ? response.statusCode : 'response undefined') + ` ` + JSON.stringify(data), body);
                                    reject();
                                }
                            }
                        } catch (err) {
                            _Logs.error(`.sendAlert | After connect ` + JSON.stringify(data), err);
                            reject();
                        }
                    }
                );
            } catch (err) {
                _Logs.error(`.sendAlert | Before connect ` + JSON.stringify(data), err);
                reject();
            }
        });
    }

    getFinished() {
        return  new Promise((resolve, reject) => {
            let data = {
                user_token: this._Config.env.user_token,
                user_id: this._Config.env.user_id,
                version: this._Config.version,
            };
            try {
                _Logs.info(`.getFinished | ` + JSON.stringify(data));
                let time = new Date().getTime() / 1000;

                request.post(
                    {
                        url: this._Config.url_api + 'plot/getFinished',
                        json: data,
                        timeout: 60000
                    },
                    (err, response, body) => {
                        try {
                            time = Math.round((new Date().getTime() / 1000 - time) * 100) / 100;
                            if (err) {
                                _Logs.error(`.getFinished | Response | Time ${time}s ` + JSON.stringify(data), err);
                                reject();
                            } else {
                                if ((response) && (response.statusCode === 200)) {
                                    try {
                                        console.log(body);
                                        if (!body.error) {
                                            resolve(body);
                                        } else {
                                            _Logs.warning(`.getFinished | Wrong status | Time ${time}s` + JSON.stringify(data), body);
                                            reject();
                                        }
                                    } catch (err) {
                                        _Logs.error(`.getFinished | Parse | Time ${time}s` + JSON.stringify(data), body);
                                        reject();
                                    }
                                } else {
                                    _Logs.error(`.getFinished | response.statusCode | Time ${time}s | ` + (response ? response.statusCode : 'response undefined') + ` ` + JSON.stringify(data), body);
                                    reject();
                                }
                            }
                        } catch (err) {
                            _Logs.error(`.getFinished | After connect ` + JSON.stringify(data), err);
                            reject();
                        }
                    }
                );
            } catch (err) {
                _Logs.error(`.getFinished | Before connect ` + JSON.stringify(data), err);
                reject();
            }
        });
    }
}
module.exports = new ChiaApi();