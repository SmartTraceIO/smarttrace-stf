appSvcs.service("webSvc", function (Api, $http, localDbSvc) {

	var token = localDbSvc.getToken();

	return {
		login: function(email, password){
			var params = {
					params: {
						email: email,
						password: password
					}
				};
			return $http.get(Api.url + '/login', params);
		},
		getUser: function(){
			return $http.get(Api.url + '/getUser/' + localDbSvc.getToken());
		},

		markNotificationsAsRead: function(data){
			var url = Api.url + 'markNotificationsAsRead/' + localDbSvc.getToken();
			return $http.post(url, data);
		}
	}

});