
'use strict';

var express = require('express');
var config = require('./libs/config');
var finder = require('./libs/finder');
var utils = require('./libs/utils');
var logger = require('./libs/logger');
var app = express();

app.use((req, res, next) =>
  setTimeout(() => next(), res.delay || config.delay || 0))

app.all('/', (req, res) =>
  utils.fillResponse(res,
    finder.getInfo(config)));

app.all('/**', (req, res) =>
  utils.fillResponse(res,
    finder.getMock(config, req)))

if (config.verbose) {
  app.use((req, res) =>
    logger.log(req, res))
}

var server = app.listen(config.port, config.ip, () =>
  console.info('Mock server listening at http://%s:%s', server.address().address, server.address().port))