let express = require("express");
let bodyParser = require("body-parser");
let _Config = require('./includes/Config');
let _Downloader = require('./includes/Downloader');
let _Logs = require('./includes/Logs');
const https = require('https');
const fs = require('fs');

let app = express();
let jsonParser = bodyParser.json();

_Downloader.setConfig(_Config);

let allowedOrigins = ["http://chiaplot.ru","https://chiaplot.ru", "http://localhost", "http://chiaplot.loc"]

_Logs.info('ChiaPlot.ru Started');

app.all("/get", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,content-type,Accept");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Access-Control-Request-Private-Network', 'true');

    _Config.env.user_id = request.body['user_id'];
    _Config.env.user_token = request.body['user_token'];
    _Config.saveEnv();

    response.send(JSON.stringify({
        version: _Config.version,
        dirs: _Config.env.dirs,
        auto: _Config.env.auto,
        auto_count: _Config.env.auto_count,
    }));
});

app.all("/setAutoDownload", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Access-Control-Request-Private-Network', 'true');

    let dirs = [];
    if (request.body['dirs']) {
        for (let dir of request.body['dirs']) {
            dirs.push(dir);
        }
    }

    _Config.env.auto = (parseInt(request.body['auto']) === 1);
    _Config.env.auto_count = parseInt(request.body['auto_count']);
    _Config.env.dirs = dirs;
    _Config.saveEnv();

    response.send(JSON.stringify({
        version: _Config.version
    }));
});

app.all("/kill", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Access-Control-Request-Private-Network', 'true');

    let res = {
        version: _Config.version,
    };

    if ((_Downloader.plots[request.body['plot_id']]) && (_Downloader.plots[request.body['plot_id']].process)) {
        //kill(_Downloader.plots[request.body['plot_id']].process.pid, 'SIGKILL');
        _Downloader.plots[request.body['plot_id']].process.kill()
        _Downloader.plots[request.body['plot_id']]['status'] = 'cancel';
        res.killed = true;
    } else {
        res.killed = false;
    }

    response.send(JSON.stringify(res));
});


app.all("/getList", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Access-Control-Request-Private-Network', 'true');

    let items = [];
    for (let plot_id in  _Downloader.plots) {
        let item = _Downloader.plots[plot_id];
        let progress = {};
        if (item['status'] === 'downloading') {
            progress = item.log.match(/Transferred:.*([0-9].*)\/(.*)\,(.*),(.*),(.*)/gi);
            if (progress)
                if (progress.length > 0) progress = progress[progress.length -1].match(/([0-9].*)\/(.*)\,(.*),(.*),(.*)/i);
        }
        items.unshift({
            id: item.id,
            dir: item.dir_name,
            filename: item.filename,
            status: item.status,
            date_start: item.date_start,
            date_done: item.date_done,
            log: item.log.substr(-2000),
            progress: progress,
        });
    }

    response.send(JSON.stringify({
        version: _Config.version,
        items: items,
        limit: 100000
    }));
});

app.all("/download", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Access-Control-Request-Private-Network', 'true');

    _Logs.info(JSON.stringify(request.body));

    let dirs = [];
    if (request.body['dirs']) {
        for (let dir of request.body['dirs']) {
            dirs.push(dir);
        }
    }

    _Downloader.startDownload(request.body['plot_id'], dirs, request.body['token'], request.body['filename'], request.body['google_disk_id'], request.body['config'], request.body['root_folder']).then(() => {
        _Config.env.dirs = request.body['dirs'];
        _Config.saveEnv();
        response.send(JSON.stringify({
            version: _Config.version,
            message: 'started'
        }));
    }).catch((error) => {
        response.send(JSON.stringify({
            version: _Config.version,
            error: error
        }));
    });
});

//app.listen(8096);

const httpsOptions = {
    key: fs.readFileSync('./ssl/privkey.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
}
const server = https.createServer(httpsOptions, app).listen(8096, () => {

});