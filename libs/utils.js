'use strict';

module.exports.fillResponse = function fillResponse(res, file) {
  if (res && file) {
    res.setHeader('Content-Type', file.contentType);
    res.status(file.status).send(file.content);
  }
};