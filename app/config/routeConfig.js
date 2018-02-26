//var version = (new Date()).getTime();
//console.log(version);
appConstants.constant('routes', [
    {
          name: 'login',
          config: {
              url: "/login"
              , views: {
                  "content": {
                      templateUrl: "app/login/login.html"
                       , controller: 'LoginCtrl'
                  }
              }
          },
          dependencies: [
              'app/login/login.js?v=' + version,
          ]
      },
      {
          name: 'preference',
          config: {
              url: "/preference"
              , views: {
                  "content": {
                      templateUrl: "app/preference/preference.html"
                       , controller: 'PreferenceCtrl'
                  }
              }
          },
          dependencies: [
              'app/preference/preference.js?v=' + version,
          ]
      },
      {
          name: 'user-update',
          config: {
              url: "/user-update"
              , views: {
                  "content": {
                      templateUrl: "app/user-update/user-update.html"
                       , controller: 'UserUpdateCtrl'
                  }
              }
          },
          dependencies: [
              'app/user-update/user-update.js?v=' + version,
          ]
      },
      {
          name: 'forgetpassword',
          config: {
              url: "/forget-password"
              , views: {
                  "content": {
                      templateUrl: "app/forget-password/forget-password.html"
                       , controller: 'ForgetCtrl'
                  }
              }
          },
          dependencies: [
              'app/forget-password/forget-password.js?v=' + version,
          ]
      },
      {
          name: 'changepassword',
          config: {
              url: "/change-password"
              , views: {
                  "content": {
                      templateUrl: "app/change-password/change-password.html"
                       , controller: 'ChangePWCtrl'
                  }
              }
          },
          dependencies: [
              'app/change-password/change-password.js?v=' + version,
          ]
      },
      {
          name: 'newshipment',
          config: {
              url: "/new-shipment"
              , views: {
                  "content": {
                      templateUrl: "app/new-shipment/new-shipment.html"
                       , controller: 'NewShipmentCtrl'
                  }
              }
          },
          dependencies: [
              'app/new-shipment/new-shipment.js?v=' + version,
              'app/global/filters/filters.js?v=' + version
          ]
      },
    {
        name: 'newautostartshipment',
        config: {
            url: "/new-autostart-shipment",
            views: {
                'content': {
                    templateUrl: 'app/new-shipment/new-autostart-shipment.html',
                    controller: 'NewAutoStartShipmentCtrl as VM'
                }
            }
        },
        dependencies: [
            'app/new-shipment/new-autostart-shipment.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },
      {
          name: 'viewshipment',
          config: {
              url: "/view-shipment"
              , views: {
                  "content": {
                      templateUrl: "app/view-shipment/view-shipment.html"
                       , controller: 'ViewShipmentCtrl as vm'
                  }
              }
          },
          dependencies: [
              'Scripts/google-map/markerclusterer.js',
              'Scripts/google-map/markerwithlabel.js',
              'Scripts/google-map/infobubble.js',
              'Scripts/google-map/richmarker.js',
              'Scripts/google-map/maplabel.js',
              'app/view-shipment/view-shipment.js?v=' + version,
              'app/global/filters/filters.js?v=' + version,
          ]
      },
      {
          name: 'viewshipmentdetail',
          config: {
              url: "/view-shipment-detail/:vsId"
              , views: {
                  "content": {
                      templateUrl: "app/view-shipment-detail/view-shipment-detail.html"
                       , controller: 'ViewShipmentDetailCtrl as vm'
                  }
              }
          },
          dependencies: [
              'app/view-shipment-detail/view-shipment-detail.js?v=' + version,
          ]
      },
    {
        name: 'viewshipmentdetailtable',
        config: {
            url: "/view-shipment-detail-table?sn&trip&vsId"
            , views: {
                "content": {
                    templateUrl: "app/view-shipment-detail-table/view-shipment-detail.html"
                    , controller: 'ViewShipmentDetailTableCtrl as vm'
                }
            }
        },
        dependencies: [
            'app/view-shipment-detail-table/view-shipment-detail.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },
    {
        name: 'viewshipmentdetailshare',
        config: {
            url: "/view-shipment-detail?sn&trip&vsId",
            reloadOnSearch: false,
            views: {
                "content": {
                    templateUrl: "app/view-shipment-detail-share/view-shipment-detail.html",
                    controller: 'ViewShipmentDetailShareCtrl as VM',
                }
            }
        },
        dependencies: [
            'Scripts/google-map/richmarker.js',
            'Scripts/google-map/maplabel.js',
            'app/view-shipment-detail-share/view-shipment-detail.js?v=' + version,
            'app/view-shipment-detail-share/confirm-shutdown.js?v=' + version,
            'app/view-shipment-detail-share/confirm-suppress.js?v=' + version,
            'app/view-shipment-detail-share/create-note.js?v=' + version,
            'app/view-shipment-detail-share/edit-note.js?v=' + version,
            'app/view-shipment-detail-share/delete-note.js?v=' + version,
            'app/view-shipment-detail-share/edit-alerts.js?v=' + version,
            'app/view-shipment-detail-share/edit-arrival.js?v=' + version,
            'app/view-shipment-detail-share/new-action-taken.js?v=' + version,
            'app/view-shipment-detail-share/verify-action-taken.js?v=' + version,
            'app/view-shipment-detail-share/edit-goods.js?v=' + version,
            'app/view-shipment-detail-share/edit-route.js?v=' + version,
            'app/view-shipment-detail-share/share-report.js?v=' + version,
            'app/user-view/user-view.js?v=' + version,
            'app/global/filters/filters.js?v=' + version,
        ]
    },
      {
          name: 'manage',
          config: {
              url: "/manage",
              abstract:true
              , views: {
                  "content": {
                      templateUrl: "app/global/layout/manage.html"
                  }
              }
          }
      },

    {
        name: 'tracker',
        config: {
            url: "/tracker",
            views: {
                "content": {
                    templateUrl: "app/manage-tracker/list.html",
                    controller: 'ListTrackerCtrl'
                }
            }
        },
        dependencies: [
            'Scripts/google-map/markerclusterer.js',
            'Scripts/google-map/markerwithlabel.js',
            'Scripts/google-map/infobubble.js',
            'Scripts/google-map/richmarker.js',
            'Scripts/google-map/maplabel.js',
            'app/manage-tracker/manage-tracker.js?v=' + version,
            'app/manage-tracker/confirm-deactivate.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },
    {
        name: 'addtracker',
        config: {
            url: "/add-tracker"
            , views: {
                "content": {
                    templateUrl: "app/manage-tracker/add-edit.html"
                    , controller: 'AddTrackerCtrl'
                }
            }
        },
        dependencies: [
            'app/manage-tracker/manage-tracker.js?v=' + version,
            'app/manage-tracker/confirm-deactivate.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },
    {
        name: 'edittracker',
        config: {
            url: "/edit-tracker/:imei"
            , views: {
                "content": {
                    templateUrl: "app/manage-tracker/add-edit.html",
                    controller: 'EditTrackerCtrl'
                }
            }
        },
        dependencies: [
            'app/manage-tracker/manage-tracker.js?v=' + version,
            'app/manage-tracker/confirm-deactivate.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },
      {
          name: 'manage.alert',
          config: {
              url: "/alert"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/list.html"
                       , controller: 'ListAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + version,
          ]
      },
      {
          name: 'manage.addalert',
          config: {
              url: "/add-alert"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/add-edit.html"
                       , controller: 'AddAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + version,
          ]
      },
      {
          name: 'manage.editalert',
          config: {
              url: "/edit-alert/:aId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/add-edit.html"
                       , controller: 'EditAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + version,
          ]
      },
    /*{
        name: 'manage.group',
        config: {
            url: '/trackers-group',
            views: {
                "sub-content": {
                    templateUrl: 'app/manage-group/list.html',
                    controller: 'ListGroupCtrl as GroupList',
                }
            }
        },
        dependencies: [
            'app/manage-group/group-list.js?v=' + version,
            'app/manage-group/delete-group.js?v=' + version,
            'app/global/filters/filters.js?v=' + version
        ]
    },*/
    {
        name: 'manage.addgroup',
        config: {
            url: '/add-group',
            views: {
                "sub-content": {
                    templateUrl: 'app/manage-group/add-group.html',
                    controller: 'AddGroupCtrl as AddGroup',
                }
            }
        },
        dependencies: [
            'app/manage-group/add-group.js?v='+version
        ]
    },
    {
        name: 'manage.editgroup',
        config: {
            url: '/edit-group/:id',
            views: {
                "sub-content": {
                    templateUrl: 'app/manage-group/edit-group.html',
                    controller: 'EditGroupCtrl as EditGroup'
                }
            }
        },
        dependencies: [
            'app/manage-group/edit-group.js?v='+version
        ]
    },
      {
          name: 'manage.noti',
          config: {
              url: "/notification"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/list.html"
                       , controller: 'ListNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + version,
          ]
      },
      {
          name: 'manage.addnoti',
          config: {
              url: "/add-notification"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/add-edit.html"
                       , controller: 'AddNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + version,
              'app/global/directives/weekdays.js?v=' + version
          ]
      },
      {
          name: 'manage.editnoti',
          config: {
              url: "/edit-notification/:nId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/add-edit.html"
                       , controller: 'EditNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + version,
              'app/global/directives/weekdays.js?v=' + version
          ]
      },
      {
          name: 'manage.loc',
          config: {
              url: "/location"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/list.html"
                       , controller: 'ListLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + version,
          ]
      },
      {
          name: 'manage.addloc',
          config: {
              url: "/add-location"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/add-edit.html"
                       , controller: 'AddLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + version,
          ]
      },
      {
          name: 'manage.editloc',
          config: {
              url: "/edit-location/:lId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/add-edit.html"
                       , controller: 'EditLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + version,
          ]
      },
      {
          name: 'manage.shiptemp',
          config: {
              url: "/shipment-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/list.html"
                       , controller: 'ListShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-shipment-template/manage-shipment-template.js?v=' + version,
              'app/global/filters/filters.js?v=' + version
          ]
      },
      {
          name: 'manage.addshiptemp',
          config: {
              url: "/add-shipment-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/add-edit.html"
                       , controller: 'AddShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + version,
              'app/manage-alert/manage-alert.js?v=' + version,
              'app/manage-notification/manage-notification.js?v=' + version,
              'app/global/directives/weekdays.js?v=' + version,
              'app/manage-shipment-template/manage-shipment-template.js?v=' + version,
              'app/global/filters/filters.js?v=' + version,
          ]
      },
      {
          name: 'manage.editshiptemp',
          config: {
              url: "/edit-shipment-template/:stId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/add-edit.html"
                       , controller: 'EditShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + version,
              'app/manage-alert/manage-alert.js?v=' + version,
              'app/manage-notification/manage-notification.js?v=' + version,
              'app/global/directives/weekdays.js?v=' + version,
              'app/manage-shipment-template/manage-shipment-template.js?v=' + version,
              'app/global/filters/filters.js?v=' + version,
          ]
      },
      {
          name: 'manage.user',
          config: {
              url: "/user"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/list.html"
                       , controller: 'ListUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js',
          ]
      },
      {
          name: 'manage.adduser',
          config: {
              url: "/add-user"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/add-edit.html"
                       , controller: 'AddUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js?v=' + version,
          ]
      },
      {
          name: 'manage.edituser',
          config: {
              url: "/edit-user/:uId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/add-edit.html"
                       , controller: 'EditUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js?v=' + version
          ]
      },
      {
          name: 'manage.autotemp',
          config: {
              url: "/autostart-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/list.html"
                       , controller: 'ListAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + version,
              'app/autostart-template/confirm-delete.js?v=' + version,
              'app/manage-location/manage-location.js?v=' + version,
              'app/manage-alert/manage-alert.js?v=' + version,
              'app/manage-notification/manage-notification.js?v=' + version,
              'app/global/directives/weekdays.js?v=' + version,
              'app/global/filters/filters.js?v=' + version
          ]
      },
      {
          name: 'manage.addautotemp',
          config: {
              url: "/add-autostart-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/add-edit.html"
                       , controller: 'AddAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + version,
              'app/global/filters/filters.js?v=' + version
          ]
      },
      {
          name: 'manage.editautotemp',
          config: {
              url: "/edit-autostart-template/:stId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/add-edit.html"
                       , controller: 'EditAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + version,
              'app/global/filters/filters.js?v=' + version
          ]
      },
    {
        name: 'manage.simulator',
        config: {
            url: '/simulator',
            'views': {
                'sub-content': {
                    templateUrl: 'app/simulator/list.html',
                    controller: 'ListSimulatorCtrl as VM'
                }
            }
        },
        dependencies: [
            'app/simulator/manage-simulator.js?v=' + version
        ]
    },
    {
        name: 'manage.correctiveactions',
        config: {
            url: "/correctiveactions"
            , views: {
                "sub-content": {
                    templateUrl: "app/manage-corrective-actions/list.html"
                     , controller: 'ListCorrectiveActionListsCtrl'
                }
            }
        },
        dependencies: [
            'app/manage-corrective-actions/manage-corrective-actions.js?v=' + version
        ]
    },
    {
        name: 'manage.addcorrectiveactions',
        config: {
            url: "/add-correctiveactions"
            , views: {
                "sub-content": {
                    templateUrl: "app/manage-corrective-actions/add-edit.html"
                     , controller: 'EditCorrectiveActionListCtrl'
                }
            }
        },
        dependencies: [
            'app/manage-corrective-actions/manage-corrective-actions.js?v=' + version
        ]
    },
    {
        name: 'manage.editcorrectiveactions',
        config: {
            url: "/edit-correctiveactions/:aId"
            , views: {
                "sub-content": {
                    templateUrl: "app/manage-corrective-actions/add-edit.html"
                     , controller: 'EditCorrectiveActionListCtrl'
                }
            }
        },
        dependencies: [
            'app/manage-corrective-actions/manage-corrective-actions.js?v=' + version
        ]
    }    
]);

//#endregion Register Routes Here

app.config(['$stateProvider', '$urlRouterProvider', 'routes',
    function ($stateProvider, $urlRouterProvider, routes) {
        ////following code is for add route with its dependancies for lazyloading
        angular.forEach(routes, function (route) {
            if (route.dependencies) {
                route.config.resolve = {
                    deps: function ($q, $rootScope) {
                        var deferred = $q.defer();
                        require(route.dependencies, function () {
                            $rootScope.$apply(function () {
                                deferred.resolve();
                            });
                        });
                        return deferred.promise;
                    }
                };
            }
            $stateProvider.state(route.name, route.config);
        });
        //$urlRouterProvider.otherwise('/new-shipment');
        $urlRouterProvider.otherwise('/login');
    }]);
