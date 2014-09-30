module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            html : {
              files: ['index.html']
              ,tasks: ['s3']
            },
            js : {
              files: ['*.js']
              ,tasks : ['s3']
            }
        }
    ,aws: grunt.file.readJSON('../s3.json')
    ,s3: {
      options: {
      key: '<%= aws.key %>'
      ,secret: '<%= aws.secret %>'
      ,bucket: '<%= aws.bucket %>'
      ,access: 'public-read'
      ,headers: {
        // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
        "Cache-Control": "max-age=630720000, public"
        ,"Expires": new Date(Date.now() + 63072000000).toUTCString()
      }
    },
    dev: {
      upload: [
        {
          src: 'index.html'
          ,dest: 'roblum/backbonejs/index.html'
        },
        {
          src: 'script.js'
          ,dest: 'roblum/backbonejs/script.js'
        }
      ]

    }

  }

    });

    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-s3');

    grunt.registerTask('send', ['s3']);
    grunt.registerTask('default', ['watch']);

};