var myApp = angular.module('app', []);

myApp.service("ChatService", function($q, $timeout) {
    
    var service = {}, listener = $q.defer(), socket = {
      client: null,
      stomp: null
    }, messageIds = [];
    
    service.RECONNECT_TIMEOUT = 30000;
    service.SOCKET_URL = "http://192.168.0.106:8090/hello";
    service.CHAT_TOPIC = "/topic/greetings";
    service.CHAT_BROKER = "/app/hello";
    
    service.receive = function() {
      return listener.promise;
    };
    
    service.send = function(message) {
      var id = Math.floor(Math.random() * 1000000);
      socket.stomp.send(service.CHAT_BROKER, {
      }, JSON.stringify({
        name: message

      }));
      messageIds.push(id);
    };
    
    var reconnect = function() {
      $timeout(function() {
        initialize();
      }, this.RECONNECT_TIMEOUT);
    };
    
    var getMessage = function(data) {
      var message = JSON.parse(data), out = {};
      out.message = message.message;
      out.time = new Date(message.time);
      if (_.contains(messageIds, message.id)) {
        out.self = true;
        messageIds = _.remove(messageIds, message.id);
      }
      return out;
    };
    
    var startListener = function() {
      socket.stomp.subscribe(service.CHAT_TOPIC, function(data) {
    	  var out= {};
          out.message = data.body;
          out.time = new Date();
   
        listener.notify(out);
      });
    };
    
    var initialize = function() {
      socket.client = new SockJS(service.SOCKET_URL);
      socket.stomp = Stomp.over(socket.client);
      socket.stomp.connect({}, startListener);
      socket.stomp.onclose = reconnect;
    };
    
    initialize();
    return service;
  });

myApp.controller('Controller', ['$scope',"$http","ChatService","$timeout", function($scope,$http,ChatService,$timeout) {
	$scope.messages = "";
	$scope.message = "";
	
	$scope.addMessage = function() {
		
		ChatService.send($scope.message);
	};

   ChatService.receive().then(null, null, function(message) {
	   $(".five-lines").remove();
	   $scope.messages = message;
   });
   
	function getElements() {
		$http({
			url : "http://192.168.0.106:8090/getAllMusics",
			method : "GET"
		}).success(
			function(response) {
				$scope.elements=response;
				$timeout(function(){
					$scope.$apply();
				});
			});
	}
	
	function setPosition(message){
		if(message.length>0){
			var position=message.length;
			return positon*32+"px";
		}
	}
	
	getElements();
	
	$scope.filters=function(elem){
		if(elem.title===null){
			return;
		}else{
			return true;
		}
	};
	
    $scope.openDialog = function() {
       var dialogs=$("#dialog");
       var select=$("#selectable");
       dialogs.dialog({
    	   resizable:true,
    	   height:400,
    	   width:400,
       	   modal:false,
       	   buttons:{
       		   "Zamknij":function(){
       			   $(this).dialog("close");
       		   }
       	   }
       });
       select.css("display","initial");
       select.selectable();  
    };
    
    $scope.onSave = function(){
    	var dialogTitle=$("#title-element");
    		dialogTitle.dialog({
    			 resizable:true,
    	    	   height:180,
    	    	   width:500,
    	       	   modal:false,
    	       	   buttons:{
    	       		   "Zapisz":function(){
    	       			   var title=$("#title").val();
    	       			   var data={
    	       					 "title":title,
    	       					 "id":"3"
    	       			   };
    	       			   $http({
    	       				   method:"POST",
    	       				   url:"http://192.168.0.106:8090/saveMusic",
    	       				   data:data
    	       			   }).success(function(){
    	       				   console.log("Sukces");
    	       			   }).error(function(er){
    	       				   console.log(er.message);
    	       			   });
    	       			   getElements();
    	       		   },
    	       		   "Anuluj":function(){
    	       			   $(this).dialog("close");
    	       		   }
    	       	   }
    		});
    		dialogTitle.css({
    		    "margin-left": "40px",
    	    	"margin-top": "10px"
    		});
    }
    
}]);