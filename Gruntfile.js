module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distdir: 'dist',
        //tasks
        uglify: {
            options: {
                mangle: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: [
                    {
                        expand:true,
                        cwd: 'app',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app'
                    }
                ],
            }
        },
    //    copy
        copy : {
            theme: {
                files : [
                    {expand: true, cwd: 'theme/', src: ['**/*.jpg'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.png'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.gif'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.js'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.min.css'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.ttf'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.woff'], dest: '<%= distdir %>/theme'},
                    {expand: true, cwd: 'theme/', src: ['**/*.woff2'], dest: '<%= distdir %>/theme'},
                ],
            },
            scripts : {
                files: [
                    {expand: true, cwd: 'Scripts/', src: ['**'], dest: '<%= distdir %>/Scripts'},
                ]
            },
            version: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**!/!*.json'], dest: '<%= distdir %>/app'},
                ]
            }
            /*html: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**!/!*.json'], dest: '<%= distdir %>/app'},
                    {expand: true, cwd: 'app/', src: ['**!/!*.html'], dest: '<%= distdir %>/app'},
                ]
            }*/
        },
    //    htmlmin
        htmlmin : {
            dist: {
                options: {                                 // Target options
                    removeComments: false,
                    collapseWhitespace: false
                },
                files: [{
                    expand: true,
                    cwd: 'app/',
                    src: ['**/*.html'],
                    dest: '<%= distdir %>/app'
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
                    '<%= distdir %>/index.html': 'index.html'
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
                    dest: '<%= distdir %>/theme',
                    ext: '.css'
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // Default task(s).
    grunt.registerTask('build', ['copy', 'uglify', 'htmlmin', 'cssmin']);
    grunt.registerTask('default', ['build']);

};