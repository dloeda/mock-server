'use strict';

var constants = require('./constants');

function getResponse(code, content, contentType) {
  return {
    status: code,
    content: content,
    contentType: contentType || 'application/json'
  };
}

function createErrorResponse(code, message) {
  return getResponse(code, {
    error: {
      code: code,
      message: message
    }
  });
}

function getErrorResponse(type) {
  var response = createErrorResponse(500, 'Internal server error');
  if (type === constants['error.not-found']) {
    response = createErrorResponse(404, 'Not Found');
  }
  return response;
}

module.exports = {
  getResponse: getResponse,
  getErrorResponse: getErrorResponse
};