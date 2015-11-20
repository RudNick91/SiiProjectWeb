var app = angular.module('app', []);
app.service("ChatService", function($q, $timeout) {
    
    var service = {}, listener = $q.defer(), socket = {
      client: null,
      stomp: null
    }, messageIds = [];
    
    service.RECONNECT_TIMEOUT = 30000;
    service.SOCKET_URL = "http://192.168.0.23:8090/hello";
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
app.controller("ChatCtrl", function($scope, ChatService) {
	  $scope.messages = "";
	  $scope.message = "";
	  $scope.max = 140;

	  $scope.addMessage = function() {
	    ChatService.send($scope.message);
	  
	  };

	  ChatService.receive().then(null, null, function(message) {
	    $scope.messages = message;
	  });
	});