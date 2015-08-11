'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    eslint: {
      src: ['Gruntfile.js', 'server.js', 'libs/*.js'],
      options: {
        configFile: 'grunt-config/eslint.json'
      }
    },
    express: {
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    watch: {
      express: {
        files: ['server.js', 'libs/*.js'],
        tasks: ['eslint', 'express:dev'],
        options: {
          spawn: false
        }
      }
    }
  });

  //Register task(s)
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  // Default task(s).
  grunt.registerTask('default', ['eslint', 'express:dev', 'watch']);
};