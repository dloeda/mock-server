'use strict';

/**
 * Reads app's arguments and store in a object
 **/
function parseArguments () {
  var stdio = require('stdio');
  return stdio.getopt({
    //configuration path
    'conf-file'   : {key: 'c',            args:1, description: 'Name of configuration file'},
    'conf-folder' : {                     args:1, description: 'Path to configuration\'s folder'},
    //configuration inline
    'mocks'       : {key: 'mocks-folder', args:1, description: 'Path to mocks\'s folder'},
    'port'        : {key: 'p',            args:1, description: 'Listening port'}
  });
}

/**
 * Reads app's a
 * @param {object} config       Object contains app's configuration
 * @param {object} parameters   Object contains some configuration
 **/
function parseOptions (config, parameters) {
  var prop;
  for (prop in parameters) {
    if (parameters.hasOwnProperty(prop) && parameters[prop]){
      config[prop] = parameters[prop];
    } 
  }
};

/**
 * Reads configuration file and store in a app's configuration
 * @param {object} config Object contains app's configuration
 * @param {object} args   Object contains app's arguments
 **/
function readConfigFile (config, args) {
  var fileOptions;

  if (args['conf-file']) {
    config['conf-file'] = args['conf-file']
  }
  if (args['conf-folder']) {
    config['conf-folder'] = args['conf-folder']
  } 

  try {
    fileOptions = require ('../' + config['conf-folder'] + config['conf-file']);
    parseOptions(config, fileOptions);
  } catch (err) {
    console.info('INFO: Cannot find ' + config['conf-folder'] + config['conf-file'] + ' configuration file');
  }
};

/**
 * Reads app's configuration from file and app's inline arguments
 **/
function readConfig () {
  var args = parseArguments();
  var config = {
    'conf-file'   : 'config.json',
    'conf-folder' : 'config/',
    'mocks'       : './mocks/',
    'port'        : '3000'
  };
  
  readConfigFile(config, args);
  parseOptions(config, args);

  return config;
}


// Exports
module.exports = readConfig();