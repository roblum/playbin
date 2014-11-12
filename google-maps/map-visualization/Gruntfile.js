module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            index : {
              files: ['index.html']
              ,tasks: ['s3']
            }
            ,js : {
              files: ['js/*.js']
              ,tasks: ['s3']
            }
        }

    ,aws: grunt.file.readJSON('../../../Offerpop/s3.json')
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
          ,dest: 'roblum/noconflict/index.html'
        },{
          src: 'js/modular-gmaps.js'
          ,dest: 'roblum/noconflict/modular-gmaps.js'
        }
      ]
    }
  }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-s3');

    grunt.registerTask('send', ['s3']);
    grunt.registerTask('default', ['watch']);


};