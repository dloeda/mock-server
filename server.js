var fs = require('fs');
var express = require('express');
var app = express();

var PORT = 3000;
var mockFolder = './mocks';

app.all('/**', function (req, res) {
  var path = mockFolder + req.url + '.json';
  if (fs.existsSync(path)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(fs.readFileSync(path).toString());
  } else {
    res.status(404).send('Not found');
  }
});

var server = app.listen(PORT, function () {
  console.info('Mock server listening at http://localhost:%s',  server.address().port);
});
