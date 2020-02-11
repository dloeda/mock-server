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
  let mockPath = {};

  if (fs.existsSync(routesMethodPath + '.json')) {
    mockPath  = findMockPath(routesMethodPath, req, config);
  }

  if (!mockPath.path) {
    mockPath  = findMockPath(routesPath, req, config);
  }

  let type = new RegExp(`${constants['file.ext:code']}$`).test(mockPath.path) ? constants['content.code'] : constants['content.data'];

  let {path, params, query} = mockPath
  return {
    path,
    params,
    query,
    type,
    error: mockPath.path ? false : constants['error.not-found']
  };
}

function getRequestParams(req, match) {
  let parsedUrl = match
  let replaced = []
  let idx = 1
  while(/{{\w+}}/.test(parsedUrl)) {
    replaced.push(parsedUrl.match(/{{(\w+)}}/)[1] + '=$' + idx++)
    parsedUrl = parsedUrl.replace(/{{(\w+)}}/, '(.*)')
  }

  let stringParams = req.path.replace(new RegExp(`.*${parsedUrl}.*`), replaced.join(','))
  
  return stringParams
    .split(',')
    .reduce((acc, param) => {
      let splitted = param.split('=')
      acc[splitted[0]] = splitted[1]
      return acc
    }, {})
}

function findMockPath(filePath, req, config) {
  delete require.cache[require.resolve(filePath)];
  let routes = require(filePath);
  let keyPath = Object.keys(routes).find(
    key => new RegExp(key.replace(/{{(.*)}}/g, "(.*)"))
      .test(req.originalUrl) && key);

  
  let params = getRequestParams(req, keyPath)
  let path = !keyPath ? false : p.join(config.mocks || '', routes[keyPath] || '')
  let query = req.query

  return {
    path,
    params,
    query
  }
}

function openMock(config, req) {
  let fileInfo = findMock(config, req);

  if (fileInfo.error) return fileInfo;

  fileInfo.content = fs.readFileSync(fileInfo.path);
  if (fileInfo.type === constants['content.code']) {
    fileInfo.context = {
      req: req,
      params: fileInfo.params,
      query: fileInfo.query,
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


function getMock(config, req) {
  return parseFile(openMock(config, req));
}

// Exports
module.exports = {
  getMock
};
