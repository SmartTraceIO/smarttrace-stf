module.exports = function(grunt) {
    // Project configuration.

    var CONFIG = {
        app: 'app',
        dist: 'dist',
        version: 1
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: CONFIG,

        connect: {
            example: {
                port: 1337,
                base: 'dist'
            }
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
                    {expand: true, cwd: 'Scripts/', src: ['google-map/**/*'], dest: '<%= config.dist %>/Scripts'},
                ]
            },

            version: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**!/!*.json'], dest: '<%= config.dist %>/app'},
                ]
            },
            app_js: {
                files: [
                    {expand: true, cwd: 'app', src: ['**/*.js'], dest: '<%= config.dist %>/app'}
                ]
            }
        },

        htmlmin : {
            dist: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    //keepClosingSlash: true,
                    minifyJS: true
                },
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: ['**/*.html'],
                    dest: '<%= config.dist %>/app'
                }]

            },
            index: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS:true
                },
                files: {
                    '<%= config.dist %>/index.html': '<%= config.dist %>/index.html'
                }
            }
        },
        uglify: {
            options: {
                mangle: false,
                sourceMap: true,
                compress: true
            },
            app: {
                files: [
                    {
                        expand:true,
                        cwd: '.',
                        src: '<%= config.dist %>/app/**/*.js',
                        dest: '<%= config.dist %>/app',
                        rename: function (dst, src) {
                            // To keep the source js files and make new files as `*.min.js`:
                            // return dst + '/' + src.replace('.js', '.min.js');
                            // Or to override to src:
                            return src;
                        }
                    }]
            }
        },

        html2js: {
            options: {
                base: '.'
            },
            main: {
                src: ['app/**/*.html'],
                dest: '<%= config.dist %>/templates-<%= pkg.version %>.js'
            }
        },

        concat: {
            options: {
                sourceMap: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            vendor_js: {
                src: [
                    'node_modules/lodash/lodash.min.js',
                    'node_modules/jquery/dist/jquery.min.js',
                    'node_modules/moment/min/moment.min.js',
                    'node_modules/moment-timezone/builds/moment-timezone-with-data.min.js',
                    'node_modules/bootstrap/dist/js/bootstrap.min.js',
                    'node_modules/highcharts/highstock.js',

                    'Scripts/tipsy/jquery.tipsy.js',
                    'theme/assets/global/plugins/bootstrap-toastr/toastr.js',
                    'theme/assets/global/scripts/app.js'
                ],
                dest: '<%= config.dist %>/vendor-<%= pkg.version %>.js'
            },
            vendor_css: {
                src: [
                    'Scripts/select2/select2.css',
                    'Scripts/tipsy/tipsy.css',
                ],
                dest: '<%= config.dist %>/vendor-<%= pkg.version %>.css'
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
                dest: '<%= config.dist %>/angular.bundle-<%= pkg.version %>.js'
            },
            app_bundle: {
                src: [
                    '<%= config.dist %>/app/*.js',
                    '<%= config.dist %>/app/config/*.js',
                    '<%= config.dist %>/app/global/**/*.js',

                    '<%= config.dist %>/app/**/*.js'
                ],
                dest: '<%= config.dist %>/<%= pkg.name %>-<%= pkg.version %>.js'
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
                    'dist/index.html': 'app/index.html'
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
        },

        clean: {
            dist: ['<%= config.dist %>'],
            node: ['node_modules']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // grunt.loadNpmTasks('grunt-common-html2js');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-connect');
    // Default task(s).
    grunt.registerTask('build', ['clean:dist', 'copy', 'uglify', 'concat', 'html2js', 'includeSource', 'cssmin']);
    grunt.registerTask('default', ['build','connect:example', 'connect:watch']);




};