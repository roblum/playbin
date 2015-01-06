module.exports = function (grunt) {
    grunt.initConfig({
      uglify: {
            dist: {
                files: {
                    'js/visualizationSdk.min.js': ['js/visualizationSdk.js']
                }
                ,options: {
                    banner: '/* visualization sdk v.2 - <%= grunt.template.today() %> */'
                }
            },
        },
        watch: {
            index : {
              files: ['index.html']
              ,tasks: ['s3:dev']
            },
            js : {
              files: ['js/*.js']
              ,tasks: ['s3:dev']
            },
            css : {
              files: ['css/*.css']
              ,tasks: ['s3:dev']
            },
            carousel : {
              files: ['carousel-temp-0pop.html']
              ,tasks: ['s3:carousel']
            },
            grid : {
              files: ['grid-temp-0pop.html']
              ,tasks: ['s3:grid']
            },
            modal : {
              files: ['modal-temp-0pop.html']
              ,tasks: ['s3:modal']
            },
            activate : {
              files: ['activate.html']
              ,tasks: ['s3:activate']
            }

        }

    ,aws: grunt.file.readJSON('../../s3.json')
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
          ,dest: 'add_ons/visualizationSdk_v2/index.html'
        },{
          src: 'js/visualizationSdk.js'
          ,dest: 'add_ons/visualizationSdk_v2/js/visualizationSdk.js'
        },{
          src: 'css/visualization-styles.css'
          ,dest: 'add_ons/visualizationSdk_v2/css/visualization-styles.css'
        }
      ]
    },
    activate: {
      upload: [
        {
          src: 'activate.html'
          ,dest: 'add_ons/visualizationSdk_v2/activate.html'
        }
      ]
    },
    carousel : {
      upload : [
        {
          src: 'carousel-temp-0pop.html'
          ,dest: 'add_ons/visualizationSdk_v2/carousel-temp-0pop.html'
        }
      ]
    },
    grid : {
      upload : [
        {
          src: 'grid-temp-0pop.html'
          ,dest: 'add_ons/visualizationSdk_v2/grid-temp-0pop.html'
        }
      ]
    },
    modal : {
      upload : [
        {
          src: 'modal-temp-0pop.html'
          ,dest: 'add_ons/visualizationSdk_v2/modal-temp-0pop.html'
        }
      ]
    }
  }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('min', ['uglify']);
    grunt.registerTask('send', ['s3']);
    grunt.registerTask('default', ['watch']);


};