var myApp = angular.module('myApp',[]);

myApp.factory('instagram', ['$http', function($http){

	return {
		fetchPopular: function(callback){
            
            var endPoint = "https://api.instagram.com/v1/users/276609664/media/recent/?client_id=df70d4f39d3649a9b724876a0f2de343&callback=JSON_CALLBACK";
            
            $http.jsonp(endPoint).success(function(response){
                callback(response.data);
                // console.log(response.data);
            });
		}
	}

}]);

myApp.controller('instagramController', ['$scope', 'instagram' ,
	function ($scope, instagram){

		// Layout por defecto

		// $scope.layout = 'grid';
	    
	    // $scope.setLayout = function(layout){
	    //     $scope.layout = layout;
	    // };
	    
	    // $scope.isLayout = function(layout){
	    //     return $scope.layout == layout;
	    // };

		$scope.pics = [];

		// Usamos el servicio q construimos
		instagram.fetchPopular(function(data){
			$scope.pics = data;
			console.log($scope.pics);
	});

}]);