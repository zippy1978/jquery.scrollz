/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */ <%= "\\n" %>'
    },
    copy: {
        options: {
            banner: '<%= meta.banner %>'
        },
        main: {
            expand: true,
        cwd: 'src/',
        src: '**',
        dest: 'dist/',
        flatten: true,
        filter: 'isFile'
        }
    },
    uglify: {
        options: {
            banner: '<%= meta.banner %>'
        },
        build: {
            src: 'src/<%= pkg.name %>.js',
            dest: 'dist/<%= pkg.name %>.min.js'
        }
    },
    csslint: {
        strict: {
            options: {
                import: 2,
                'vendor-prefix': false,
                'adjoining-classes': false,
                'duplicate-background-images': false,
                'fallback-colors': false,
                'box-model': false
            },
            src: ['src/**/*.css']
        }
    },
    jshint: {
        strict : {
          options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            boss: true,
            eqnull: true,
            browser: true,
            globals: {
                jQuery: true
            }
          },
          src: ['src/**/*.js']
      }
    }
  });
    
  // Load plugins
  grunt.loadNpmTasks('grunt-contrib');
    
  // Default task.
  grunt.registerTask('default', ['jshint','csslint','uglify','copy']);
  
};
