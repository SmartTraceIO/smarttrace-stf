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
                    },
                    {
                        expand:true,
                        cwd: 'app/autostart-template',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/autostart-template'
                    },
                    {
                        expand:true,
                        cwd: 'app/change-password',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/change-password'
                    },
                    {
                        expand:true,
                        cwd: 'app/config',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/config'
                    },
                    {
                        expand:true,
                        cwd: 'app/forget-password',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/forget-password'
                    },
                    {
                        expand:true,
                        cwd: 'app/global',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/global'
                    },
                    {
                        expand:true,
                        cwd: 'app/login',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/login'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-alert',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-alert'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-group',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-group'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-location',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-location'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-notification',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-notification'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-shipment-template',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-shipment-template'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-tracker',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-tracker'
                    },
                    {
                        expand:true,
                        cwd: 'app/manage-user',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/manage-user'
                    },
                    {
                        expand:true,
                        cwd: 'app/new-shipment',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/new-shipment'
                    },
                    {
                        expand:true,
                        cwd: 'app/preference',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/preference'
                    },
                    {
                        expand:true,
                        cwd: 'app/simulator',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/simulator'
                    },
                    {
                        expand:true,
                        cwd: 'app/user-update',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/user-update'
                    },
                    {
                        expand:true,
                        cwd: 'app/view-shipment',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/view-shipment'
                    },
                    {
                        expand:true,
                        cwd: 'app/view-shipment-detail-share',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/view-shipment-detail-share'
                    },
                    {
                        expand:true,
                        cwd: 'app/view-shipment-detail-table',
                        src: '**/*.js',
                        dest: '<%= distdir %>/app/view-shipment-detail-table'
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
                    {expand: true, cwd: 'app/', src: ['**/*.html'], dest: '<%= distdir %>/app'},
                    {expand: true, cwd: 'app/', src: ['**/*.json'], dest: '<%= distdir %>/app'},
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // Default task(s).
    grunt.registerTask('build', ['copy', 'uglify']);
    grunt.registerTask('default', ['build']);

};