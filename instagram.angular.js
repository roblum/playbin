// var myAjax = angular.module('myAjax',[]);

// myAjax.factory('Server', ['$http', function ($http) {
//   return {
//     get: function(url) {
//     	alert('hello');
//     	console.log($http.get(url));
//       return $http.get(url);
//     },
//   };
// }]);

// myAjax.controller('MainCtrl', ['$scope', 'Server', function ($scope, Server) {
//     var jsonGet = 'https://api.instagram.com/v1/users/276609664/media/recent/?client_id=df70d4f39d3649a9b724876a0f2de343';
//     Server.get(jsonGet);
// }]);

// var test = test;

var myAjax = angular.module('myAjax',[]);

$http({method: 'GET', url: '/someUrl'}).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });