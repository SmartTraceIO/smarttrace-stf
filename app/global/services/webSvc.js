appSvcs.service("webSvc", function (Api, $http, localDbSvc) {

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

		forgetRequest: function(baseUrl, email){
			var params = {
					params: {
						baseUrl: baseUrl,
						email: email
					}
				};
			return $http.get(Api.url + '/forgetRequest', params);
		},

		resetPassword: function(token, email, password){
			var params = {
					params: {
						token: token,
						email: email,
						password: password
					}
				};
			return $http.get(Api.url + '/resetPassword', params);
		},

		getUser: function(param, noAbort){
			var config = {
					params: param,
                    noCancelOnRouteChange: noAbort
				};
			return $http.get(Api.url + '/getUser/' + localDbSvc.getToken(), config);
		},

		getUsers: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'getUsers/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},

		listUsers: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'listUsers/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},

		deleteUser: function(userId){
			var url = Api.url + 'deleteUser/' + localDbSvc.getToken();
			var params = {
				params: {
					userId: userId
				}
			};
			return $http.get(url, params);
		},

		getLanguages: function(){
			return $http.get(Api.url + '/getLanguages/' + localDbSvc.getToken());
		},

		getRoles: function(){
			return $http.get(Api.url + '/getRoles/' + localDbSvc.getToken());
		},

		getTimeZones: function(){
			return $http.get(Api.url + '/getTimeZones/' + localDbSvc.getToken());
		},

		getUserTime: function(noAbort){
			var url = Api.url + 'getUserTime/' + localDbSvc.getToken();
            var config = {
                noCancelOnRouteChange: noAbort
            }
			return $http.get(url, config);
		},

		//-- device group
		saveDeviceGroup: function(group) {
			var url = Api.url + 'saveDeviceGroup/' + localDbSvc.getToken();
			return $http.post(url, group);
		},
        addDeviceToGroup: function(groupName, deviceId) {
            var config = {
                params:{
                    groupName: groupName,
                    device:deviceId
                }
            }
            var url = Api.url + 'addDeviceToGroup/' + localDbSvc.getToken();
            return $http.get(url, config);
        },
        removeDeviceFromGroup: function(groupName, deviceId) {
            var config = {
                params: {
                    groupName: groupName,
                    device: deviceId
                }
            }
            var url = Api.url + 'removeDeviceFromGroup/' + localDbSvc.getToken();
            return $http.get(url, config);
        },
        getDevicesOfGroup: function(groupName) {
            var config = {
                params: {
                    groupName: groupName
                }
            }
            var url = Api.url + 'getDevicesOfGroup/' + localDbSvc.getToken();
            return $http.get(url, config);
        },
		getDeviceGroups: function(){
			var url = Api.url + 'getDeviceGroups/' + localDbSvc.getToken();
			return $http.get(url);
		},
		getGroupsOfDevice: function(deviceImei) {
			var url = Api.url + 'getGroupsOfDevice/'+ localDbSvc.getToken();
			var config = {
				params: {
					device: deviceImei
				}
			}
			return $http.get(url, config);
		},
        getDeviceGroup: function(groupName) {
            var url = Api.url + 'getDeviceGroup/' + localDbSvc.getToken();
            var config = {
                params: {
                    name: groupName
                }
            }
            return $http.get(url, config);
        },
        deleteDeviceGroup: function(groupName) {
            var url = Api.url + 'deleteDeviceGroup/' + localDbSvc.getToken();
            var config = {
                params: {
                    name: groupName
                }
            }
            return $http.get(url, config);
        },
		updateUserDetails: function(data){
			var url = Api.url + 'updateUserDetails/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

		markNotificationsAsRead: function(data){
			var url = Api.url + 'markNotificationsAsRead/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

		getNotifications: function(includeRead){
			var url = Api.url + 'getNotifications/' + localDbSvc.getToken();
			var params = {
				params: {
					includeRead: includeRead
				}
			};
			return $http.get(url, params);
		},

		getSingleShipment: function(shipmentId){
			var url = Api.url + 'getSingleShipment/' + localDbSvc.getToken();
			var params = {
				params: {
					shipmentId: shipmentId
				}
			};
			return $http.get(url, params);
		},
		getShipment: function(shipmentId){
			var url = Api.url + 'getShipment/' + localDbSvc.getToken();
			var params = {
				params: {
					shipmentId: shipmentId
				}
			};
			return $http.get(url, params);
		},

		getSingleShipmentShare: function(params){
			var url = Api.url + 'getSingleShipment/' + localDbSvc.getToken();
			return $http.get(url, params);
		},

		getNotes: function(params) {
			var url = Api.url + 'getNotes/' + localDbSvc.getToken();
			return $http.get(url, params);
		},
		saveNote: function(note) {
			var url = Api.url + 'saveNote/' + localDbSvc.getToken();
			return $http.post(url, note);
		},
		deleteNote: function(params) {
			var url = Api.url + 'deleteNote/' + localDbSvc.getToken();
			return $http.get(url, params);
		},
		getLocations: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'getLocations/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},

		getLocation: function(locationId){
			var url = Api.url + 'getLocation/' + localDbSvc.getToken();
			var params = {
				params: {
					locationId: locationId
				}
			};
			return $http.get(url, params);
		},

		deleteLocation: function(locationId){
			var url = Api.url + 'deleteLocation/' + localDbSvc.getToken();
			var params = {
				params: {
					locationId: locationId
				}
			};
			return $http.get(url, params);
		},

		getDevices: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'getDevices/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},
		getDevice: function(imei){
			var url = Api.url + 'getDevice/' + localDbSvc.getToken();
			var params = {
				params: {
					imei: imei
				}
			};
			return $http.get(url, params);
		},
		//-- save device
		saveDevice: function(data) {
			var url = Api.url + 'saveDevice/' + localDbSvc.getToken();
			return $http.post(url, data);
		},
		//-- delete device
		deleteDevice: function(deviceId) {
			var url = Api.url + 'deleteDevice/' + localDbSvc.getToken();
			var params = {
				params: {
					imei: deviceId
				}
			};
			return $http.get(url, params);
		},

		suppressAlerts: function(shipmentId) {
			var url = Api.url + 'suppressAlerts/' + localDbSvc.getToken();
			var params = {
				params: {
					shipmentId: shipmentId
				}
			};
			return $http.get(url, params);
		},

        shutdownDevice: function(shipmentId) {
            var url = Api.url + 'shutdownDevice/' + localDbSvc.getToken();
            var params = {
                params: {
                    shipmentId: shipmentId
                }
            };
            return $http.get(url, params);
        },
		sendCommandToDevice: function(imei, cmd) {
			var url = Api.url + 'sendCommandToDevice/' + localDbSvc.getToken();
			var params = {
				params: {
					device: imei,
					command: cmd
				}
			}
			return $http.post(url, params);
		},
		getShipments: function(data){
			var url = Api.url + 'getShipments/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

        getAlertProfiles: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'getAlertProfiles/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},

		getAlertProfile: function(alertProfileId){
			var url = Api.url + 'getAlertProfile/' + localDbSvc.getToken();
			var params = {
				params: {
					alertProfileId: alertProfileId
				}
			};
			return $http.get(url, params);
		},

		deleteAlertProfile: function(alertProfileId){
			var url = Api.url + 'deleteAlertProfile/' + localDbSvc.getToken();
			var params = {
				params: {
					alertProfileId: alertProfileId
				}
			};
			return $http.get(url, params);
		},

		getNotificationSchedules: function(pageSize, pageIndex, sc, so){
			var url = Api.url + 'getNotificationSchedules/' + localDbSvc.getToken();
			var params = {
				params: {
					pageSize: pageSize,
					pageIndex: pageIndex,
					sc: sc,
					so: so
				}
			};
			return $http.get(url, params);
		},

		getNotificationSchedule: function(notificationScheduleId){
			var url = Api.url + 'getNotificationSchedule/' + localDbSvc.getToken();
			var params = {
				params: {
					notificationScheduleId: notificationScheduleId
				}
			};
			return $http.get(url, params);
		},

		deleteNotificationSchedule: function(notificationScheduleId){
			var url = Api.url + 'deleteNotificationSchedule/' + localDbSvc.getToken();
			var params = {
				params: {
					notificationScheduleId: notificationScheduleId
				}
			};
			return $http.get(url, params);
		},

		//-- AutoStart-Shipment Template
		getAutoStartShipments: function(param) {
			var url = Api.url + 'getAutoStartShipments/' + localDbSvc.getToken();
			var params = {
                params: param
            }
            return $http.get(url, params);
		},
        getAutoStartShipment: function(param) {
            var url = Api.url + 'getAutoStartShipment/' + localDbSvc.getToken();
            var params = {
                params: param
            }
            return $http.get(url, params);
        },
		saveAutoStartShipment: function(data) {
			var url = Api.url + 'saveAutoStartShipment/' + localDbSvc.getToken();
			return $http.post(url, data);
		},
        deleteAutoStartShipment: function(autoStartShipmentId){
            var url = Api.url + 'deleteAutoStartShipment/' + localDbSvc.getToken();
            var params = {
                params: {
                    autoStartShipmentId: autoStartShipmentId
                }
            };
            return $http.get(url, params);
        },

		getShipmentTemplates: function(param){
			var url = Api.url + 'getShipmentTemplates/' + localDbSvc.getToken();
			var params = {
				params: param
			};
			return $http.get(url, params);
		},
		getShipmentTemplate: function(param){
			var url = Api.url + 'getShipmentTemplate/' + localDbSvc.getToken();
			var params = {
				params: param
			};
			return $http.get(url, params);
		},
		deleteShipmentTemplate: function(shipmentTemplateId){
			var url = Api.url + 'deleteShipmentTemplate/' + localDbSvc.getToken();
			var params = {
				params: {
					shipmentTemplateId: shipmentTemplateId
				}
			};
			return $http.get(url, params);
		},

		saveShipment: function(data){
			var url = Api.url + 'saveShipment/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

		saveShipmentTemplate: function(data){
			var url = Api.url + 'saveShipmentTemplate/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

		saveNotificationSchedule: function(data){
			var url = Api.url + 'saveNotificationSchedule/' + localDbSvc.getToken();
			return $http.post(url, data);
		},

		saveAlertProfile: function(data){
			var url = Api.url + 'saveAlertProfile/' + localDbSvc.getToken();
			return $http.post(url, data);
		},
		

		saveLocation: function(data){
			var url = Api.url + 'saveLocation/' + localDbSvc.getToken();
			return $http.post(url, data);
		},
		
		saveUser: function(data){
			var url = Api.url + 'saveUser/' + localDbSvc.getToken();
			return $http.post(url, data);
		}
	}

});