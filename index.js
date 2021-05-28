let express = require("express");
let bodyParser = require("body-parser");
let _Config = require('./includes/Config');
let _Downloader = require('./includes/Downloader');
let _Logs = require('./includes/Logs');

let app = express();
let jsonParser = bodyParser.json();

_Downloader.setConfig(_Config);

let allowedOrigins = ["http://chiaplot.ru","https://chiaplot.ru", "http://localhost", "http://chiaplot.loc"]

app.all("/get", jsonParser, function (request, response) {

    let origin = request.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1){
        response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    response.send(JSON.stringify({
        version: '1',
        patch: _Config.env.patch,
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

    _Downloader.startDownload(request.body['plot_id'], request.body['patch'], request.body['token']).then(() => {
        _Config.env.patch = request.body['patch'];
        _Config.saveEnv();
        response.send(JSON.stringify({
            message: 'started'
        }));
    }).catch((error) => {
        response.send(JSON.stringify({
            error: error
        }));
    });
});

app.listen(8096);