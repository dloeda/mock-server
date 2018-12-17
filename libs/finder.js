'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const responses = require('./responses');
const constants = require('./constants');

function composeResponse(data) {
  var mock = data[constants['mock-key']],
    response;
  if (mock) {
    response = responses.getResponse(mock.status, mock.content, mock.contentType);
  } else {
    response = responses.getResponse(200, data);
  }
  return response;
}

function findMock(config, req) {
  let routesPath = `${process.cwd()}/${config['conf-folder']}${config['routes-file']}`;
  delete require.cache[require.resolve(routesPath)];
  let routes = require(routesPath);
  let keyPath = Object.keys(routes).find(key => new RegExp(key).test(req.originalUrl));
  let mockPath = path.join(config.mocks || '', routes[keyPath] || '');
  let type = new RegExp(`${constants['file.ext:code']}$`).test(mockPath) ? constants['content.code'] : constants['content.data'];

  return {
    path: mockPath,
    type,
    error: keyPath ? false : constants['error.not-found']
  };
}



function findFile(config, req) {
  var filePath,
    defaultFilePath,
    error = false,
    method = '.' + (req.method || '').toLowerCase(),
    path,
    type;

  if (req.params) {
    filePath = config.mocks + '/' + req.params[0];
  } else {
    filePath = config['conf-folder'] + config['info-file'];
  }
  defaultFilePath = filePath.substr(0, filePath.lastIndexOf('/')) + '/' + constants['file.name.default'];

  if (fs.existsSync(filePath + method + constants['file.ext:code'])) {
    path = filePath + method + constants['file.ext:code'];
    type = constants['content.code'];
  } else if (fs.existsSync(filePath + method + constants['file.ext:data'])) {
    path = filePath + method + constants['file.ext:data'];
    type = constants['content.data'];
  } else if (fs.existsSync(filePath + constants['file.ext:code'])) {
    path = filePath + constants['file.ext:code'];
    type = constants['content.code'];
  } else if (fs.existsSync(filePath + constants['file.ext:data'])) {
    path = filePath + constants['file.ext:data'];
    type = constants['content.data'];
  } else if (fs.existsSync(defaultFilePath + method + constants['file.ext:code'])) {
    path = defaultFilePath + method + constants['file.ext:code'];
    type = constants['content.code'];
  } else if (fs.existsSync(defaultFilePath + method + constants['file.ext:data'])) {
    path = defaultFilePath + method + constants['file.ext:data'];
    type = constants['content.data'];
  } else if (fs.existsSync(defaultFilePath + constants['file.ext:code'])) {
    path = defaultFilePath + constants['file.ext:code'];
    type = constants['content.code'];
  } else if (fs.existsSync(defaultFilePath + constants['file.ext:data'])) {
    path = defaultFilePath + constants['file.ext:data'];
    type = constants['content.data'];
  } else {
    error = constants['error.not-found'];
  }

  return {
    error: error,
    path: path,
    type: type
  };
}

function openFile(config, req) {
  var fileInfo = findFile(config, req);

  if (fileInfo.error) return fileInfo;

  fileInfo.content = fs.readFileSync(fileInfo.path);
  if (fileInfo.type === constants['content.code']) {
    fileInfo.context = {
      req: req,
      params: req.params,
      query: req.query,
      mock: false
    };
  }
  return fileInfo;
}

function openMock(config, req) {
  var fileInfo = findMock(config, req);

  if (fileInfo.error) return fileInfo;

  fileInfo.content = fs.readFileSync(fileInfo.path);
  if (fileInfo.type === constants['content.code']) {
    fileInfo.context = {
      req: req,
      params: req.params,
      query: req.query,
      mock: false
    };
  }
  return fileInfo;
}

function parseFile(file) {
  var response;
  if (file.error) {
    response = responses.getErrorResponse(file.error);
  } else if (file.type === constants['content.code']) {
    var script = vm.createScript(file.content);
    script.runInNewContext(file.context);
    response = composeResponse(file.context.mock);
  } else if (file.type === constants['content.data']) {
    response = composeResponse(JSON.parse(file.content));
  }
  return response;
}

function getFile(config, req) {
  return parseFile(openFile(config, req));
}

function getMock(config, req) {
  return parseFile(openMock(config, req));
}

function getInfo(config) {
  return getFile(config, {
    path: (config['conf-folder'] + config['info-file'])
  });
}

// Exports
module.exports = {
  getFile,
  getInfo,
  getMock
};
