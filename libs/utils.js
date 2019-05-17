'use strict';

module.exports.fillResponse = function fillResponse(res, file) {
  if (res && file) {
    res.setHeader('Content-Type', file.contentType);
    if (file.action) {
      if (file.action.key === 'download') {
        res.status(file.status).download(file.action.value);
      } else {
        throw 'Action not implemented';
      }
    } else {
      res.status(file.status).send(file.content);
    }
  }
};