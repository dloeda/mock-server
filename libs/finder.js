'use strict';

var responses = require('./responses');
var constants = require('./constants');

function composeResponse(data) {
  var response;
  if (data[constants['mock-key']]) {
    response = responses.getResponse(data.status, data.content, data.contentType);
  } else {
    response = responses.getResponse(200, data);
  }
  return response;
}

function openfile(path) {
  var result;
  try {
    console.log(path);
    result = composeResponse(require(path));
  } catch (err) {
    result = responses['404'];
  }
  return result;
}

// Exports
module.exports.getFile = function getFile(folder, path) {
  return openfile('../' + folder + path + '.json');
};