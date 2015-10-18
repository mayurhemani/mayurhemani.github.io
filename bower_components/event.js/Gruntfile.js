module.exports = function (grunt) {
    'use strict';

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var gruntConfig = {
      // Metadata
      pkg: grunt.file.readJSON('bower.json'),

      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
              '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
              '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.authors.join(", ") %>' +
              '*/\n',

      // Task configuration
      uglify: {
        options: {
          compress: true,
          banner: '<%= banner %>'
        },
        dist: {
          src: ['./src/event.js'],
          dest: './dist/event.min.js'
        }
      }
    };

    // Project configuration
    grunt.initConfig(gruntConfig);

    // Tasks
    grunt.registerTask('default', ['uglify']);
};