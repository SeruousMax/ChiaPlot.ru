let express = require("express");
let bodyParser = require("body-parser");
let _Config = require('./includes/Config');
let _Downloader = require('./includes/Downloader');
let _Logs = require('./includes/Logs');
let kill = require('tree-kill');

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
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    _Config.env.user_id = request.body['user_id'];
    _Config.env.user_token = request.body['user_token'];
    _Config.saveEnv();

    response.send(JSON.stringify({
        version: _Downloader.version,
        patch: _Config.env.patch,
        auto: _Config.env.auto,
    }));
});

app.all("/setAutoDownload", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    _Config.env.auto = (parseInt(request.body['auto']) === 1);
    _Config.env.patch = request.body['patch'];
    _Config.saveEnv();

    _Downloader.getNewDownload();

    response.send(JSON.stringify({
        version: _Downloader.version
    }));
});

app.all("/kill", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    let res = {
        version: _Downloader.version,
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

    let items = [];
    for (let plot_id in  _Downloader.plots) {
        let item = _Downloader.plots[plot_id];
        let progress = {};
        if (item['status'] === 'downloading') {
            progress = item.log.match(/Transferred:.*([0-9].*)\/(.*)\,(.*),(.*),(.*)/gi);
            if (progress)
                if (progress.length > 0) progress = progress[progress.length -1].match(/([0-9].*)\/(.*)\,(.*),(.*),(.*)/i);
        }
        items.push({
            id: item.id,
            dir: item.dir,
            filename: item.filename,
            status: item.status,
            date_start: item.date_start,
            date_done: item.date_done,
            log: item.log.substr(-2000),
            progress: progress,
        });
    }

    response.send(JSON.stringify({
        version: _Downloader.version,
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

    _Logs.info(JSON.stringify(request.body));

    _Downloader.startDownload(request.body['plot_id'], request.body['patch'], request.body['token'], request.body['filename']).then(() => {
        _Config.env.patch = request.body['patch'];
        _Config.saveEnv();
        response.send(JSON.stringify({
            version: _Downloader.version,
            message: 'started'
        }));
    }).catch((error) => {
        response.send(JSON.stringify({
            version: _Downloader.version,
            error: error
        }));
    });
});

app.listen(8096);