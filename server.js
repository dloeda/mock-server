
'use strict';

var express = require('express');
var config = require('./libs/config');
var finder = require('./libs/finder');
var utils = require('./libs/utils');
var app = express();

app.all('/', function (req, res) {
  utils.fillResponse(res,
    finder.getInfo(config));
});

app.all('/**', function (req, res) {
  utils.fillResponse(res,
    finder.getMock(config, req));
});

var server = app.listen(config.port, config.ip, function () {
  console.info('Mock server listening at http://%s:%s', server.address().address, server.address().port);
});