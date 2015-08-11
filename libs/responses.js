'use strict';

function getResponse(code, content, contentType) {
  return {
    status: code,
    content: content,
    contentType: contentType || 'application/json'
  };
}

function getErrorResponse(code, message) {
  return getResponse(code, {
    error: {
      code: code,
      message: message
    }
  });
}

module.exports = {
  200: getResponse(200),
  404: getErrorResponse(404, 'Not Found'),
  500: getErrorResponse(500, 'Internal server error'),
  getResponse: getResponse
};