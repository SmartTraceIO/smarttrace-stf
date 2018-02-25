module.exports = function(grunt) {
    // Project configuration.

    var CONFIG = {
        app: 'app',
        dist: 'dist'
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: CONFIG,
        connect: {
            example: {
                port: 1337,
                base: 'dist'
            }
        },

        app: {
            scripts: [
                'vendor.js',
                'angular.bundle.js'
            ]
        },

        //tasks
        // Watch Task Configuration
        watch: {
            options: {
                nospawn: true,
                livereload: '<%= connect.livereload %>'
            },
            styles: {
                files: [
                    '<%= config.app %>/stylesheets/**/*.css',
                    '<%= config.app %>/stylesheets/**/*.less',
                    '!<%= config.app %>/stylesheets/main.min.css'
                ],
                tasks: ['cssmin']
            }
        },

        uglify: {
            options: {
                mangle: false,
                sourceMap: true,
                compress: true,
                // banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: [
                    {
                        expand:true,
                        cwd: 'app',
                        src: '**/*.js',
                        dest: '<%= config.dist %>/app'
                    }
                ],
            }
        },
    //    copy
        copy : {
            theme: {
                files : [
                    {expand: true, cwd: 'theme/', src: ['**/*.jpg'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.png'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.gif'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.js'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.min.css'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.ttf'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.woff'], dest: '<%= config.dist %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.woff2'], dest: '<%= config.dist %>/theme'},
                ],
            },
            scripts : {
                files: [
                    {expand: true, cwd: 'Scripts/', src: ['**'], dest: '<%= config.dist %>/Scripts'},
                ]
            },

            version: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**!/!*.json'], dest: '<%= config.dist %>/app'},
                ]
            }
            /*html: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**!/!*.json'], dest: '<%= config.dist %>/app'},
                    {expand: true, cwd: 'app/', src: ['**!/!*.html'], dest: '<%= config.dist %>/app'},
                ]
            }*/
        },
    //    htmlmin
        htmlmin : {
            dist: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    keepClosingSlash: true,
                    minifyJS: true
                },
                files: [{
                    expand: true,
                    cwd: 'app/',
                    src: ['**/*.html'],
                    dest: '<%= config.dist %>/app'
                }]

            },
            my_index: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: false,
                    minifyCSS:false
                },
                files: {
                    '<%= config.dist %>/index.html': 'index.html'
                }
            }
        },

        concat: {
            options: {
                sourceMap: false
            },
            vendor_js: {
                src: [
                    'node_modules/lodash/lodash.min.js',
                    'node_modules/jquery/dist/jquery.min.js',
                    'node_modules/moment/min/moment.min.js',
                    'node_modules/moment-timezone/builds/moment-timezone-with-data.min.js',
                    'node_modules/bootstrap/dist/js/bootstrap.min.js',
                    'node_modules/highcharts/highstock.js',
                    'theme/assets/global/plugins/bootstrap-toastr/toastr.js'
                ],
                dest: '<%= config.dist %>/vendor.js'
            },
            angular_bundle: {
                src: [
                    'node_modules/angular/angular.min.js',
                    'node_modules/angular-animate/angular-animate.min.js',
                    'node_modules/angular-cookies/angular-cookies.min.js',
                    'node_modules/angular-resource/angular-resource.min.js',
                    'node_modules/angular-sanitize/angular-sanitize.min.js',
                    'node_modules/angular-touch/angular-touch.min.js',
                    'node_modules/angular-ui-router/release/angular-ui-router.min.js',
                    'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
                    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',

                    'Scripts/google-map/ng-map.min.js',
                    'Scripts/highcharts-ng/dist/highcharts-ng.js'

                ],
                dest: '<%= config.dist %>/angular.bundle.js'
            }
        },
        includeSource: {
            // Task to include files into index.html
            options: {
                basePath: 'dist',
                baseUrl: '',
                ordering: 'top-down'
            },
            app: {
                files: {
                    'dist/index.html': 'index.html'
                }
            }
        },
        //--cssmin
        cssmin : {
            target: {
                files: [{
                    expand: true,
                    cwd: 'theme',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: '<%= config.dist %>/theme',
                    ext: '.css'
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-connect');
    // Default task(s).
    grunt.registerTask('build', ['copy', 'uglify', 'htmlmin', 'cssmin', 'concat', 'includeSource']);
    grunt.registerTask('default', ['build','connect:example']);




};