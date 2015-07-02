var fs = require('fs');
var express = require('express');
var config = require('./libs/config');
var app = express();

app.all('/**', function (req, res) {
  var path = config.mocks + req.url + '.json';
  if (fs.existsSync(path)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(fs.readFileSync(path).toString());
  } else {
    res.status(404).send('Not found');
  }
});

app.all('/**', function (req, res) { 
  res.status(404).send('Not found');
});

var server = app.listen(config.port, function () {
  console.info('Mock server listening at http://localhost:%s',  server.address().port);
});
