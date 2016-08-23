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
      scss: {
        files: ['<%= config.app %>/**/*.scss'],
        tasks: ['scss-build'],
        options: {
          livereload: true,
          event: ['all']
        }
      },
      templates: {
        files: ['<%= config.app %>/**/*.hbs'],
        tasks: ['handlebars'],
        options: {
          livereload: true,
          event: ['all']
        }
      },
      //run injector:js task when file inside 'app' folder added or deleted
      js_injector: {
        files: ['<%= config.app %>/**/*.js'],
        tasks: ['injector:js'],
        options: {
          livereload: true,
          event: ['added', 'deleted']
        }
      }
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
            '<%= config.app %>/**/*.html',
            '<%= config.app %>/**/*.css',
            '<%= config.app %>/images/**/*',
            '<%= config.app %>/**/*.js'
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
            config.dist,
            '.tmp'
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
          '<%= config.app %>/scripts/compiled-templates.js': [ '<%= config.app %>/**/*.hbs']
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
          '<%= config.app %>/styles/main.css': '<%= config.app %>/styles/scss/master.scss',
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
      scss: {
        src: ['<%= config.app %>/**/*.scss'],
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

    //parse file to inject references
    injector: {
      options: {},

      scss: {
        options: {
          template: '<%= config.app %>/styles/scss/master.scss',
          ignorePath: ['<%= config.app %>/styles/scss', config.app],
          starttag: '/** injector:{{ext}} */',
          endtag: '/** endinjector */'
          ,transform: function(file) {
            if (file.indexOf('/modules/') === 0) {
              // scss files in the /app/styles/modules directory
              return ',"' + file.substring(1).replace(/\.scss$/, '') + '"';  // substring(1) chopps off leading "/"
            } else {
              // all other scss files
              return ',"' + '../..' + file.replace(/\.scss$/,'') + '"';

              grunt.log.ok(file);
            }
            // var newFilePath = (',"../..' + file + '"').replace('../../styles/', '');
            // grunt.log.ok('injector scss:' + file + ' => ' + newFilePath);
            // return newFilePath;
          }
        },
        files: {
          '<%= config.app %>/styles/scss/master.scss': ['<%= config.app%>/**/*.scss', '!<%= config.app %>/styles/scss/{base,master,mixins,reset,states,variables}.scss']
        }
      },

      //inject script file references into 'index.html'
      js: {
        options: {
          template: '<%= config.app %>/index.html',
          ignorePath: config.app
        },
        files: {
          '<%= config.app %>/index.html': ['<%= config.app %>/**/*.js', '!<%= config.app %>/scripts/{main,compiled-templates}.js']
        }
      }
    },


    useminPrepare: {
      options: {
        dest: config.dist
      },
      html: '<%= config.app %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: [
          '.tmp/concat'
        ]
      },
      html: ['<%= config.dist %>/**/*.html']
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: config.app,
          dest: config.dist,
          src: [
            'images/**/*',
            'fonts/**/*',
            '**/*.html'
          ]
        }]
      }
    },
    
    jsdoc : {
      dist : {
        src: ['<%= config.app %>/**/*.js'],
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

  grunt.registerTask('scss-build', [
    'injector:scss', // dynamically create /app/assets/styles/master.scss with imports for all scss files
    'sass'          // compiles /app/assets/styles/master.scss into /app/main.css and /app/main.css.map
  ]);

  grunt.registerTask('build', [
    'clean',
    'wiredep',
    'useminPrepare',
    'scss-build',
    'handlebars',
    'injector',      // dynamically add script tags for all JS files to /app/index.html
    'concat:generated',
    'uglify:generated',
    'cssmin:generated',
    'copy:dist',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);


  
  grunt.registerTask('serve', 'Prepares files for main serve task', [
    'clean',
    'wiredep',
    'useminPrepare',
    'scss-build',
    'handlebars',
    'injector',
    'browserSync:livereload',
    'watch'
  ]);
};
