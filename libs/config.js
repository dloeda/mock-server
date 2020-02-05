'use strict';

const path = require('path');

/**
 * Reads app's arguments and store in a object
 **/
function parseArguments() {
  var stdio = require('stdio');
  return stdio.getopt({
    //configuration path
    'conf-file'   : {key: 'c',            args:1, description: 'Name of configuration file'},
    'conf-folder' : {                     args:1, description: 'Path to configuration\'s folder'},
    'routes-file'      : {                args:1, description: 'Path to routes\'s file'},
    //configuration inline
    'mocks'       : {key: 'mocks-folder', args:1, description: 'Path to mocks\'s folder'},
    'port'        : {key: 'p',            args:1, description: 'Listening port'},
    'delay'       : {key: 'd',            args:1, description: 'Delay all responses in ms'},
    'verbose'     : {key: 'v',            args:1, description: 'Enable logging'},
    'Headers'     : {key: 'H',            multiple: true, description: 'Add extra headers to all request'}
  });
}
/**
 * Reads app's a
 * @param {object} config       Object contains app's configuration
 * @param {object} parameters   Object contains some configuration
 **/
function parseOptions(config, parameters) {
  var prop;
  for (prop in parameters) {
    if (parameters.hasOwnProperty(prop) && parameters[prop]) {
      config[prop] = parameters[prop];
    }
  }
}

/**
 * Reads configuration file and store in a app's configuration
 * @param {object} config Object contains app's configuration
 * @param {object} args   Object contains app's arguments
 **/
function readConfigFile(config, args) {
  var fileOptions;

  if (args['conf-file']) {
    config['conf-file'] = args['conf-file'];
  }
  if (args['conf-folder']) {
    config['conf-folder'] = args['conf-folder'];
  }

  try {
    fileOptions = require(process.cwd() + '/' + config['conf-folder'] + config['conf-file'] + '.json');
    parseOptions(config, fileOptions);
  } catch (err) {
    console.info('INFO: Cannot find ' +'.' + path.sep + path.join(config['conf-folder'], config['conf-file'] + '.json') + ' configuration file');
  }
}

/**
 * Reads app's configuration from file and app's inline arguments
 **/
function readConfig() {
  var args = parseArguments();
  var config = {
    'conf-file': 'config',
    'conf-folder': 'config/',
    'routes-file': 'routes',
    'mocks': 'mocks/',
    'info-file': 'info',
    'port': process.env.PORT,
    'ip': process.env.IP,
    'Headers': []
  };
  readConfigFile(config, args);
  parseOptions(config, args);

  return config;
}


// Exports
module.exports = readConfig();
