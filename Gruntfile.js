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
                    {expand: true, cwd: 'theme/', src: ['**'], dest: '<%= distdir %>/theme'},
                ],
            },
            scripts : {
                files: [
                    {expand: true, cwd: 'Scripts/', src: ['**'], dest: '<%= distdir %>/Scripts'},
                ]
            },
            html: {
                files: [
                    {expand: true, cwd: 'app/', src: ['**/*.json'], dest: '<%= distdir %>/app'},
                ]
            }
        },
    //    htmlmin
        htmlmin : {
            dist: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
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
                    collapseWhitespace: true
                },
                files: {
                    '<%= distdir %>/index.html': 'index.html'
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // Default task(s).
    grunt.registerTask('build', ['copy', 'uglify', 'htmlmin']);
    grunt.registerTask('default', ['build']);

};