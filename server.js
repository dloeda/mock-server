/*eslint no-console:1*/
'use strict';

var express = require('express');
var config = require('./libs/config');
var finder = require('./libs/finder');
var utils = require('./libs/utils');
var app = express();

app.all('/', function (req, res) {
  utils.fillResponse(res,
    finder.getFile(config['conf-folder'], config['info-file']));
});

app.all('/**', function (req, res) {
  utils.fillResponse(res,
    finder.getFile(config.mocks, req.url));
});

var server = app.listen(config.port, config.ip, function () {
  console.info('Mock server listening at http://%s:%s', server.address().address, server.address().port);
});