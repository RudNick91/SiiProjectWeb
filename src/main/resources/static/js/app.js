var myApp = angular.module('app', []);


myApp.controller('Controller', ['$scope',"$http", function($scope,$http) {
	$scope.selectTemplate="<li class='ui-widget-content'></li>";
	
	function getElements() {
		$http({
			url : "http://192.168.0.106:8090/music",
			method : "JSONP"
		}).success(
			function(response) {
				$scope.elements=response;
				console.log($scope.elements);
			});
	}
	
    $scope.openDialog = function() {
    	getElements();
       var dialogs=$("#dialog");
       var select=$("#selectable");
       dialogs.dialog({
    	   resizable:true,
    	   height:400,
    	   width:400,
       	   modal:false,
       	   buttons:{
       		   "Close":function(){
       			   $(this).dialog("close");
       		   }
       	   }
       });
       
       for(var i=0;i<3;i++){
    	   select.append($scope.selectTemplate);
       }
       select.selectable();
    };
    
    $scope.save=function(){
    	
    };
    
}]);