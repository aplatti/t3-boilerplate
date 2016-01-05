'use strict';

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  // Use jit-grunt instead of load-grunt-tasks here as it dramatically decreases grunt initialization time (27.5s -> 1.5s).
  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  // Configurable options
  var config = {
    app: './app',
    // dist: './dist',
    minimumCoverage: 90 // percents
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      sass: {
        files: ['<%= config.app %>/styles/sass/{,*/}*.{scss,sass}'],
        tasks: ['sass']
        // tasks: ['sass', 'newer:copy']
      }
      // templates: {
      //   files: ['<%= config.app %>/templates/{,*/}*.hbs'],
      //   tasks: ['handlebars', 'newer:copy']
      // },
    },

    // Empties folders to start fresh
    clean: {
      options: {
        force: true
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.app %>/styles/main.css',
            '<%= config.app %>/styles/main.css.map'
          ]
        }]
      },
    },

    // handlebars: {
    //   compile: {
    //     options: {
    //       namespace: 'Handlebars.Templates',
    //       processName: function(filePath) { // input:  app/templates/AddressInputQuestion.hbs
    //         var pieces = filePath.split("/");
    //         return pieces[pieces.length - 1].replace(/\.hbs$/, ''); // output: AddressInputQuestion
    //       },
    //     },
    //     files: {
    //       '<%= config.dist %>/scripts/intakeTemplates.js': [ '<%= config.app %>/templates/*.hbs']
    //     }
    //   },
    //   serve: {
    //     options: {
    //       namespace: 'Handlebars.Templates',
    //       processName: function(filePath) { // input:  app/templates/AddressInputQuestion.hbs
    //         var pieces = filePath.split("/");
    //         return pieces[pieces.length - 1].replace(/\.hbs$/, ''); // output: AddressInputQuestion
    //       }
    //     },
    //     files: {
    //       '<%= config.app %>/scripts/intakeTemplates.js': [ '<%= config.app %>/templates/*.hbs']
    //     }
    //   }
    // },


    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true,
        outputStyle: 'compact',
        includePaths: ['.']
      },
      dist: {
        files: {
          '<%= config.app %>/styles/main.css': '<%= config.app %>/styles/sass/master.scss',
        }
      }
    },


    // Automatically inject Bower components into the HTML file
    wiredep: {
      options: {
        cwd: '.'
      },
      app: {
        src: ['<%= config.app %>/index.html'],
        ignorePath: /^(\.\.\/)*\.\./
      },
      sass: {
        src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /^(\.\.\/)+/
      },
      js: {
        src: ['<%= config.app %>/scripts/{,*/}*.js'],
        options: {
          fileTypes: {
            js: {
              block: /(((?:[\t ])*)\/\/\s*bower:(\S*))((?:\r|\n|.)*?)(\/\/\s*endbower)/gi,
              detect: {
                js: /".*\.js"/gi
              },
              replace: {
                js: "'{{filePath}}',"
              }
            }
          }
        }
      }
    },

  //   // Copies remaining files to places other tasks can use
  //   ,copy: {
  //     dist: {
  //       files: [{
  //         expand: true,
  //         dot: true,
  //         cwd: '<%= config.app %>',
  //         dest: '<%= config.dist %>',
  //         src: [
  //           'styles/*.css',
  //           'images/{,*/}*',
  //         ]
  //       },
  //       {
  //         expand: true,
  //         dot: true,
  //         cwd: '<%= config.app %>',
  //         dest: '<%= config.dist %>',
  //         src: [
  //           'scripts/localization/*.js'
  //         ]
  //       }]
  //     }
  //   },

  });


  grunt.registerTask('build', [
    'clean',
    'sass',
    // 'handlebars',
    'wiredep',
    // 'copy:dist',
  ]);

  grunt.registerTask('default', [
    'build'
  ]);


  grunt.registerTask('serve', 'Prepares files for main serve task', [
    'sass:dist',
    'handlebars:serve',
    'wiredep'
  ]);
};
