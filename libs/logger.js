'use strict';
const log = function log(req, res) {
  console.info('\x1b[34m',
    (new Date()).toLocaleString(),
    `${req.method} ${req.originalUrl}`,
    res.statusCode < 400 ? '\x1b[32m\t' : '\x1b[31m\t',
    res.statusCode,
    '\x1b[0m'
  );
};

module.exports = {
  log
};