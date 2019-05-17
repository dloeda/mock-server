'use strict';

var constants = require('./constants');

function getAction(mock) {
  var actionKey = Object.keys(mock).find(key => key.startsWith('@'));
  if (actionKey) {
    return {
      key: actionKey.substr(1),
      value: mock[actionKey]
    };
  }
}

function getResponse(mock = {}) {
  return {
    status: mock.status || 200,
    content: JSON.parse(JSON.stringify(mock.content || {})),
    contentType: mock.contentType || 'application/json',
    action: getAction(mock)
  };
}

function createErrorResponse(code, message) {
  return getResponse({
    status: code,
    content: {
      error: {
        code: code,
        message: message
      }
    }
  });
}

function getErrorResponse(type) {
  let response = createErrorResponse(500, 'Internal server error');
  if (type === constants['error.not-found']) {
    response = createErrorResponse(404, 'Not Found');
  }
  return response;
}

module.exports = {
  getResponse: getResponse,
  getErrorResponse: getErrorResponse
};