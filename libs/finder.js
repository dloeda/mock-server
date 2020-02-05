'use strict';

const fs = require('fs');
const vm = require('vm');
const p = require('path');
const responses = require('./responses');
const constants = require('./constants');

let CONTEXT = {};

function composeResponse(data) {
  let response;
  if (data[constants['mock-key']]) {
    const mock = JSON.parse(JSON.stringify(data[constants['mock-key']]));
    delete data[constants['mock-key']].status;
    delete data[constants['mock-key']].content;
    delete data[constants['mock-key']].contentType;
    delete data[constants['mock-key']];
    response = responses.getResponse(mock);
  } else {
    response = responses.getResponse({
      status: 200,
      content: data
    });
  }
  return JSON.parse(JSON.stringify(response));
}

// Allows to have method based routes files e.g. routes.get, routes.post...
function findMock(config, req) {
  let routesMethodPath = p.resolve(process.cwd(), config['conf-folder'], config['routes-file'] + '.' + req.method.toLowerCase());
  let routesPath = p.resolve(process.cwd(), config['conf-folder'], config['routes-file']);
  let mockPath;

  if (fs.existsSync(routesMethodPath + '.json')) {
    mockPath  = findMockPath(routesMethodPath, req, config);
  }

  if (!mockPath) {
    mockPath  = findMockPath(routesPath, req, config);
  }

  let type = new RegExp(`${constants['file.ext:code']}$`).test(mockPath) ? constants['content.code'] : constants['content.data'];

  return {
    path: mockPath || '',
    type,
    error: mockPath ? false : constants['error.not-found']
  };
}

function findMockPath(filePath, req, config) {
  delete require.cache[require.resolve(filePath)];
  let routes = require(filePath);
  let keyPath = Object.keys(routes).find(key => new RegExp(key).test(req.originalUrl));
  return !keyPath ? false : p.join(config.mocks || '', routes[keyPath] || '');
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
  let fileInfo = findFile(config, req);

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
  let fileInfo = findMock(config, req);

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
  let response;
  if (file.error) {
    response = responses.getErrorResponse(file.error);
  } else if (file.type === constants['content.code']) {
    CONTEXT.script = vm.createScript(file.content);
    CONTEXT.script.runInNewContext(file.context);
    response = composeResponse(file.context.mock);
    delete CONTEXT.script;
    delete file.context.mock;
    delete file.context;
  } else if (file.type === constants['content.data']) {
    response = composeResponse(JSON.parse(file.content));
  }
  delete file.content;
  return JSON.parse(JSON.stringify(response));
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
