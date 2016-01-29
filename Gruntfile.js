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
    dist: './dist',
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
      },
      templates: {
        files: ['<%= config.app %>/templates/{,*/}*.hbs'],
        tasks: ['handlebars']
      },
    },


    browserSync: {
      options: {
        notify: false,
        background: true,
        watchOptions: {
          ignored: ''
        }
      },
      livereload: {
        options: {
          files: [
            '<%= config.app %>/{,*/}*.html',
            '<%= config.app %>/styles/{,*/}*.css',
            '<%= config.app %>/images/{,*/}*',
            '<%= config.app %>/scripts/{,*/}*.js'
          ],
          port: 9000,
          server: {
            baseDir: ['<%= config.app %>', config.app],
            routes: {
              '/bower_components': './bower_components',
              '/doc': './doc'
            }
          }
        }
      }
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
            '<%= config.app %>/styles/main.css.map',
            '<%= config.app %>/scripts/compiled-templates.js',
            '<%= config.dist %>'
          ]
        }]
      },
    },

    handlebars: {
      compile: {
        options: {
          namespace: 'Handlebars.Templates',
          processName: function(filePath) { // input:  app/templates/AddressInputQuestion.hbs
            var pieces = filePath.split("/");
            return pieces[pieces.length - 1].replace(/\.hbs$/, ''); // output: AddressInputQuestion
          },
        },
        files: {
          '<%= config.app %>/scripts/compiled-templates.js': [ '<%= config.app %>/templates/*.hbs']
        }
      }
    },


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

    useminPrepare: {
      options: {
        dest: '<% config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: [
          '.tmp',
          '<%= config.dist %>',
          '<%= config.dist %>/scripts',
          '<%= config.dist %>/styles',
          '.'
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html']
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            'styles/*.css',
            'styles/*.map',
            'images/{,*/}*',
            'fonts/{,*}*',
            '{,*/}*.html'
          ]
        }]
      }
    },
    
    jsdoc : {
      dist : {
        src: ['<%= config.app %>/scripts/{,*/}*.js'],
        options: {
          configure: './jsdoc.conf',
          'private': true
        }
      }
    }
  });


  grunt.registerTask('doc', [
    'jsdoc:dist'
  ]);


  grunt.registerTask('build', [
    'clean',
    'wiredep',
    'useminPrepare',
    'sass',
    'handlebars',
    'concat',
    'uglify',
    'cssmin',
    'copy:dist',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);


  
  grunt.registerTask('serve', 'Prepares files for main serve task', [
    'clean',
    'sass',
    'handlebars',
    'wiredep',
    'browserSync:livereload',
    'watch'
  ]);
};
