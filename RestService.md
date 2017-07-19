# Visfresh Rest Service

### Date format:###
The date should have following format `yyyy-MM-dd'T'HH:mm` in current user's time zone if the user is logged in now and UTC time zone otherwise. Example:
`2015-09-30T01:19`
### Requests and responses:###
The GET request parameters of URL link should be URL encoded to, but JSON body of request and response should be
sent as is without URL encoding.  
For all POST JSON requests the “Content-Type: application/json” HTTP header should be used.
### Server [Responses](#markdown-header-response-message):###
Each server response has structure:
```json
{
  "status": {
  "code": 0,
  "message": "Success"
},  
"response": {
"token": "token_100001",  
"expired": "2015-09-30T01:19"
}
}  
```
  The `response` element can be absent if there is not any response, but status code should be always in answer.  
0 - status code is a “Success” code  
other code - is an error code. The list of possible error codes will determined in next releases 
In case of error the “response” element of JSON response is absent.  
### Security methods.
An authentication can be performed as from REST client using login method, as from GTSE page (Will implemented in future). If the GTSE authentication has done, then access token can be get by getToken method in some HTTP session. In this case the REST client will attached to REST service using existing GTSE session.
## Data model##
1. [Authentication token](#markdown-header-authentication-token)  
2. [Alert Profile](#markdown-header-alert-profile)  
3. [Temperature Rule](#markdown-header-temperature-rule)  
4. [Notification Schedule](#markdown-header-notification-schedule)  
5. [Location](#markdown-header-location)  
6. [Shipment Template](#markdown-header-shipment-template)  
7. [Device](#markdown-header-device)  
8. [Device group](#markdown-header-device-group)  
9. [Shipment](#markdown-header-shipment)  
10. [Notification](#markdown-header-notification)  
11. [Alert](#markdown-header-alert)  
12. [Temperature Alert](#markdown-header-temperature-alert)  
13. [Arrival](#markdown-header-arrival)  
14. [User](#markdown-header-user)  
15. [AutoStart Shipment](#markdown-header-autostart-shipment)

## Lists ##
List items is short representations of base entities, like as [Alert Profile](#markdown-header-alert-profile), [Location](#markdown-header-location), etc. Some of fields can be get from corresponding base entity and some can be synthetic fields.  

1. [Shipment Template list item](#markdown-header-shipment-template-list-item) 
2. [Shipment List item](#markdown-header-shipment-list-item)  
3. [Notification Schedule list item](#markdown-header-notification-schedule-list-item)  
4. [User List item](#markdown-header-user-list-item)  
5. [Expanded User list item](#markdown-header-expanded-list-user-item)  
6. [Alert Profile list Item](#markdown-header-list-alert-profile-item)
7. [Notification list Item](#markdown-header-list-notification-item)

## Special Request objects ##
1. [Get Shipments filter](#markdown-header-get-shipments-filter)

## Rest Service methods.
1. [Authentication](#markdown-header-authentication).  
2. [Save user](#markdown-header-save-user)  
3. [Get User](#markdown-header-get-user-info)  
4. [Get Users](#markdown-header-get-users)  
5. [List Users](#markdown-header-list-users)  
6. [Delete User](#markdown-header-delete-user)
7. [Update User details](#markdown-header-update-user-details)  
8. [Logout](#markdown-header-logout)  
9. [Refresh access token](#markdown-header-refresh-access-token)  
10. [Save alert profile](#markdown-header-save-alert-profile)  
11. [Get Alert Profile](#markdown-header-get-alert-profile)  
12. [Get Alert Profiles](#markdown-header-get-alert-profiles)  
13. [Delete Alert Profile](#markdown-header-delete-alert-profile)  
14. [Save notification schedule](#markdown-header-save-notification-schedule)  
15. [Get notification schedules](#markdown-header-get-notification-schedules)  
16. [Get Notification Schedule](#markdown-header-get-notification-schedule)  
17. [Delete Notification Schedule](#markdown-header-delete-notification-schedule)  
18. [Delete Person Schedule](#markdown-header-delete-person-schedule)  
19. [Save Location](#markdown-header-save-location)  
20. [Get Locations](#markdown-header-get-locations)  
21. [Get Location](#markdown-header-get-location)  
22. [Delete Location](#markdown-header-delete-location)  
23. [Save Shipment Template](#markdown-header-save-shipment-template)  
24. [Get Shipment templates](#markdown-header-get-shipment-templates)  
25. [Get Shipment Template](#markdown-header-get-shipment-template)  
26. [Delete Shipment Template](#markdown-header-delete-shipment-template)  
27. [Save Shipment](#markdown-header-save-shipment)  
28. [Get Shipments](#markdown-header-get-shipments)  
29. [Get Shipments Nearby](#markdown-header-get-shipments-nearby)  
30. [Get Shipment](#markdown-header-get-shipment)  
31. [Get Single Shipment](#markdown-header-get-single-shipment)
32. [Get Single Shipment Lite](#markdown-header-get-single-shipment-lite)
33. [Delete Shipment](#markdown-header-delete-shipment)  
34. [Suppress alerts](#markdown-header-suppress-alerts)  
35. [Save Device](#markdown-header-save-device) 
36. [Shutdown Device](#markdown-header-shutdown-device) 
37. [Get Device](#markdown-header-get-device)  
38. [Get Devices](#markdown-header-get-devices)  
39. [Save Device Group](#markdown-header-save-device-group) 
40. [Move Device](#markdown-header-move-device)  
41. [Get Device Group](#markdown-header-get-device-group)  
42. [Get Device Groups](#markdown-header-get-device-groups)  
43. [Delete Device Group](#markdown-header-delete-device-group)  
44. [Add Device to Group](#markdown-header-add-device-to-group)  
45. [Remove Device from Group](#markdown-header-remove-device-from-group)  
46. [Get Devices of Group](#markdown-header-get-devices-of-group)    
47. [Get Groups of Device](#markdown-header-get-groups-of-device)  
48. [Get Notifications](#markdown-header-get-notifications)  
49. [Send Command to Device](#markdown-header-send-command-to-device)  
50. [Mark Notification as read](#markdown-header-mark-notification-as-read) 
51. [Save AutoStart Shipment](#markdown-header-save-autostart-shipment) 
52. [Get AutoStart Shipment](#markdown-header-get-autostart-shipment)  
53. [Get AutoStart Shipments](#markdown-header-get-autostart-shipments)  
54. [Delete AutoStart Shipment](#markdown-header-delete-autostart-shipment)  
55. [Save Note](#markdown-header-save-note) 
56. [Get Notes](#markdown-header-get-notes)  
57. [Delete Note](#markdown-header-delete-note)  
58. [Create (save) Simulator](#markdown-header-save-simulator)  
59. [Delete Simulator](#markdown-header-delete-simulator)  
60. [Start Simulator](#markdown-header-start-simulator)  
61. [Stop Simulator](#markdown-header-stop-simulator)  
62. [Get Simulator](#markdown-header-get-simulator)  
63. [Autostart new Shipment](#markdown-header-autostart-new-shipment)  
64. [Init Device colors](#markdown-header-init-device-colors)  
65. [Get Readings](#markdown-header-get-readings)  
66. [Get Shipment Report](#markdown-header-get-shipment-report)  
67. [Email Shipment Report](#markdown-header-email-shipment-report)  
68. [Get Performance Report](#markdown-header-get-performance-report)  
69. [Add Interim Stop](#markdown-header-add-interim-stop)  
70. [Save Interim Stop](#markdown-header-save-interim-stop)  
71. [Delete Interim Stop](#markdown-header-delete-interim-stop)  
72. [Get Interim Stop](#markdown-header-get-interim-stop)  
73. [Get Shipment Audits](#markdown-header-get-shipment-audits)  
74. [Get Corrective Action List](#markdown-header-get-corrective-action-list)  
75. [Save Corrective Action List](#markdown-header-save-corrective-action-list)  
76. [Delete Corrective Action List](#markdown-header-delete-corrective-action-list)  
77. [Get Corrective Action Lists](#markdown-header-get-corrective-action-lists)  
78. [Get Action Taken](#markdown-header-get-action-taken)  
79. [Save Action Taken](#markdown-header-save-action-taken)  
80. [Delete Action Taken](#markdown-header-delete-action-taken)  
81. [Get Action Takens](#markdown-header-get-action-takens)  

### Utility methods ###
1. [Get Languages](#markdown-header-get-languages)  
2. [Get Roles](#markdown-header-get-roles)  
3. [Get Time Zones](#markdown-header-get-time-zones)  
4. [Get User Time](#markdown-header-get-user-time)  
5. [Get Measurement Units](#markdown-header-get-measurement-units)  

### Shipment Audit ###
## Actions: ##
1. Autocreated Shipent autocreated.  
2. ManuallyCreated Shipment manually created by user.  
3. Viewed [Get Single Shipment](#markdown-header-get-single-shipment) method is called by user.  
4. Updated Shipment is updated by user.  
5. LoadedForEdit [Get Shipment](#markdown-header-get-shipment) is called by user.  
6. SuppressedAlerts alerts suppressed by user.  
7. ViewedLite Get Single Shipment lite method is called by user.  
8. ManuallyCreatedFromAutostart Shipment manually autostarted from template.  
9. ViewAccessDenied Access Denied error is occured during view the shipment.  
10. AddedNote User adds the note.  
11. DeletedNote User deletes the note.  
12. UpdatedNote User updates the note.  

### Authentication.###
Method *GET*, method name *login*, request parameters login - the user login name and password - the user password  
1. email - email of logging in user  
2. password - password  
Returns [Authentication token](#markdown-header-authentication-token).  
[(example)](#markdown-header-authentication-request-example)  

### Save User ###
Method *POST*, method name *saveUser*, request body JSON serialized [Save User Request](#markdown-header-save-user-request)  
Returns ID of just saved user.  
[(example)](#markdown-header-save-user-example)

### Get User Info ###
Method *GET*, method name *getUser*, method parameters  
1. userId - ID of user, can be null. If ID is null the info for currently logged in user will returned.  
Method requires associated privileges. The logged in user should be some as requested info user or should have admin role.  
Method returns [User Object](#markdown-header-user)   
[(example)](#markdown-header-get-user-info-example)

### Get Users ###
Method *GET*, method name *getUsers*, method parameters:
1. pageIndex - number of page  
2. pageSize - size of page  
3. sc - sort column  
4. so - sort order  
Method returns array of [Expanded List User items](#markdown-header-expanded-list-user-item)  
[(example)](#markdown-header-get-users-example)

### List Users ###
Method *GET*, method name *listUsers*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
3. sc - sort column  
4. so - sort order  
Method returns array of [User List items](#markdown-header-user-list-item)  
[(example)](#markdown-header-list-users-example)

### Delete User ###
Method *GET*, method name *deleteUser*, method parameters:  
1 userId - ID of user to delete  
[(example)](#markdown-header-delete-user-example)

### Update User Details ###
Method *POST*, method name *updateUserDetails*. JSON request body contains following properties:  
1. user - user ID.  
2. firstName - first user name.  
3. lastName - last user name.  
4. position - position of user in company.  
5. email - user email address.  
6. phone - user phone number.  
7. temperatureUnits - temperature units.  
8. measurementUnits - measurement units Metric/English  
9. password - user password.  
10. user - user login name. It is not changeable parameter. Is used for identify the user to change details.  
11. temperatureUnits - user temperature units.  
12. timeZone - user time zone.  
13. language - user language.  
14. scale - user schale.  
15. title - user title.  
[(example)](#markdown-header-update-user-details-example)

### Logout ###
Method *GET*, method name *logout*, have not parameters. Closes user REST session and clears all associated resources  
[(example)](#markdown-header-logout-example)

### Refresh access token ###
Method *GET*, method name *refreshToken*, have not parameters. Refresh the access token for current REST session.  
[(example)](#markdown-header-refresh-access-token)

### Get Alert Profiles ###
Method *GET*, method name *getAlertProfiles*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
3. sc - sort column  
4. so - sort order (asc/desc)  
Returns an array of [Alert Profile objects](#markdown-header-alert-profile) and total items count.  
[(example)](#markdown-header-get-alert-profiles-example)

### Get Alert Profile ###
Method *GET*, method name getAlertProfile. Request parameters:  
1. alertProfileId - alert profile ID.  
Returns [Alert Profile Object](#markdown-header-alert-profile).  
[(example)](#markdown-header-get-alert-profile-example)

### Save alert profile ###
Method *POST*, method name *saveAlertProfile*, request body contains JSON serialized [Alert Profile object](#markdown-header-alert-profile). Response contains ID of just saved Alert Profile.  
[(example)](#markdown-header-save-alert-profile-example)

### Delete Alert Profile ###
Method *GET*, method name *deleteAlertProfile*, method parameters:  
1. alertProfileId - alert profile ID  
[(example)](#markdown-header-delete-alert-profile-example)

### Save Notification Schedule ###
Method *POST*, method name *saveNotificationSchedule*, request body contains JSON serialized [Notification Schedule object](#markdown-header-notification-schedule). Response contains ID of just saved Notification Schedule.  
[(example)](#markdown-header-save-notification-schedule-example)]

### Get Notification Schedules ###
Method *GET*, method name *getNotificationSchedules*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
3. sc - sort column  
4. so - sort order (asc/desc)  
Return array of [Notification Schedule list item](#markdown-header-notification-schedule-list-item)
and total items count  
[(example)](#markdown-header-get-notification-schedules-example)

### Get Notification Schedule ###
Method *GET*, method name *getNotificationSchedule*. Request parameters:  
1. notificationScheduleId - notification schedule ID.  
Returns [Notification Schedule Object](#markdown-header-notification-schedule)  
[(example)](#markdown-header-get-notification-schedule-example)

### Delete Notification schedule ###
Method *GET*, method name *deleteNotificationSchedule*. Request parameters:  
1. notificationScheduleId - notification schedule ID.  
[(example)](#markdown-header-delete-notification-schedule-example)

### Delete Person Schedule ###
Method *GET*, method name *deletePersonSchedule*. Request parameters:  
1. notificationScheduleId  
2. personScheduleId  
[(example)](#markdown-header-delete-person-schedule-example)

### Save Location ###
Method *POST*, method name *saveLocation*, request body contains JSON serialized [Location Object](#markdown-header-location). Response contains ID of just saved Location  
[(example)](#markdown-header-save-location-example)

### Get Locations ###
Method *GET*, method name *getLocations*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
3. sc - sort column  
4. so - sort order  
Returns array of [Location Objects](#markdown-header-location) and total items count  
[(example)](#markdown-header-get-locations-example)

### Get Location ###
Method *GET*, method name *getLocation*. Request parameters:  
1. locationId - Location ID.  
Returns [Location Object](#markdown-header-location).  
[(example)](#markdown-header-get-location-example)

### Delete Location ###
Method *GET*, method name *deleteLocation*. Request parameters:  
1. locationId - Location ID.  
[(example)](#markdown-header-delete-location-example)

### Save Shipment template ###
Method *POST*, method name *saveShipmentTemplate*, request body contains JSON serialized [Shipment Template Object](#markdown-header-shipment-template). Response contains ID of just saved Shipment Template  
[(example)](#markdown-header-save-shipment-template-example)

### Get Shipment templates ###
Method *GET*, method name *getShipmentTemplates*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
Returns array of [Shipment Template List item](#markdown-header-shipment-template-list-item)
and total items count  
[(example)](#markdown-header-get-shipment-templates-example)

### Get Shipment Template ###
Method *GET*, method name *getShipmentTemplate*. Request parameters:  
1. id - shipment template ID.  
Returns [Shipment Template Object](#markdown-header-shipment-template)  
[(example)](#markdown-header-get-shipment-template-example)

### Delete Shipment Template ###
Method *GET*, method name *deleteShipmentTemplate*, Request parameters:  
1. shipmentTemplateId - shipment template ID.  
[(example)](#markdown-header-delete-shipment-template-example)

### Save Device ###
Method *POST*, method name *saveDevice*, request body contains JSON serialized [Device Object](#markdown-header-device).  
[(example)](#markdown-header-save-device-example)

### Shutdown Device ###
Method *GET*, method name *shutdownDevice*, Request parameters:    
1. shipmentId - ID of shipment to shutdown  
[(example)](#markdown-header-shutdown-device-example)

### Get Devices ###
Method *GET*, method name *getDevices*, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
Returns array of [Device Objects](#markdown-header-device) and total items count.  
[(example)](#markdown-header-get-devices-example)

### Get Device ###
Method *GET*, method name *getDevice*. Request parameters:
1. imei - device IMEI.  
Returns expanded [Device Object](#markdown-header-device) with added last reading and auto start template info  
[(example)](#markdown-header-get-device-example)

### Move Device ###
Method *GET*, method name *moveDevice*. Request parameters:  
1. company - target company.  
2. device - device to move.  
Returns IMEI of saved previous device.  
This method creates new virtual devices, moves shipments, device groups, alerts, arrivals, trackerevents from  
origin device to self, and assign origin devices for given company  
[(example)](#markdown-header-move-device-example)

### Save Device Group ###
Method *POST*, method name *saveDeviceGroup*. Request body contains JSON serialized [Device Group Object](#markdown-header-device-group)  
[(example)](#markdown-header-save-device-group-example)

### Get Device Group ###
Method *GET*, method name *getDeviceGroup*. Method parameters:  
1. name - group name.  
2. id - group ID. 
One from 'name' or 'id' should be presented   
Returns [Device Group object](#markdown-header-device-group)  
[(example)](#markdown-header-get-device-group-example)

### Get Device Groups ###
Method *GET*, method name *getDeviceGroups*. Method parameters:  
1. pageIndex - page index  
2. pageSize - page size  
3. sc - sort column  
4. so - sort order  
Returns list of [Device Group object](#markdown-header-device-group)  
[(example)](#markdown-header-get-device-groups-example)  

### Delete Device Group ###
Method *GET*, method name *deleteDeviceGroup*. Method parameters:  
1. name - group name  
2. id - group ID  
One from 'name' or 'id' should be presented  
[(example)](#markdown-header-delete-device-group-example)

### Add Device to Group ###
Method *GET*, method name *addDeviceToGroup*. Method parameters:  
1. groupName - group name.  
2. groupId - group ID.  
3. device - device IMEI.  
One from 'groupName' or 'groupId' should be presented  
[(example)](add-device-to-group-example)

### Remove Device from Group ###
Method *GET*, method name *removeDeviceFromGroup*. Method parameters:  
1. groupName - group name.  
2. groupId - group ID.  
3. device - device IMEI.  
One from 'groupName' or 'groupId' should be presented  
[(example)](remove-device-from-group-example)

### Get Devices of Group ###
Method *GET*, method name *getDevicesOfGroup*. Method parameters:  
1. groupName - name of group  
Returns array of [Device Objects](#markdown-header-device)  
[(example)](get-devices-of-group-example)

### Get Groups of Device ###
Method *GET*, method name *getGroupsOfDevice*. Method parameters:  
1. device - device IMEI code  
Returns array of [Device Group Objects](#markdown-header-device-group)  
[(example)](#markdown-header-get-groups-of-device-example)

### Save Shipment ###
Method *POST*, method name saveShipment, request body contains JSON serialized [Save Shipment request](#markdown-header-save-shipment-request). Response contains ID of just saved Shipment and ID of shipment template if the shipment was saved with corresponding option.  
[(example)](#markdown-header-save-shipment-example)

### Get Shipment ###
Method *GET*, method name *getShipment*. Request parameters:  
1. id - shipment ID.  
Returns [Shipment Object](#markdown-header-shipment)  
[(example)](#markdown-header-get-shipment-example)

### Get Shipments ###
Method *POST*, method name getShipments, request body [Get Shipments filter](#markdown-header-get-shipments-filter)  
Returns array of [Shipment List items](#markdown-header-shipment-list-item) and total items count,
it is not same as [Shipment Object](#markdown-header-shipment).  
[(example)](#markdown-header-get-shipments-example)

### Get Shipments Nearby ###
Method *GET*, method name getShipmentsNearby, request parameters:
lat=20.0&lon=20.0&radius=500&from=2017-04-08T16-05-48  
1. lat - location latitude  
2. lon - location longitude  
3. radius - location radius  
4. from - optional parameter the max oldest date for last reading  
Returns array of Lite shipment items and total items count,
it is not same as shipment object.  
[(example)](#markdown-header-get-shipments-nearby-example)

### Delete Shipment ###
Method *GET*, method name deleteShipment, method parameters:  
1. shipmentId - shipment ID  
[(example)](#markdown-header-delete-shipment-example)

### Suppress alerts ###
Method *GET*, method name *suppressAlerts*, Request parameters:  
1. shipmentId - ID of shipment to suppress alerts.  
[(example)](#markdown-header-suppress-alerts-example)

### Get Single Shipment ###
Method *GET*, method *getSingleShipment*. Request parameters:  
1. shipmentId shipment ID  
or  
1. sn device serial number  
2. trip shipment trip count  
[(example)](#markdown-header-get-single-shipment-example)

### Get Single Shipment Lite ###
Method *GET*, method *getSingleShipmentLite*. Request parameters:  
1. shipmentId shipment ID  
or  
1. sn device serial number  
2. trip shipment trip count  
[(example)](#markdown-header-get-single-shipment-lite-example)

### Get Notifications ###
Method *GET*, method name getNotifications, method parameters:  
1. pageIndex - number of page  
2. pageSize - size of page  
3. includeRead - include notification which have mark as read  
Returns array of [Notification List items](#markdown-header-list-notification-item) and total items count  
[(example)](#markdown-header-get-notifications-example)

### Mark Notification as read ###
Method *POST*, method name *markNotificationsAsRead*. Request body contains JSON array of notification ID.  
[(example)](#markdown-header-mark-notification-as-read-example)

### Send Command to Device ###
Method *POST*, method name *sendCommandToDevice*. Request body contains [Device](#markdown-header-device) ID and device specific command.  
[(example)](#markdown-header-send-command-to-device-example)

### Save AutoStart Shipment ###
Method *POST*, method name *saveAutoStartShipment*. Request body contains [AutoStart Shipment](#markdown-header-autostart-shipment).  
[(example)](#markdown-header-save-autostart-shipment-example)

### Get AutoStart Shipment ###
Method *GET*, method *getAutoStartShipment*. Request parameters:  
1. autoStartShipmentId autostart shipment ID  
[(example)](#markdown-header-get-autostart-shipment-example)

### Get AutoStart Shipments ###
Method *GET*, method *getAutoStartShipments*. Request parameters:  
1. autoStartShipmentId autostart shipment ID  
2. pageIndex - number of page  
3. pageSize - size of page  
Returns array of [AutoStart Shipments](#markdown-header-autostart-shipment)  
[(example)](#markdown-header-get-autostart-shipments-example)

### Delete AutoStart Shipment ###
Method *GET*, method *deleteAutoStartShipment*. Request parameters:  
1. autoStartShipmentId autostart shipment ID  
[(example)](#markdown-header-delete-autostart-shipment-example)

### Save Note ###
Method *POST*, method name *saveNote*. Request body contains [Save Note request](#markdown-header-save-note-request).  
[(example)](#markdown-header-save-note-example)

### Get Notes ###
Method *GET*, method *getNotes*. Request parameters:  
1. shipmentId - shipment ID  
2. sn - device serial number.  
3. trip - shipment trip count  
One is required or shipmentId or sn+trip pair  
[(example)](#markdown-header-get-notes-example)

### Delete Note ###
Method *GET*, method *deleteNote*. Request parameters:  
1. shipmentId - shipment ID  
2. sn - device serial number.  
3. trip - shipment trip count  
4. noteNum - note number  
One is required or shipmentId or sn+trip pair  
[(example)](#markdown-header-delete-note-example)

### Save Simulator ###
Method *POST*, method *saveSimulator*. Request JSON body: save simulator request.  
Response contains IMEI of created virtual device  
Requires SmartTraceAdmin role  
[(example)](#markdown-header-save-simulator-example)

### Delete Simulator ###
Method *GET*, method *deleteSimulator*. Request parameters:  
1. user - email of simulator owner  
One is required or shipmentId or sn+trip pair  
Requires SmartTraceAdmin role  
[(example)](#markdown-header-delete-simulator-example)

### Start Simulator ###
Method *POST*, method *startSimulator*. Request JSON body: start simulator request.  
[(example)](#markdown-header-start-simulator-example)

### Stop Simulator ###
Method *GET*, method *stopSimulator*. Request parameters:  
1. user - email of simulator owner. If null, currently logged in user will used by default  
[(example)](#markdown-header-stop-simulator-example)

### Get Simulator ###
Method *GET*, method *getSimulator*. Request parameters:  
1. user - email of simulator owner. If null, currently logged in user will used by default.  
If user specified and is not equals currently logged in user, the SmartTraceAdmin role is required.  
[(example)](#markdown-header-get-simulator-example)

### AutoStart new Shipment ###
Method *GET*, method *autoStartNewShipment*. Request parameters:  
1. device - the device.  
Last reading for given device is required.  
[(example)](#markdown-header-autostart-new-shipment-example)

### Init device colors ###
Method *GET*, method name *initDeviceColors*. Request parameters:
1. company - company ID. If null, the company ID of currently logged in user will used.  
Company admin role is required if ID is null or equals of currently logged in user.  
Or SmartTraceAdmin role otherwise.  
[(example)](#markdown-header-init-device-colors-example)

### Get Readings ###
Method *GET*, method name *getReadings*. Request parameters:
1. device - full device IMEI  
2. startDate - start date range (not mandatory)  
3. endDate - end date range (not mandatory)  
The dates have yyyy-MM-dd'T'HH-mm-ss format (ie. 2016-07-26T08-17-58).  
This format is used for avoid of URL encoding of dates  
[(example)](#markdown-header-get-readings-example)

### Get Shipment Report ###
Method *GET*, method name *getShipmentReport*. Request parameters:
1. shipmentId shipment ID  
or  
1. sn device serial number  
2. trip shipment trip count  
Returns PDF file as byte stream  
[(example)](#markdown-header-get-shipment-report-example)

### Email Shipment Report ###
Method *POST*, method name *emailShipmentReport*. Request body JSON serialized request.  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-email-shipment-report-example)

### Get Performance Report ###
Method *GET*, method name *getPerformanceReport*. Request parameters:
1. month (yyyy-MM) end month of report. Not required, by default current month will used.  
Returns PDF file as byte stream  
[(example)](#markdown-header-get-performance-report-example)

### Add Interim Stop ###
Method *POST*, method name *addInterimStop*. Request body JSON serialized request.  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-add-interim-stop-example)

### Save Interim Stop ###
Method *POST*, method name *saveInterimStop*. Request body JSON serialized request.  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-save-interim-stop-example)

### Delete Interim Stop ###
Method *GET*, method name *deleteInterimStop*. Request parameters:  
1. id - interim stop ID  
2. shipment - shipment ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-delete-interim-stop-example)

### Get Interim Stop ###
Method *GET*, method name *getInterimStop*. Request parameters:  
1. id - interim stop ID  
2. shipment - shipment ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-interim-stop-example)

### Get Shipment Audits ###
Method *GET*, method name *getShipmentAudits*. Request parameters:  
1. shipmentId - shipment ID (not mandatory)  
2. userId - user ID (not mandatory)  
3. sc - sorting column (not mandatory)  
4. so - sorting order (not mandatory)  
5. pageIndex - page index (not mandatory)  
6. pageSize - page size (not mandatory)  
One shipmentId or userId should be specified. Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-shipment-audits-example)

### Get Corrective Action list ###
Method *GET*, method name *getCorrectiveActionList*. Request parameters:  
1. id - Corrective Action list ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-corrective-action-list-example)

### Save Corrective Action list ###
Method *POST*, method name *saveCorrectiveActionList*. Request body JSON serialized request.  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-save-corrective-action-list-example)

### Delete Corrective Action list ###
Method *GET*, method name *deleteCorrectiveActionList*. Request parameters:  
1. id - Corrective Action list ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-delete-corrective-action-list-example)

### Get Corrective Action lists ###
Method *GET*, method name *getCorrectiveActionLists*. Request parameters:  
1. sc - sorting column (not mandatory)  
2. so - sorting order (not mandatory)  
3. pageIndex - page index (not mandatory)  
4. pageSize - page size (not mandatory)  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-corrective-action-lists-example)

### Get Action Taken ###
Method *GET*, method name *getActionTaken*. Request parameters:  
1. id - Action Taken ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-action-taken-example)

### Save Action Taken ###
Method *POST*, method name *saveActionTaken*. Request body JSON serialized request.  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-save-action-taken-example)

### Delete Action Taken ###
Method *GET*, method name *deleteActionTaken*. Request parameters:  
1. id - Action Taken ID  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-delete-action-taken-example)

### Get Action Takens ###
Method *GET*, method name *getActionTakens*. Request parameters:  
1. shipment associated shipment  
Response is [Standard JSON response](#markdown-header-response-message)  
[(example)](#markdown-header-get-action-takens-example)

## Objects
### Response message ###
```json
{
  "status": { //response status
    "code": 0,
    "message": "Success"
  },
  "response": {
    "token": "1401890001-e4adc2304877e138edf5e33a3e584c35",
    "expired": "2016-01-17T00:35"
  }
  //additional response information. I.e. totalCount for lists
}
```
see [ResponseStatus](#markdown-header-response-status)
### Response status ###
```json
{
  "code": 0, // 0 - success, error for other codes
  "message": "Success"
}
```
### Authentication token ###
```json
{
    "token": "701167453-8c73a57deb6903f712dd2359264973ec", // authentication token
    "expired": "2016-01-17T00:35" // expiration time
}
```
### Alert Profile ###
```json
{
	"alertProfileId": 182,
	"alertProfileName": "AnyAlert",
	"alertProfileDescription": "Any description",
	"watchBatteryLow": true,
	"watchEnterBrightEnvironment": true,
	"watchEnterDarkEnvironment": true,
	"watchMovementStart": true,
	"watchMovementStop": true,
	"lowerTemperatureLimit": -1.0, // if absent, default is 0C
	"upperTemperatureLimit": 7.0,  // if absent, default is 5C
	"temperatureIssues": [/* Array of temperature rules */]
}
```
[(See Temperature Rule)](#markdown-header-temperature-rule)
### Temperature Rule ###
```json
{
  "id": 1007,
  "type": "CriticalHot",
  "temperature": 17.0,
  "timeOutMinutes": 1,
  "cumulativeFlag": true
}
```
### List Alert Profile Item ###
```json
{
  "alertProfileId": 848,
  "alertProfileName": "Name",
  "alertProfileDescription": "Description",
  "alertRuleList": [
    ">18,0°C for 0 min in total",
    ">17,0°C for 1 min in total",
    "<-12,0°C for 0 min in total",
    "<-11,0°C for 1 min in total",
    ">6,0°C for 0 min in total",
    ">7,0°C for 2 min in total",
    "<-7,0°C for 40 min in total",
    "<-5,0°C for 55 min in total"
  ]
}
```
### list-notification-item ###
```json
{
  "notificationId": 28,
  "closed": false,
  "date": "2016-02-02T18:34",
  "type": "Arrival",
  "alertType": null,
  "alertId": 35,
  "shipmentId": 164,
  "title": "Arrival",
  "Line1": "Tracker 039485(1) is in 1500 meters for arrival",
  "Line2": "Some long shipment description here",
  "Line3": "About 200km from XYZ Warehouse"
}
```
### Notification Schedule ###
```json
{
    "notificationScheduleDescription": "JUnit schedule",
    "notificationScheduleId": 425,
    "notificationScheduleName": "Sched",
    "schedules": [
       //array of embedded person schedules
    ]
}
```
[(See Person Schedule)](#markdown-header-person-schedule)
### Person Schedule ###
```json
{
    "personScheduleId": 2165,
    "user": 77, // user ID
    "sendApp": true,
    "sendEmail": false,
    "sendSms": false,
    "fromTime": "13:20",
    "toTime": "20:00",
    "weekDays": [
      true,
      false,
      false,
      true,
      false,
      false,
      false
    ]
}
```  
[(See User)](#markdown-header-user)
### Location ###
```json
{
  "locationId": 11,
  "locationName": "Loc-1",
  "companyName": "Sun Microsystems",
  "notes": "Any notes",
  "address": "Bankstown Warehouse",
  "location": {
    "lat": 100.5,
    "lon": 100.501
  },
  "radiusMeters": 1000,
  "startFlag": "Y",
  "interimFlag": "Y",
  "endFlag": "Y"
}
```
### Shipment Template ###
```json
{
    "shipmentTemplateId": 374,
    "shipmentTemplateName": "JUnit-tpl",
    "shipmentDescription": "Any Description",
    "addDateShipped": true,
    "shippedFrom": 463,
    "shippedTo": 464,
    "detectLocationForShippedFrom": true,
    "alertProfileId": 280,
    "alertSuppressionMinutes": 55,
    "alertsNotificationSchedules": [
      445
    ],
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationWithinKm": 11,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalNotificationSchedules": [
      446
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "noAlertsAfterStartMinutes": null,
    "shutDownAfterStartMinutes": null,
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
    "interimLocations": [
      5296,
      5297
    ],
    "userAccess": [
      2113,
      2114
    ],
    "companyAccess": [
      1306,
      1307
    ]
}
```  
### Device ###
```json
{
  "description": "Device description",
  "imei": "0239487043987",
  "name": "Device Name",
  "active": true,
  "sn": "043987", // read only property
  "color": "Crimson",
  "autostartTemplateId": null
}
```
### Device Group ###
```json
{
  "name": "G2",
  "description": "JUnit device group"
}
```
### Save Shipment request ###
```json
{
  "saveAsNewTemplate": true,
  "includePreviousData": true, // can be blank, default is true
  "templateName": "NewTemplate.tpl", // template name in case of save also as new template
  "shipment": ${EmbeddedShipmentObject} //this shipment object to save
}
```
see [Shipment Object](#markdown-header-shipment)
### Shipment ###
```json
{
	"status": "InProgress",
	"deviceImei": "234908720394857",
	"deviceSN": "039485",
	"deviceName": "Device Name",
	"tripCount": 1,
	"shipmentId": 401,
	"shipmentDescription": "Any Description",
	"palletId": "palettid",
	"poNum": 893793487,
	"assetNum": "10515",
	"assetType": "SeaContainer",
	"shippedFrom": 503,
	"shippedTo": 504,
	"shipmentDate": "2015-11-12T22:24",
    "arrivalTime": "2016-02-16T20:29",
	"alertProfileId": 302,
	"alertSuppressionMinutes": 55,
	"alertsNotificationSchedules": [
	  493
	],
	"commentsForReceiver": "Comments for receiver",
	"arrivalNotificationWithinKm": 111,
	"excludeNotificationsIfNoAlerts": true,
	"arrivalNotificationSchedules": [
	  494
	],
	"shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
	"customFields": {
	  "field1": "value1"
	},
    "interimLocations": [
      4735,
      4736
    ],
    "interimStops": [ // not mandatory field. If not presented in request then not will changed in given shipment
      980
    ],
    "userAccess": [ //array of user ID
      2033,
      2034
    ],
    "companyAccess": [ //array of company ID
      1278,
      1279
    ]
}
```
### Shipment List Item ###
```json
{
  "status": "InProgress",
  "deviceSN": "039485",
  "deviceName": "Device Name",
  "tripCount": 1,
  "shipmentId": 390,
  "shipmentDescription": "Any Description",
  "shipmentDate": "2015-11-12T22:24",
  "palletId": "palettid",
  "assetNum": "10515",
  "assetType": "SeaContainer",
  "shippedFrom": "Bankstown Warehouse",
  "shippedTo": "Bankstown Warehouse",
  "estArrivalDate": "2015-11-12T22:24",
  "estArrivalDateISO": "2015-11-12T22:24",
  "percentageComplete": 0,
  "alertProfileId": 293,
  "alertProfileName": "AnyAlert",
  "sendArrivalReport": true,
  "arrivalReportOnlyIfAlerts": false,
  "alertSummary": {
    "MovementStart": "4",
    "LightOn": "1",
    "LightOff": "1",
    "CriticalHot": "1",
    "Hot": "2",
    "CriticalCold": "3",
    "Battery": "2",
    "Cold": "1"
  }
}
```
See also [Shipment Object](#markdown-header-shipment)
### Notification ###
```json
{
  "id": 29,
  "type": "Alert",
  "issue": { // Notification issue Temperature Alert|Other Alert|Arrival
    "id": 28,
    "date": "2015-11-05T13:57",
    "device": "234908720394857",
    "shipment": 27,
    "type": "Hot",
    "temperature": 5.0,
    "minutes": 55
  }
}
```  
see [Ordinary Alert Object](#markdown-header-alert), [Temperature Alert Object](#markdown-header-temperature-alert), [Arrival Object](#markdown-header-arrival)
### Alert ###
```json
{
	"id": 14,
	"date": "2015-11-05T13:57",
	"device": "234908720394857",
	"shipment": 11,
	"type": "Battery"  // alert type: (EnterBrightEnvironment|EnterDarkEnvironment|Shock|BatteryLow)
}
```
### Temperature Alert###
```json
{
    "id": 28,
    "date": "2015-11-05T13:57",
    "device": "234908720394857",
    "shipment": 27,
    "type": "Hot", // alert type (LowTemperature|HighTemperature|CriticalLowTemperature|CriticalHighTemperature)
    "temperature": 5.0,
    "minutes": 55
}
```
### Arrival ###
```json
{
	"id": 16,
	"numberOfMetersOfArrival": 1500,
	"date": "2015-11-05T13:57",
	"device": "234908720394857",
	"shipment": 11
}
```
### User ###
```json
{
    "id": 1423,
    "firstName": "firstname",
    "lastName": "LastName",
    "title": "Mr",
    "internalCompany": "JUnit-C", //read only property
    "internalCompanyId": 1368,
    "external": true,
    "externalCompany": "External JUnit company",
    "position": "Manager",
    "email": "abra@cada.bra",
    "phone": "1111111117",
    "roles": [
      "Dispatcher",
      "CompanyAdmin",
      "ReportViewer"
    ],
    "timeZone": "UTC",
    "temperatureUnits": "Celsius",
    "measurementUnits": "English",
    "language": "English",
    "deviceGroup": "DeviceGroupName",
    "active": false
}
```
### AutoStart Shipment ###
```json
{
  "priority": 99,
  "id": null,
  "startLocations": [
    9514
  ],
  "startLocationNames": [],
  "endLocations": [
    9513
  ],
  "endLocationNames": [],
  "interimStops": [
    9515
  ],
  "interimStopsNames": [],
  "shipmentTemplateName": "JUnit name",
  "shipmentDescription": "JUnit shipment",
  "addDateShipped": true,
  "alertProfileId": 4145,
  "alertProfileName": null,
  "alertSuppressionMinutes": 25,
  "alertsNotificationSchedules": [
    7008
  ],
  "commentsForReceiver": "Any comments for receiver",
  "arrivalNotificationWithinKm": 15,
  "excludeNotificationsIfNoAlerts": true,
  "arrivalNotificationSchedules": [
    7009
  ],
  "shutdownDeviceAfterMinutes": 99,
  "noAlertsAfterArrivalMinutes": 43,
  "noAlertsAfterStartMinutes": null,
  "shutDownAfterStartMinutes": 47,
  "sendArrivalReport": true,
  "arrivalReportOnlyIfAlerts": false
}
```
### Expanded List User Item ###
```json
{
  "id": 1415,
  "firstName": "A2",
  "lastName": "LastA2",
  "email": "u1@google.com",
  "companyName": "Internal JUnit Company", //name of internal company if the user is not external,
                                           //name of external company otherwise
  "position": "Manager",
  "roles": [
    "CompanyAdmin"
  ],
  "active": true,
  "external": false
}
```
### Save User Request ###
```json
{
  "user": ${userObject},
  "password": "newpassword",
  "company": 1529, //company can be null, the company of current logged in user will used in this case.
                  //not null company can be used only by GlobalAdministrator
  "resetOnLogin": true  //whether or not should user reset password on first login.
}
```
[(see)](#markdown-header-user)
## List Items ##
### Shipment Template List item ###
```json
{
  "shipmentTemplateId": 372,
  "shipmentTemplateName": "JUnit-tpl",
  "shipmentDescription": "Any Description",
  "shippedFrom": 459,
  "shippedFromLocationName": "Loc-7",
  "shippedTo": 460,
  "shippedToLocationName": "Loc-8",
  "alertProfile": 278,
  "alertProfileName": "AnyAlert"
}
```
### Notification Schedule List item ###
```json
{
  "notificationScheduleId": 5,
  "notificationScheduleName": "Sched",
  "notificationScheduleDescription": "JUnit schedule",
  "peopleToNotify": "Alexander Suvorov, Mikhael Kutuzov"
}
```
### User List item ###
```json
{
  "id": 289,
  "fullName": "A1 LastA1"
}
```
## JSON Requests ##
### Get Shipments filter ###
```json
{
  "alertsOnly": true,
  "deviceImei": "283409237873234",
  "last2Days": true,
  "lastDay": true,
  "lastMonth": true,
  "lastWeek": true,
  "shipmentDateFrom": "2015-11-12T18:21",
  "shipmentDateTo": "2015-11-24T07:51",
  "shipmentDescription": "JUnit Shipment",
  "shippedFrom": [], //array of ID of shipped from locations
  "shippedTo": [], //array of ID of shipped to locations
  "status": "InProgress",
  "goods": "JUnit",
  "excludePriorShipments": true,
  "pageIndex": 10,
  "pageSize": 200,
  "sortOrder": "asc",
  "sortColumn": "anyColumn"
}
```
### Save Note request ###
```json
{
  "createdBy": null, //by default is the email of currently logged in user
  "creationDate": null, //by default is current system time
  "noteNum": null, //required for update operation, for create new note operation should be null
  "noteText": "Note text",
  "shipmentId": null, //one from shipmentId or sn/trip pair is required
  "noteType": "Simple",
  "sn": "039485", //one from shipmentId or sn/trip pair is required
  "trip": 1, //one from shipmentId or sn/trip pair is required
  "timeOnChart": "2016-04-05 22:10",
  "createdByName": "Yury G"
}
```
## Examples ##
### Authentication request example ###
**GET /vf/rest/login?email=u1%40google.com&password=password**   
**Response**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "token": "7171890-f481f2909adab6cf92a40661b3bab429",
    "expired": "2016-01-17T11:32"
  }
}
```
### Attach to existing session example ###
**GET /vf/rest/getToken**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "token": "7171890-f481f2909adab6cf92a40661b3bab429",
    "expired": "2016-01-17T11:32"
  }
}
```
### Get user info example ###
**GET /vf/rest/getUser/${authToken}?userId=2585**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "id": 2585,
    "firstName": "firstname",
    "lastName": "LastName",
    "title": "Mr",
    "internalCompany": "JUnit-C",
    "internalCompanyId": 2323,
    "external": true,
    "externalCompany": "External JUnit company",
    "position": "Manager",
    "email": "abra@cada.bra",
    "phone": "1111111117",
    "roles": [
      "ReportViewer",
      "CompanyAdmin",
      "Dispatcher"
    ],
    "timeZone": "UTC",
    "temperatureUnits": "Celsius",
    "measurementUnits": "English",
    "language": "English",
    "deviceGroup": "DeviceGroupName",
    "active": false
  }
}
```
### Save User example ###
**POST /vf/rest/saveUser/${accessToken}**  
**Request:** 
```json
{
  "user": {
    "id": null,
    "firstName": "firstname",
    "lastName": "LastName",
    "title": "Mrs",
    "internalCompany": "JUnit-C", //not required property, is read only and will ignored during save operation
    "internalCompanyId": 1364,
    "external": true,
    "externalCompany": "External JUnit company",
    "position": "Manager",
    "email": "abra@cada.bra",
    "phone": "1111111117",
    "roles": [
      "CompanyAdmin",
      "Dispatcher",
      "ReportViewer"
    ],
    "timeZone": "UTC",
    "temperatureUnits": "Celsius",
    "measurementUnits": "English",
    "language": "English",
    "deviceGroup": "DeviceGroupName",
    "active": false
  },
  "password": "password",
  "resetOnLogin": true
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "userId": 1705
  }
}
```
### Get Users example ###
**GET /vf/rest/getUsers/${accessToken}?so=asc&pageSize=1&sc=firstName&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 1415,
      "firstName": "A2",
      "lastName": "LastA2",
      "email": "u1@google.com",
      "companyName": "Internal JUnit Company",
      "position": "Manager",
      "roles": [
        "CompanyAdmin"
      ],
      "active": true,
      "external": false
    },
    {
      "id": 1416,
      "firstName": "A1",
      "lastName": "LastA1",
      "email": "u2@google.com",
      "companyName": "External JUnit Company",
      "position": "Driver",
      "roles": [
        "CompanyAdmin"
      ],
      "active": true,
      "external": true
    }
  ],
  "totalCount": 2
}
```
### List Users example ###
**GET /vf/rest/listUsers/${authToken}?so=asc&pageSize=1&sc=login&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 273,
      "fullName": "A2 LastA2",
      "positionCompany": "Manager - JUnit Internal Company"
    },
    {
      "id": 274,
      "fullName": "A1 LastA1",
      "positionCompany": "Docker - JUnit External Company"
    }
  ],
  "totalCount": 2
}
```
### Delete User example ###
**GET /vf/rest/deleteUser/${accessToken}?userId=1711**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Update User Details example ###
**POST /vf/rest/updateUserDetails/${authToken}**  
**Request body:**  
```json
{
  "user": 1429,
  "password": "abrakadabra",
  "firstName": "firstname",
  "lastName": "LastName",
  "position": "Manager",
  "email": "abra@cada.bra",
  "phone": "1111111117",
  "temperatureUnits": "Fahrenheit",
  "timeZone": "GMT+02:00",
  "measurementUnits": "English",
  "language": "English",
  "scale": "scale",
  "title": "Developer"
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Logout example ###
**GET /vf/rest/logout/${authToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```  
### Refresh access token ###
**GET /vf/rest/refreshToken/${authToken}**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "token": "7171890-f481f2909adab6cf92a40661b3bab429",
    "expired": "2016-01-17T11:32"
  }
}
```
### Save alert profile example ###
**POST /vf/rest/saveAlertProfile/${authToken}**  
**Request body:**  
```json
{
  "alertProfileId": 2141,
  "alertProfileName": "AnyAlert",
  "alertProfileDescription": "Any description",
  "watchBatteryLow": true,
  "watchEnterBrightEnvironment": true,
  "watchEnterDarkEnvironment": true,
  "watchMovementStart": true,
  "watchMovementStop": true,
  "lowerTemperatureLimit": 0.0,
  "upperTemperatureLimit": 5.0,
  "temperatureIssues": [
    {
      "id": 11749,
      "type": "CriticalHot",
      "temperature": 18.0,
      "timeOutMinutes": 0,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11750,
      "type": "CriticalHot",
      "temperature": 17.0,
      "timeOutMinutes": 1,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11751,
      "type": "CriticalCold",
      "temperature": -12.0,
      "timeOutMinutes": 0,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11752,
      "type": "CriticalCold",
      "temperature": -11.0,
      "timeOutMinutes": 1,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11753,
      "type": "Hot",
      "temperature": 6.0,
      "timeOutMinutes": 0,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11754,
      "type": "Hot",
      "temperature": 7.0,
      "timeOutMinutes": 2,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11755,
      "type": "Cold",
      "temperature": -7.0,
      "timeOutMinutes": 40,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": null
    },
    {
      "id": 11756,
      "type": "Cold",
      "temperature": -5.0,
      "timeOutMinutes": 55,
      "cumulativeFlag": true,
      "maxRateMinutes": null,
      "correctiveActions": {
        "listId": 325,
        "listName": "JUnit actions",
        "description": null,
        "actions": [
          {
            "action": "First action",
            "requestVerification": true
          },
          {
            "action": "Second action",
            "requestVerification": true
          }
        ]
    }
  ],
  "lightOnCorrectiveActions": {
    "listId": 309,
    "listName": "JUnit actions",
    "description": null,
    "actions": [
      {
        "action": "First action",
        "requestVerification": true
      },
      {
        "action": "Second action",
        "requestVerification": true
      }
    ]
  },
  "batteryLowCorrectiveActions": {
    "listId": 310,
    "listName": "JUnit actions",
    "description": null,
    "actions": [
      {
        "action": "First action",
        "requestVerification": true
      },
      {
        "action": "Second action",
        "requestVerification": true
      }
    ]
  }
}
```
**Response:** 
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "alertProfileId": 6
  }
}
```
### Get Alert Profile example ###
**GET /vf/rest/getAlertProfile/${accessToken}?alertProfileId=2156**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "alertProfileId": 2156,
    "alertProfileName": "AnyAlert",
    "alertProfileDescription": "Any description",
    "watchBatteryLow": true,
    "watchEnterBrightEnvironment": true,
    "watchEnterDarkEnvironment": true,
    "watchMovementStart": true,
    "watchMovementStop": true,
    "lowerTemperatureLimit": 0.0,
    "upperTemperatureLimit": 5.0,
    "temperatureIssues": [
      {
        "id": 11841,
        "type": "CriticalHot",
        "temperature": 18.0,
        "timeOutMinutes": 0,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11842,
        "type": "CriticalHot",
        "temperature": 17.0,
        "timeOutMinutes": 1,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11843,
        "type": "CriticalCold",
        "temperature": -12.0,
        "timeOutMinutes": 0,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11844,
        "type": "CriticalCold",
        "temperature": -11.0,
        "timeOutMinutes": 1,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11845,
        "type": "Hot",
        "temperature": 6.0,
        "timeOutMinutes": 0,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11846,
        "type": "Hot",
        "temperature": 7.0,
        "timeOutMinutes": 2,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11847,
        "type": "Cold",
        "temperature": -7.0,
        "timeOutMinutes": 40,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": null
      },
      {
        "id": 11848,
        "type": "Cold",
        "temperature": -5.0,
        "timeOutMinutes": 55,
        "cumulativeFlag": true,
        "maxRateMinutes": null,
        "correctiveActions": {
          "listId": 332,
          "listName": "JUnit actions",
          "description": null,
          "actions": [
            {
              "action": "First action",
              "requestVerification": true
            },
            {
              "action": "Second action",
              "requestVerification": true
            }
          ]
        }
      }
    ],
    "lightOnCorrectiveActions": {
      "listId": 317,
      "listName": "JUnit actions",
      "description": null,
      "actions": [
        {
          "action": "First action",
          "requestVerification": true
        },
        {
          "action": "Second action",
          "requestVerification": true
        }
      ]
    },
    "batteryLowCorrectiveActions": {
      "listId": 318,
      "listName": "JUnit actions",
      "description": null,
      "actions": [
        {
          "action": "First action",
          "requestVerification": true
        },
        {
          "action": "Second action",
          "requestVerification": true
        }
      ]
    }
  }
}
```
### Get Alert Profiles example ###
**GET /vf/rest/getAlertProfiles/${accessToken}?so=desc&pageSize=10000&sc=alertProfileDescription&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "alertProfileId": 846,
      "alertProfileName": "b",
      "alertProfileDescription": "c",
      "alertRuleList": [
        ">18,0°C for 0 min in total",
        ">17,0°C for 1 min in total",
        "<-12,0°C for 0 min in total",
        "<-11,0°C for 1 min in total",
        ">6,0°C for 0 min in total",
        ">7,0°C for 2 min in total",
        "<-7,0°C for 40 min in total",
        "<-5,0°C for 55 min in total"
      ]
    },
    {
      "alertProfileId": 847,
      "alertProfileName": "a",
      "alertProfileDescription": "b",
      "alertRuleList": [
        ">18,0°C for 0 min in total",
        ">17,0°C for 1 min in total",
        "<-12,0°C for 0 min in total",
        "<-11,0°C for 1 min in total",
        ">6,0°C for 0 min in total",
        ">7,0°C for 2 min in total",
        "<-7,0°C for 40 min in total",
        "<-5,0°C for 55 min in total"
      ]
    },
    {
      "alertProfileId": 848,
      "alertProfileName": "c",
      "alertProfileDescription": "a",
      "alertRuleList": [
        ">18,0°C for 0 min in total",
        ">17,0°C for 1 min in total",
        "<-12,0°C for 0 min in total",
        "<-11,0°C for 1 min in total",
        ">6,0°C for 0 min in total",
        ">7,0°C for 2 min in total",
        "<-7,0°C for 40 min in total",
        "<-5,0°C for 55 min in total"
      ]
    }
  ],
  "totalCount": 3
}
```
### Delete Alert Profile example ###
**GET vf/rest/deleteAlertProfile/${accessToken}?alertProfileId=4**  
**Response:**
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```

### Save Notification Schedule example ###
**POST /vf/rest/saveNotificationSchedule/${accessToken}**  
**Request body:**  
```json
{
  "notificationScheduleDescription": "JUnit schedule",
  "notificationScheduleName": "Sched",
  "schedules": [
    {
      "userId": 732,
      "sendApp": true,
      "sendEmail": false,
      "sendSms": false,
      "fromTime": "13:20",
      "toTime": "20:00",
      "weekDays": [
        true,
        false,
        false,
        true,
        false,
        false,
        false
      ]
    },
    {
      "userId": 732,
      "sendApp": true,
      "sendEmail": false,
      "sendSms": false,
      "fromTime": "13:20",
      "toTime": "20:00",
      "weekDays": [
        true,
        false,
        false,
        true,
        false,
        false,
        false
      ]
    }
  ]
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "notificationScheduleId": 2
  }
}
```  
### Get Notification Schedules example ###
**GET /vf/rest/getNotificationSchedules/${accessToken}?so=desc&pageSize=10000&sc=notificationScheduleDescription&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "notificationScheduleId": 423,
      "notificationScheduleName": "Sched",
      "notificationScheduleDescription": "JUnit schedule",
      "peopleToNotify": "Alexander Suvorov, Alexander Suvorov"
    },
    {
      "notificationScheduleId": 424,
      "notificationScheduleName": "Sched",
      "notificationScheduleDescription": "JUnit schedule",
      "peopleToNotify": "Mikhael Kutuzov, Mikhael Kutuzov"
    }
  ],
  "totalCount": 2
}
```  
### Get Notification Schedule example ###
**GET /vf/rest/getNotificationSchedule/${accessToken}?notificationScheduleId=77**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "notificationScheduleDescription": "JUnit schedule",
    "notificationScheduleId": 425,
    "notificationScheduleName": "Sched",
    "schedules": [
      {
        "personScheduleId": 696,
        "userId": 738,
        "sendApp": true,
        "sendEmail": false,
        "sendSms": false,
        "fromTime": "13:20",
        "toTime": "20:00",
        "weekDays": [
          true,
          false,
          false,
          true,
          false,
          false,
          false
        ]
      },
      {
        "personScheduleId": 697,
        "userId": 738,
        "sendApp": true,
        "sendEmail": false,
        "sendSms": false,
        "fromTime": "13:20",
        "toTime": "20:00",
        "weekDays": [
          true,
          false,
          false,
          true,
          false,
          false,
          false
        ]
      }
    ]
  }
}
```
### Save Location example ###
**POST vf/rest/saveLocation/${accessToken}**  
**Request body:**  
```json
{
  "locationName": "Loc-1",
  "companyName": "Sun Microsystems",
  "notes": "Any notes",
  "address": "Bankstown Warehouse",
  "location": {
    "lat": 100.5,
    "lon": 100.501
  },
  "radiusMeters": 1000,
  "startFlag": "Y",
  "interimFlag": "Y",
  "endFlag": "Y"
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "locationId": 2
  }
}
```
### Get Locations example ###
**GET /vf/rest/getLocations/${accessToken}?so=desc&pageSize=10000&sc=notes&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "locationId": 2,
      "locationName": "Loc-1",
      "companyName": "Sun Microsystems",
      "notes": "Any notes",
      "address": "Bankstown Warehouse",
      "location": {
        "lat": 100.5,
        "lon": 100.501
      },
      "radiusMeters": 1000,
      "startFlag": "Y",
      "interimFlag": "Y",
      "endFlag": "Y"
    }
  ],
  "totalCount": 1
}
```  
### Save Shipment Template example ###
**POST /vf/rest/saveShipmentTemplate/${accessToken}**  
**Request body:**  
```json
{
  "shipmentTemplateName": "JUnit-tpl",
  "shipmentDescription": "Any Description",
  "addDateShipped": true,
  "shippedFrom": 449,
  "shippedTo": 450,
  "detectLocationForShippedFrom": true,
  "alertProfileId": 273,
  "alertSuppressionMinutes": 55,
  "alertsNotificationSchedules": [
    431
  ],
  "commentsForReceiver": "Comments for receiver",
  "arrivalNotificationWithinKm": 11,
  "excludeNotificationsIfNoAlerts": true,
  "arrivalNotificationSchedules": [
    432
  ],
  "shutdownDeviceAfterMinutes": 155,
  "noAlertsAfterArrivalMinutes": null,
  "shutDownAfterStartMinutes": null,
  "sendArrivalReport": true,
  "arrivalReportOnlyIfAlerts": false,
  "interimLocations": [
    5296,
    5297
  ],
  "userAccess": [
    2113,
    2114
  ],
  "companyAccess": [
    1306,
    1307
  ]
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentTemplateId": 48
  }
}
``` 
### Get Shipment Templates example ###
**GET /vf/rest/getShipmentTemplates/${accessToken}?pageSize=1&pageIndex=3**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "shipmentTemplateId": 368,
      "shipmentTemplateName": "JUnit-tpl",
      "shipmentDescription": "Any Description",
      "shippedFrom": 451,
      "shippedFromLocationName": "Loc-3",
      "shippedTo": 452,
      "shippedToLocationName": "Loc-4",
      "alertProfile": 274,
      "alertProfileName": "AnyAlert"
    },
    {
      "shipmentTemplateId": 369,
      "shipmentTemplateName": "JUnit-tpl",
      "shipmentDescription": "Any Description",
      "shippedFrom": 453,
      "shippedFromLocationName": "Loc-7",
      "shippedTo": 454,
      "shippedToLocationName": "Loc-8",
      "alertProfile": 275,
      "alertProfileName": "AnyAlert"
    }
  ],
  "totalCount": 2
}
```
### Delete Shipment Template example ###
**GET /vf/rest/deleteShipmentTemplate/${accessToken}?shipmentTemplateId=78**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Save Shipment example ###
**POST  /vf/rest/saveShipment/${accessToken}**  
**Request body:**  
```json
{
  "saveAsNewTemplate": true,
  "includePreviousData": true,
  "templateName": "NewTemplate.tpl",
  "interimLocations": [
    1599,
    1600
  ],
  "shipment": {
    "status": "InProgress",
    "deviceImei": "234908720394857",
    "deviceSN": "039485",
    "deviceName": "Device Name",
    "tripCount": 1,
    "shipmentDescription": "Any Description",
    "palletId": "palettid",
    "poNum": 893793487,
    "assetNum": "10515",
    "assetType": "SeaContainer",
    "shippedFrom": 499,
    "shippedTo": 500,
    "shipmentDate": "2015-11-12T22:24",
    "arrivalTime": "2016-02-16T20:29",
    "alertProfileId": 300,
    "alertSuppressionMinutes": 55,
    "alertsNotificationSchedules": [
      489
    ],
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationWithinKm": 111,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalNotificationSchedules": [
      490
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
    "customFields": {
      "field1": "value1"
    },
    "endLocationAlternatives": [
      2795
    ],
    "interimLocations": [
      4735,
      4736
    ],
    "interimStops": [ // not mandatory field. If not presented in request then not will changed in given shipment
      980
    ],
    "userAccess": [
      2038,
      2039
    ],
    "companyAccess": [
      1281,
      1282
    ]
  }
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentId": 11,
    "templateId": 12
  }
}
```
### Get Shipments example ###
**POST /vf/rest/getShipments/${accessToken}**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "status": "InProgress",
      "deviceSN": "039485",
      "deviceName": "Device Name",
      "tripCount": 1,
      "shipmentId": 4341,
      "shipmentDescription": "Any Description",
      "shipmentDate": "22:06 12 May 2016",
      "shipmentDateISO": "2016-05-12 22:06",
      "palletId": "palettid",
      "assetNum": "10515",
      "assetType": "SeaContainer",
      "shippedFrom": "Loc-3",
      "shippedTo": "Loc-4",
      "estArrivalDate": "22:08 12 May 2016",
      "estArrivalDateISO": "2016-05-12 22:08",
      "actualArrivalDate": null,
      "actualArrivalDateISO": null,
      "percentageComplete": 100,
      "alertProfileId": 2183,
      "alertProfileName": "AnyAlert",
      "alertSummary": {
        "MovementStart": "4",
        "LightOff": "1",
        "Cold": "1",
        "CriticalCold": "3",
        "LightOn": "1",
        "CriticalHot": "1",
        "Battery": "2",
        "Hot": "2"
      },
      "siblingCount": 0,
      "lastReadingTime": "11:53 24 May 2016",
      "lastReadingTimeISO": "2016-05-24 11:53",
      "lastReadingTemperature": 56.0,
      "lastReadingBattery": 1234,
      "lastReadingLat": 50.5,
      "lastReadingLong": 51.51,
      "firstReadingLat": 50.5,
      "firstReadingLong": 51.51,
      "firstReadingTime": "11:53 24 May 2016",
      "firstReadingTimeISO": "2016-05-24 11:53",
      "keyLocations": [
        {
          "key": "firstReading",
          "lat": 50.5,
          "lon": 51.51,
          "desc": null,
          "time": "11:53 24 May 2016"
        },
        {
          "key": "shippedFrom",
          "lat": 100.5,
          "lon": 100.501,
          "desc": "Loc-3",
          "time": "11:53 24 May 2016"
        },
        {
          "key": "shippedTo",
          "lat": 100.5,
          "lon": 100.501,
          "desc": "Loc-4",
          "time": "11:53 24 May 2016"
        },
        {
          "key": "lastReading",
          "lat": 50.5,
          "lon": 51.51,
          "desc": null,
          "time": "11:53 24 May 2016"
        }
      ],
      "shippedFromLat": 100.5,
      "shippedFromLong": 100.501,
      "shippedToLat": 100.5,
      "shippedToLong": 100.501,
      "sendArrivalReport": true,
      "arrivalReportOnlyIfAlerts": false
    },
    {
      "status": "Arrived",
      "deviceSN": "039485",
      "deviceName": "Device Name",
      "tripCount": 1,
      "shipmentId": 4342,
      "shipmentDescription": "Any Description",
      "shipmentDate": "22:07 12 May 2016",
      "shipmentDateISO": "2016-05-12 22:07",
      "palletId": "palettid",
      "assetNum": "10515",
      "assetType": "SeaContainer",
      "shippedFrom": "Loc-7",
      "shippedTo": "Loc-8",
      "estArrivalDate": null,
      "estArrivalDateISO": null,
      "actualArrivalDate": "11:37 24 May 2016",
      "actualArrivalDateISO": "2016-05-24 11:37",
      "percentageComplete": 100,
      "alertProfileId": 2184,
      "alertProfileName": "AnyAlert",
      "alertSummary": {},
      "siblingCount": 0,
      "lastReadingTime": null,
      "lastReadingTimeISO": null,
      "lastReadingTemperature": null,
      "lastReadingBattery": null,
      "lastReadingLat": null,
      "lastReadingLong": null,
      "firstReadingLat": null,
      "firstReadingLong": null,
      "firstReadingTime": null,
      "firstReadingTimeISO": null,
      "keyLocations": null,
      "shippedFromLat": 100.5,
      "shippedFromLong": 100.501,
      "shippedToLat": 100.5,
      "shippedToLong": 100.501,
      "sendArrivalReport": true,
      "arrivalReportOnlyIfAlerts": false
    }
  ],
  "totalCount": 2
}
```
### Get Shipments Nearby example ###
**GET /vf/lite/getShipmentsNearby/${accessToken}?lat=20.0&lon=20.0&radius=500&from=2017-04-08T16-05-48**  
**Response:**
```json  
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "status": "InProgress",
      "deviceSN": "39485",
      "deviceName": "Device Name",
      "tripCount": 1,
      "shipmentId": 1230,
      "shipmentDescription": "Any Description",
      "shipmentDate": "4:32 29 Mar 2017",
      "shipmentDateISO": "2017-03-29 04:32",
      "palletId": "palettid",
      "assetNum": "10515",
      "assetType": "SeaContainer",
      "shippedFrom": "Loc-3",
      "shippedTo": "Loc-4",
      "estArrivalDate": null,
      "estArrivalDateISO": null,
      "actualArrivalDate": null,
      "actualArrivalDateISO": null,
      "percentageComplete": 0,
      "alertProfileId": 606,
      "alertProfileName": "AnyAlert",
      "alertSummary": {},
      "siblingCount": 0,
      "lastReadingTime": "18:19 9 Apr 2017",
      "lastReadingTimeISO": "2017-04-09 18:19",
      "lastReadingTemperature": 2.0,
      "lastReadingBattery": 1234,
      "lastReadingLat": 20.0,
      "lastReadingLong": 20.0,
      "firstReadingLat": 10.0,
      "firstReadingLong": 10.0,
      "firstReadingTime": "15:32 9 Apr 2017",
      "firstReadingTimeISO": "2017-04-09 15:32",
      "keyLocations": [
        {
          "key": "firstReading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:32 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:32 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "reading",
          "lat": 10.0,
          "lon": 10.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "shippedFrom",
          "lat": 100.5,
          "lon": 100.501,
          "desc": "Loc-3",
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "shippedTo",
          "lat": 100.5,
          "lon": 100.501,
          "desc": "Loc-4",
          "time": "15:33 9 Apr 2017"
        },
        {
          "key": "lastReading",
          "lat": 20.0,
          "lon": 20.0,
          "desc": null,
          "time": "15:33 9 Apr 2017"
        }
      ],
      "shippedFromLat": 100.5,
      "shippedFromLong": 100.501,
      "shippedToLat": 100.5,
      "shippedToLong": 100.501,
      "sendArrivalReport": true,
      "arrivalReportOnlyIfAlerts": false
    }
  ],
  "totalCount": 1
}
```
### Delete Shipment example ###
**GET /vf/rest/deleteShipment/${accessToken}?shipmentId=110**  
** Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Suppress alerts example ###
**GET /vf/rest/suppressAlerts/${accessToken}?shipmentId=15559**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Save Device example ###
**POST /vf/rest/saveDevice/${accessToken}**  
**Request body:**  
```json
{
  "description": "Device description",
  "imei": "0239487043987",
  "name": "Device Name",
  "active": true,
  "color": "Crimson",
  "autostartTemplateId": null
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```  
### Shutdown Device example ###
** GET /vf/rest/shutdownDevice/${accessToken}?shipmentId=8170**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```  
### Get Devices example ###
**GET /vf/rest/getDevices/${accessToken}?pageSize=10000&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "description": "Device description",
      "imei": "1111111111111",
      "name": "Device Name",
      "sn": "111111",
      "active": true,
      "color": "Crimson",
      "autostartTemplateId": null,
      "autostartTemplateName": null,
      "lastShipmentId": null,
      "lastReadingTimeISO": null,
      "lastReadingTime": null,
      "lastReadingTemperature": null,
      "lastReadingBattery": null,
      "lastReadingLat": null,
      "lastReadingLong": null,
      "shipmentNumber": null,
      "shipmentStatus": null
    },
    {
      "description": "Device description",
      "imei": "2222222222222",
      "name": "Device Name",
      "sn": "222222",
      "active": true,
      "autostartTemplateId": null,
      "autostartTemplateName": null,
      "lastShipmentId": null,
      "lastReadingTimeISO": null,
      "lastReadingTime": null,
      "lastReadingTemperature": null,
      "lastReadingBattery": null,
      "lastReadingLat": null,
      "lastReadingLong": null,
      "shipmentNumber": null,
      "shipmentStatus": null
    },
    {
      "description": "Device description",
      "imei": "3333333333333",
      "name": "Device Name",
      "sn": "333333",
      "active": true,
      "autostartTemplateId": 910,
      "autostartTemplateName": "TPL1",
      "lastShipmentId": 5711,
      "lastReadingTimeISO": "2016-03-09 15:06",
      "lastReadingTime": "3:06PM 9 Mar 2016",
      "lastReadingTemperature": "23.5°C",
      "lastReadingBattery": 27,
      "lastReadingLat": 12.34,
      "lastReadingLong": 56.78,
      "shipmentNumber": "333333(0)",
      "shipmentStatus": "InProgress"
    },
    {
      "description": "Device description",
      "imei": "4444444444444",
      "name": "Device Name",
      "sn": "444444",
      "active": true,
      "autostartTemplateId": null,
      "autostartTemplateName": null,
      "lastShipmentId": null,
      "lastReadingTimeISO": "2016-03-09 15:06",
      "lastReadingTime": "3:06PM 9 Mar 2016",
      "lastReadingTemperature": "11.0°C",
      "lastReadingBattery": 27,
      "lastReadingLat": 12.34,
      "lastReadingLong": 56.78,
      "shipmentNumber": null,
      "shipmentStatus": null
    }
  ],
  "totalCount": 4
}
```
### Save Device Group example ###
**POST /vf/rest/saveDeviceGroup/${accessToken}**  
**Request:**  
```json
{
  "name": "JUnit",
  "description": "JUnit device group"
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Move Device example ###
**GET /vf/rest/moveDevice/${accessToken}?company=28453&device=0239870932487**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "deviceImei": "28452_0239870932487"
  }
}
```
### Get Device Group example ###
**GET /vf/rest/getDeviceGroup/${accessToken}?name=G1**  
**GET /vf/rest/getDeviceGroup/${accessToken}?id=223**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "name": "G1",
    "description": "JUnit device group"
  }
}
```
### Get Device Groups example ###
**/vf/rest/getDeviceGroups/${accessToken}?so=desc&pageSize=100&sc=name&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 23,
      "name": "3",
      "description": "1"
    },
    {
      "id": 25,
      "name": "2",
      "description": "3"
    },
    {
      "id": 24,
      "name": "1",
      "description": "2"
    }
  ],
  "totalCount": 3
}
```
### Delete Device Group example ###
**GET /vf/rest/deleteDeviceGroup/${accessToken}?name=G1**  
**GET /vf/rest/deleteDeviceGroup/${accessToken}?id=267**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Add Device to Group example ###
**GET /vf/rest/addDeviceToGroup/${accessToken}?groupName=JUnit&device=0238947023987**  
**GET /vf/rest/addDeviceToGroup/${accessToken}?groupId=238&device=0238947023987**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Remove Device from Group example ###
**GET /vf/rest/removeDeviceFromGroup/${accessToken}?groupName=JUnit&device=0238947023987**  
**GET /vf/rest/removeDeviceFromGroup/${accessToken}?groupId=294&device=2938799889897**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Get Devices of Group example ###
**GET /vf/rest/getDevicesOfGroup/${accessToken}?groupName=JUnit**  
**GET /vf/rest/getDevicesOfGroup/${accessToken}?groupId=252**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "description": "Device description",
      "imei": "0238947023987",
      "name": "Device Name",
      "sn": "023987"
    },
    {
      "description": "Device description",
      "imei": "2398472903879",
      "name": "Device Name",
      "sn": "903879"
    }
  ],
  "totalCount": 2
}
```
### Get Groups of Device example ###
**GET /vf/rest/getGroupsOfDevice/${accessToken}?device=0238947023987**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "name": "JUnit-1",
      "description": "JUnit device group"
    },
    {
      "name": "JUnit-2",
      "description": "JUnit device group"
    }
  ],
  "totalCount": 2
}
```
### Get Notifications example ###
**GET  /vf/rest/getNotifications/${accessToken}?includeRead=true&shipment=11&pageSize=1&pageIndex=3**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "notificationId": 26,
      "closed": false,
      "date": "2016-02-02T18:34",
      "type": "Alert",
      "alertType": "Hot",
      "alertId": 96,
      "shipmentId": 164,
      "title": "Hot Alert",
      "Line1": "Tracker 039485(1) went above 5.0°C for 55min",
      "Line2": "Some long shipment description here",
      "Line3": "About 200km from XYZ Warehouse"
    },
    {
      "notificationId": 27,
      "closed": false,
      "date": "2016-02-02T18:34",
      "type": "Alert",
      "alertType": "Battery",
      "alertId": 97,
      "shipmentId": 164,
      "title": "Battery Alert",
      "Line1": "Low battery at 16:34",
      "Line2": "Some long shipment description here",
      "Line3": "About 200km from XYZ Warehouse"
    },
    {
      "notificationId": 28,
      "closed": false,
      "date": "2016-02-02T18:34",
      "type": "Arrival",
      "alertType": null,
      "alertId": 35,
      "shipmentId": 164,
      "title": "Arrival",
      "Line1": "Tracker 039485(1) is in 1500 meters for arrival",
      "Line2": "Some long shipment description here",
      "Line3": "About 200km from XYZ Warehouse"
    }
  ],
  "totalCount": 3
}
```
### Mark Notification as read example ###
**POST /vf/rest/markNotificationsAsRead/${accessToken}**  
**Request body:**  
```json
[ //array of notification ID
  31,
  33
]
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Send Command to Device example ###
**POST /vf/rest/sendCommandToDevice/${accessToken}**  
**Request body:**  
```json
{
  "device": "089723409857032498",
  "command": "shutdown"
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Get Location example ###
**GET /vf/rest/getLocation/${accessToken}?locationId=2**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "locationId": 2,
    "locationName": "Loc-1",
    "companyName": "Sun Microsystems",
    "notes": "Any notes",
    "address": "Bankstown Warehouse",
    "location": {
      "lat": 100.5,
      "lon": 100.501
    },
    "radiusMeters": 1000,
    "startFlag": "Y",
    "interimFlag": "Y",
    "endFlag": "Y"
  }
}
```
### Delete Location example ###
**GET /vf/rest/deleteLocation/${accessToken}?locationId=2**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Get Shipment Template example ###
**GET /rest/getShipmentTemplate/${accessToken}?id=88**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentTemplateId": 374,
    "shipmentTemplateName": "JUnit-tpl",
    "shipmentDescription": "Any Description",
    "addDateShipped": true,
    "shippedFrom": 463,
    "shippedTo": 464,
    "detectLocationForShippedFrom": true,
    "alertProfileId": 280,
    "alertSuppressionMinutes": 55,
    "alertsNotificationSchedules": [
      445
    ],
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationWithinKm": 11,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalNotificationSchedules": [
      446
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
    "interimLocations": [
      5296,
      5297
    ],
    "userAccess": [
      2154,
      2155
    ],
    "companyAccess": [
      1321,
      1322
    ]
  }
}
```
### Get Device example ###
**GET /vf/rest/getDevice/${accessToken}?id=0239487043987**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "description": "Device description",
    "imei": "0239487043987",
    "name": "Device Name",
    "sn": "704398",
    "color": "Crimson",
    "active": true,
    "autostartTemplateId": null,
    "autostartTemplateName": null,
    "lastShipmentId": 6532,
    "lastReadingTimeISO": "2016-03-10 11:06",
    "lastReadingTime": "11:06AM 10 Mar 2016",
    "lastReadingTemperature": "23.5°C",
    "lastReadingBattery": 27,
    "lastReadingLat": 12.34,
    "lastReadingLong": 56.78,
    "shipmentNumber": "704398(0)",
    "shipmentStatus": "InProgress"
  }
}
```
### Get Shipment example ###
**GET /vf/rest/getShipment/${accessToken}?id=77**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "status": "InProgress",
    "deviceImei": "234908720394857",
    "deviceSN": "394857",
    "deviceName": "Device Name",
    "tripCount": 1,
    "shipmentId": 401,
    "shipmentDescription": "Any Description",
    "palletId": "palettid",
    "poNum": 893793487,
    "assetNum": "10515",
    "assetType": "SeaContainer",
    "shippedFrom": 503,
    "shippedTo": 504,
    "shipmentDate": "2015-11-12T22:24",
    "arrivalTime": "2016-02-16T20:29",
    "alertProfileId": 302,
    "alertSuppressionMinutes": 55,
    "alertsNotificationSchedules": [
      493
    ],
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationWithinKm": 111,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalNotificationSchedules": [
      494
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "customFields": {
      "field1": "value1"
    },
    "endLocationAlternatives": [
      2795
    ],
    "interimLocations": [
      4735,
      4736
    ],
    "interimStops": [],
    "userAccess": [
      2033,
      2034
    ],
    "companyAccess": [
      1278,
      1279
    ]
  }
}
```
### Delete Notification Schedule example ###
**GET vf/rest/deleteNotificationSchedule/${accessToken}?notificationScheduleId=23**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Delete Person Schedule example ###
**GET /vf/rest/deletePersonSchedule/${accessToken}?notificationScheduleId=1&personScheduleId=3**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  }
}
```
### Get Single Shipment example ###
**GET /vf/rest/getSingleShipment/${accessToken}?shipmentId=9088**  
**GET /vf/rest/getSingleShipment/${accessToken}?shipmentId=sn=11&trip=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentId": 9088,
    "deviceSN": "000011",
    "deviceColor": "Crimson",
    "deviceName": "Device Name",
    "tripCount": 1,
    "shipmentDescription": "Any Description",
    "palletId": "palettid",
    "assetNum": "10515",
    "assetType": "SeaContainer",
    "status": "InProgress",
    "isLatestShipment": true,
    "trackerPositionFrontPercent": 0,
    "trackerPositionLeftPercent": 100,
    "alertProfileId": 3985,
    "alertProfileName": "AnyAlert",
    "alertSuppressionMinutes": 55,
    "alertPeopleToNotify": "Alexander Suvorov, Alexander Suvorov",
    "alertsNotificationSchedules": [
      {
        "notificationScheduleId": 6388,
        "notificationScheduleName": "Sched"
      }
    ],
    "alertSummary": [
      "Hot",
      "Battery"
    ],
    "alertYetToFire": "<-11.0°C for 1 min in total, >6.0°C for 0 min in total, >7.0°C for 2 min in total, <-7.0°C for 40 min in total, <-5.0°C for 55 min in total",
    "alertFired": ">18.0°C for 0 min in total, >17.0°C for 1 min in total, <-12.0°C for 0 min in total",
    "arrivalNotificationTimeISO": "2016-03-12 18:26",
    "arrivalNotificationWithinKm": 111,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalPeopleToNotify": "Mikhael Kutuzov, Mikhael Kutuzov",
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationSchedules": [
      {
        "notificationScheduleId": 6389,
        "notificationScheduleName": "Sched"
      }
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "shutdownTimeISO": null,
    "startLocation": "Loc-3",
    "startTimeISO": "2016-03-01 04:40",
    "startLocationForMap": {
      "latitude": 100.5,
      "longitude": 100.501
    },
    "endLocation": "Loc-4",
    "etaISO": null,
    "arrivalTimeISO": null,
    "endLocationForMap": {
      "latitude": 100.5,
      "longitude": 100.501
    },
    "lastReadingLocation": "Bankstown Warehouse",
    "lastReadingTimeISO": "2016-03-12 18:27",
    "lastReadingTemperature": 56.0,
    "batteryLevel": 1234,
    "lastReadingForMap": null,
    "minTemp": 56.0,
    "maxTemp": 56.0,
    "firstReadingTimeISO": "2016-03-12 18:27",
    "firstReadingTime": "6:27PM 12 Mar 2016",
    "alertsSuppressed": true,
    "alertsSuppressionTime": "11:34AM 7 Apr 2016",
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
    "arrivalReportSent": false,
    "locations": [
      {
        "lat": 50.5,
        "long": 51.51,
        "temperature": 56.0,
        "timeISO": "2016-03-29 09:15",
        "time": "21:05 16 Apr 2016",
        "type": "Reading",
        "alerts": [
          {
            "title": "Low Battery Alert for Tracker 39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "Battery"
          },
          {
            "title": "Hot Alert for Tracker 39485(1)",
            "Line1": "Above 5.0°C for more than 55 mins",
            "Line2": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "Hot"
          },
          {
            "title": "Arrival Alert for Tracker 39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "ArrivalNotice"
          }
        ]
      },
      {
        "lat": 50.5,
        "long": 51.51,
        "temperature": 56.0,
        "timeISO": "2016-03-29 09:15",
        "time": "21:05 16 Apr 2016",
        "type": "Reading",
        "alerts": [
          {
            "title": "Last reading for Tracker #39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "LastReading"
          }
        ]
      }
    ],
    "startLocationAlternatives": [
      {
        "locationId": 11288,
        "locationName": "L1",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 11289,
        "locationName": "L2",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "endLocationAlternatives": [
      {
        "locationId": 11290,
        "locationName": "L3",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 11291,
        "locationName": "L4",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "interimLocations": [
      {
        "locationId": 4617,
        "locationName": "L5",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 4618,
        "locationName": "L6",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "interimStops": [
      {
        "id": 16,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "stopDate": "21:41 16 Apr 2016",
        "stopDateISO": "2016-04-16 21:41",
        "location": {
          "locationId": 12220,
          "locationName": "Loc-5",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      },
      {
        "id": 17,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "date": "2016-03-26T17:05",
        "location": {
          "locationId": 12221,
          "locationName": "Loc-6",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      },
      {
        "id": 18,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "date": "2016-03-26T17:05",
        "location": {
          "locationId": 12222,
          "locationName": "Loc-7",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      }
    ],
    "notes": [
      {
        "activeFlag": true,
        "createdBy": "a@b.c",
        "creationDate": "2016-03-31 16:16",
        "noteNum": 1,
        "noteText": "Note 1",
        "shipmentId": 9088,
        "noteType": "Simple",
        "sn": "11",
        "trip": 1,
        "timeOnChart": "2016-03-31 16:16",
        "createdByName": "Yury G"
      },
      {
        "activeFlag": true,
        "createdBy": "a@b.c",
        "creationDate": "2016-03-31 16:16",
        "noteNum": 2,
        "noteText": "Note 2",
        "shipmentId": 9088,
        "noteType": "Simple",
        "sn": "11",
        "trip": 1,
        "timeOnChart": "2016-03-31 16:16",
        "createdByName": "Yury G"
      }
    ],
    "deviceGroups": [
      {
        "groupId": 299,
        "name": "GR1",
        "description": "Description of group GR1"
      },
      {
        "groupId": 300,
        "name": "GR2",
        "description": "Description of group GR2"
      }
    ],
    "siblings": [],
    "userAccess": [
      {
        "userId": 2341,
        "email": "asuvorov-5@mail.ru"
      },
      {
        "userId": 2342,
        "email": "mkutuzov-6@mail.ru"
      }
    ],
    "companyAccess": [
      {
        "companyId": 1372,
        "companyName": "C1"
      },
      {
        "companyId": 1373,
        "companyName": "C2"
      }
    ],
    "alertsWithCorrectiveActions": [
      {
        "id": 1063,
        "description": "battery low",
        "time": "13:03 18 Jul 2017",
        "timeISO": "2017-07-18 13:03",
        "correctiveActionListId": null,
        "type": "Battery"
      },
      {
        "id": 1064,
        "description": "entering bright environment",
        "time": "13:03 18 Jul 2017",
        "timeISO": "2017-07-18 13:03",
        "correctiveActionListId": null,
        "type": "LightOn"
      },
      {
        "id": 1066,
        "description": ">18.0°C for 0 min in total",
        "time": "16:50 19 Jul 2017",
        "timeISO": "2017-07-19 16:50",
        "correctiveActionListId": 222,
        "type": "CriticalHot"
      },
      {
        "id": 1067,
        "description": ">17.0°C for 1 min in total",
        "time": "16:50 19 Jul 2017",
        "timeISO": "2017-07-19 16:50",
        "correctiveActionListId": 222,
        "type": "CriticalHot"
      }
    ]
  }
}
```
### Get Single Shipment Lite example ###
**GET /vf/rest/getSingleShipmentLite/${accessToken}?shipmentId=9088**  
**GET /vf/rest/getSingleShipmentLite/${accessToken}?shipmentId=sn=11&trip=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentId": 9088,
    "deviceSN": "000011",
    "deviceColor": "Crimson",
    "deviceName": "Device Name",
    "tripCount": 1,
    "shipmentDescription": "Any Description",
    "palletId": "palettid",
    "assetNum": "10515",
    "assetType": "SeaContainer",
    "status": "InProgress",
    "isLatestShipment": true,
    "trackerPositionFrontPercent": 0,
    "trackerPositionLeftPercent": 100,
    "alertProfileId": 3985,
    "alertProfileName": "AnyAlert",
    "alertSuppressionMinutes": 55,
    "alertPeopleToNotify": "Alexander Suvorov, Alexander Suvorov",
    "alertsNotificationSchedules": [
      {
        "notificationScheduleId": 6388,
        "notificationScheduleName": "Sched"
      }
    ],
    "alertSummary": [
      "Hot",
      "Battery"
    ],
    "alertYetToFire": "<-11.0°C for 1 min in total, >6.0°C for 0 min in total, >7.0°C for 2 min in total, <-7.0°C for 40 min in total, <-5.0°C for 55 min in total",
    "alertFired": ">18.0°C for 0 min in total, >17.0°C for 1 min in total, <-12.0°C for 0 min in total",
    "arrivalNotificationTimeISO": "2016-03-12 18:26",
    "arrivalNotificationWithinKm": 111,
    "excludeNotificationsIfNoAlerts": true,
    "arrivalPeopleToNotify": "Mikhael Kutuzov, Mikhael Kutuzov",
    "commentsForReceiver": "Comments for receiver",
    "arrivalNotificationSchedules": [
      {
        "notificationScheduleId": 6389,
        "notificationScheduleName": "Sched"
      }
    ],
    "shutdownDeviceAfterMinutes": 155,
    "noAlertsAfterArrivalMinutes": null,
    "shutDownAfterStartMinutes": null,
    "shutdownTimeISO": null,
    "startLocation": "Loc-3",
    "startTimeISO": "2016-03-01 04:40",
    "startLocationForMap": {
      "latitude": 100.5,
      "longitude": 100.501
    },
    "endLocation": "Loc-4",
    "etaISO": null,
    "arrivalTimeISO": null,
    "endLocationForMap": {
      "latitude": 100.5,
      "longitude": 100.501
    },
    "lastReadingLocation": "Bankstown Warehouse",
    "lastReadingTimeISO": "2016-03-12 18:27",
    "lastReadingTemperature": 56.0,
    "batteryLevel": 1234,
    "lastReadingForMap": null,
    "minTemp": 56.0,
    "maxTemp": 56.0,
    "firstReadingTimeISO": "2016-03-12 18:27",
    "firstReadingTime": "6:27PM 12 Mar 2016",
    "alertsSuppressed": true,
    "alertsSuppressionTime": "11:34AM 7 Apr 2016",
    "alertsSuppressionTimeIso": "2016-04-07 11:34",
    "sendArrivalReport": true,
    "arrivalReportOnlyIfAlerts": false,
    "locations": [
      {
        "lat": 50.5,
        "long": 51.51,
        "temperature": 56.0,
        "timeISO": "2016-03-29 09:15",
        "time": "21:05 16 Apr 2016",
        "type": "Reading",
        "alerts": [
          {
            "title": "Low Battery Alert for Tracker 39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "Battery"
          },
          {
            "title": "Hot Alert for Tracker 39485(1)",
            "Line1": "Above 5.0°C for more than 55 mins",
            "Line2": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "Hot"
          },
          {
            "title": "Arrival Alert for Tracker 39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "ArrivalNotice"
          }
        ]
      },
      {
        "lat": 50.5,
        "long": 51.51,
        "temperature": 56.0,
        "timeISO": "2016-03-29 09:15",
        "time": "21:05 16 Apr 2016",
        "type": "Reading",
        "alerts": [
          {
            "title": "Last reading for Tracker #39485(1)",
            "Line1": "56.0°C  |  9:15AM 29 Mar 2016",
            "type": "LastReading"
          }
        ]
      }
    ],
    "startLocationAlternatives": [
      {
        "locationId": 11288,
        "locationName": "L1",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 11289,
        "locationName": "L2",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "endLocationAlternatives": [
      {
        "locationId": 11290,
        "locationName": "L3",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 11291,
        "locationName": "L4",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "interimLocations": [
      {
        "locationId": 4617,
        "locationName": "L5",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      },
      {
        "locationId": 4618,
        "locationName": "L6",
        "companyName": "Sun Microsystems",
        "notes": "Any notes",
        "address": "",
        "location": {
          "lat": 100.5,
          "lon": 100.501
        },
        "radiusMeters": 1000,
        "startFlag": "Y",
        "interimFlag": "Y",
        "endFlag": "Y"
      }
    ],
    "interimStops": [
      {
        "id": 16,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "stopDate": "21:41 16 Apr 2016",
        "stopDateISO": "2016-04-16 21:41",
        "location": {
          "locationId": 12220,
          "locationName": "Loc-5",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      },
      {
        "id": 17,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "date": "2016-03-26T17:05",
        "location": {
          "locationId": 12221,
          "locationName": "Loc-6",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      },
      {
        "id": 18,
        "latitude": 1.0,
        "longitude": 2.0,
        "time": 15,
        "date": "2016-03-26T17:05",
        "location": {
          "locationId": 12222,
          "locationName": "Loc-7",
          "companyName": "Sun Microsystems",
          "notes": "Any notes",
          "address": "Bankstown Warehouse",
          "location": {
            "lat": 100.5,
            "lon": 100.501
          },
          "radiusMeters": 1000,
          "startFlag": "Y",
          "interimFlag": "Y",
          "endFlag": "Y"
        }
      }
    ],
    "notes": [
      {
        "activeFlag": true,
        "createdBy": "a@b.c",
        "creationDate": "2016-03-31 16:16",
        "noteNum": 1,
        "noteText": "Note 1",
        "shipmentId": 9088,
        "noteType": "Simple",
        "sn": "11",
        "trip": 1,
        "timeOnChart": "2016-03-31 16:16",
        "createdByName": "Yury G"
      },
      {
        "activeFlag": true,
        "createdBy": "a@b.c",
        "creationDate": "2016-03-31 16:16",
        "noteNum": 2,
        "noteText": "Note 2",
        "shipmentId": 9088,
        "noteType": "Simple",
        "sn": "11",
        "trip": 1,
        "timeOnChart": "2016-03-31 16:16",
        "createdByName": "Yury G"
      }
    ],
    "deviceGroups": [
      {
        "groupId": 299,
        "name": "GR1",
        "description": "Description of group GR1"
      },
      {
        "groupId": 300,
        "name": "GR2",
        "description": "Description of group GR2"
      }
    ],
    "siblings": []
  }
}
```
## Utility methods ##
### Get Languages ###
**GET /vf/rest/getLanguages/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    "English"
  ]
}
```
### Get Roles ###
**GET /vf/rest/getRoles/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    "GlobalAdmin",
    "CompanyAdmin",
    "Dispatcher",
    "ReportViewer"
  ]
}
```
### Get Colors ###
**GET /vf/rest/getColors/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    "Aqua",
    "Black",
    "Blue",
    "BlueViolet",
    "Brown",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkGreen",
    "DarkOrange",
    "Fuchsia",
    "Gold",
    "GoldenRod",
    "Gray",
    "Green",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Lime",
    "Magenta",
    "Maroon",
    "Navy",
    "Olive",
    "Orange",
    "OrangeRed",
    "PaleVioletRed",
    "Purple",
    "Red",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SlateBlue",
    "Tan",
    "Teal",
    "Tomato",
    "Turquoise",
    "Violet",
    "YellowGreen"
  ]
}
```
### Get Time Zones ###
**GET /vf/rest/getTimeZones/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": "UTC",
      "displayName": "Coordinated Universal Time",
      "offset": "GMT+0:00"
    },
    {
      "id": "America/Adak",
      "displayName": "Hawaii-Aleutian Standard Time",
      "offset": "GMT-10:00"
    },
    {
      "id": "America/Anchorage",
      "displayName": "Alaska Standard Time",
      "offset": "GMT-9:00"
    },
    {
      "id": "America/Los_Angeles",
      "displayName": "Pacific Standard Time",
      "offset": "GMT-8:00"
    },
    //etc
  ]
}
```
### Get User Time ###
**GET /vf/rest/getUserTime/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "dateTimeIso": "2015-12-09T14:10",
    "formattedDateTimeIso": "9-Dec-2015 2:10PM (UTC)",
    "dateTimeString": "9-Dec-2015 2:10PM",
    "dateString": "9-Dec-2015",
    "timeString": "2:10PM",
    "timeString24": "14:10",
    "timeZoneId": "UTC",
    "timeZoneString": "Coordinated Universal Time"
  }
}
```
### Get Measurement Units ###
**GET /vf/rest/getMeasurementUnits/${accessToken}**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    "Metric",
    "English"
  ]
}
```
### Save AutoStart Shipment example ###
**POST /rest/saveAutoStartShipment/${accessToken}**  
**Request:**  
```json
{
  "priority": 99,
  "id": null,
  "startLocations": [
    9514
  ],
  "startLocationNames": [],
  "endLocations": [
    9513
  ],
  "endLocationNames": [],
  "interimStops": [
    9515
  ],
  "interimStopsNames": [],
  "shipmentTemplateName": "JUnit name",
  "shipmentDescription": "JUnit shipment",
  "addDateShipped": true,
  "alertProfileId": 4145,
  "alertProfileName": null,
  "alertSuppressionMinutes": 25,
  "alertsNotificationSchedules": [
    7008
  ],
  "commentsForReceiver": "Any comments for receiver",
  "arrivalNotificationWithinKm": 15,
  "excludeNotificationsIfNoAlerts": true,
  "arrivalNotificationSchedules": [
    7009
  ],
  "shutdownDeviceAfterMinutes": 99,
  "noAlertsAfterArrivalMinutes": 43,
  "noAlertsAfterStartMinutes": null,
  "shutDownAfterStartMinutes": 47,
  "shutDownAfterStartMinutes": null,
  "sendArrivalReport": true,
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "defaultShipmentId": 35
  }
}
```
### Get AutoStart Shipment example ###
**GET /vf/rest/getAutoStartShipment/${accessToken}?autoStartShipmentId=1363**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "priority": 77,
    "id": 2220,
    "startLocations": [
      9545
    ],
    "startLocationNames": [
      "TO"
    ],
    "endLocations": [
      9544
    ],
    "endLocationNames": [
      "From"
    ],
    "interimStops": [],
    "interimStopsNames": [],
    "shipmentTemplateName": "JUnit template",
    "shipmentDescription": null,
    "addDateShipped": false,
    "alertProfileId": 4150,
    "alertProfileName": "AnyAlert",
    "alertSuppressionMinutes": 0,
    "alertsNotificationSchedules": [],
    "commentsForReceiver": null,
    "arrivalNotificationWithinKm": null,
    "excludeNotificationsIfNoAlerts": false,
    "arrivalNotificationSchedules": [],
    "shutdownDeviceAfterMinutes": null,
    "noAlertsAfterArrivalMinutes": null,
    "noAlertsAfterStartMinutes": null,
    "shutDownAfterStartMinutes": null,
    "shutDownAfterStartMinutes": null,
    "sendArrivalReport": true,
  }
}
```
### Get AutoStart Shipments example ###
**GET /vf/rest/getAutoStartShipments/${accessToken}?pageSize=100&pageIndex=1**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "priority": 77,
      "id": 2208,
      "startLocations": [
        9530
      ],
      "startLocationNames": [
        "TO"
      ],
      "endLocations": [
        9529
      ],
      "endLocationNames": [
        "From"
      ],
      "interimStops": [],
      "interimStopsNames": [],
      "shipmentTemplateName": "JUnit template",
      "shipmentDescription": null,
      "addDateShipped": false,
      "alertProfileId": null,
      "alertProfileName": null,
      "alertSuppressionMinutes": 0,
      "alertsNotificationSchedules": [],
      "commentsForReceiver": null,
      "arrivalNotificationWithinKm": null,
      "excludeNotificationsIfNoAlerts": false,
      "arrivalNotificationSchedules": [],
      "shutdownDeviceAfterMinutes": null,
      "noAlertsAfterArrivalMinutes": null,
      "noAlertsAfterStartMinutes": null,
      "shutDownAfterStartMinutes": null,
      "sendArrivalReport": true,
      "arrivalReportOnlyIfAlerts": false
    },
    {
      "priority": 77,
      "id": 2209,
      "startLocations": [
        9530
      ],
      "startLocationNames": [
        "TO"
      ],
      "endLocations": [
        9529
      ],
      "endLocationNames": [
        "From"
      ],
      "interimStops": [],
      "interimStopsNames": [],
      "shipmentTemplateName": "JUnit template",
      "shipmentDescription": null,
      "addDateShipped": false,
      "alertProfileId": null,
      "alertProfileName": null,
      "alertSuppressionMinutes": 0,
      "alertsNotificationSchedules": [],
      "commentsForReceiver": null,
      "arrivalNotificationWithinKm": null,
      "excludeNotificationsIfNoAlerts": false,
      "arrivalNotificationSchedules": [],
      "shutdownDeviceAfterMinutes": null,
      "noAlertsAfterArrivalMinutes": null,
      "noAlertsAfterStartMinutes": null,
      "shutDownAfterStartMinutes": null,
      "sendArrivalReport": true,
      "arrivalReportOnlyIfAlerts": false
    }
  ],
  "totalCount": 2
}
```
### Delete AutoStart Shipment example ###
**GET /vf/rest/deleteAutoStartShipment/${accessToken}?autoStartShipmentId=34**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Save Note example ###
**POST /vf/rest/saveNote/${accessToken}**  
**Request:**  
```json
{
  "activeFlag": false,
  "createdBy": null,
  "creationDate": null,
  "noteNum": null,
  "noteText": "Note text",
  "shipmentId": null,
  "noteType": "Simple",
  "sn": "039485",
  "trip": 1,
  "timeOnChart": "2016-03-31 14:27"
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "noteNum": 1
  }
}
```
### Get Notes example ###
**GET /vf/rest/getNotes/${accessToken}?sn=039485&trip=1**  
**GET /vf/rest/getNotes/${accessToken}?shipmentId=17137**    
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "activeFlag": true,
      "createdBy": "a@b.c",
      "creationDate": "2016-03-31 14:53",
      "noteNum": 1,
      "noteText": "A",
      "shipmentId": 17137,
      "noteType": "Simple",
      "sn": "039485",
      "trip": 1,
      "timeOnChart": "2016-03-31 14:53"
    },
    {
      "activeFlag": true,
      "createdBy": "a@b.c",
      "creationDate": "2016-03-31 14:53",
      "noteNum": 2,
      "noteText": "B",
      "shipmentId": 17137,
      "noteType": "Simple",
      "sn": "039485",
      "trip": 1,
      "timeOnChart": "2016-03-31 14:53"
    }
  ]
}
```
### Delete Note example ###
**GET /vf/rest/deleteNote/${accessToken}?noteNum=2&sn=039485&trip=1**  
**GET /vf/rest/deleteNote/${accessToken}?noteNum=2&shipmentId=17137**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Save Simulator example ###
**POST /vf/rest/saveSimulator/${accessToken}
**Request:**  
```json
{
  "sourceDevice": "098234790799284",
  "targetDevice": null, //this is real only property. Will generated if need automatically for given user
  "user": "mkutuzov-1@mail.ru",
  "autoStartTemplate": 22138
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "simulatorDevice": "aaaaaaaaacebcgh"
  }
}
```
### Delete Simulator example ###
**GET /vf/rest/deleteSimulator/${accessToken}?user=mkutuzov-1%40mail.ru**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Start Simulator example ###
**POST /vf/rest/startSimulator/${accessToken}**  
**Request:**  
```json
{
  "user": "mkutuzov-1@mail.ru", // if null, current logged it user will used.
  "startDate": "2016-04-05 18:42", //start of time interval. can be null
  "endDate": "2016-04-05 21:29",  //end of time interval. can be null
  "velosity": 20 // t1new - tonew = (t1old - t0old) / velosity
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Stop Simulator example ###
**GET /vf/rest/stopSimulator/${accessToken}?user=mkutuzov-1%40mail.ru**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Get Simulator example###
**GET /vf/rest/getSimulator/${accessToken}?user=mkutuzov-1%40mail.ru**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "sourceDevice": "098234790799284",
    "targetDevice": "aaaaaaaaacehaih",
    "user": "mkutuzov-1@mail.ru",
    "started": false,
    "autoStartTemplate": 22138
  }
}
```
### AutoStart new Shipment example ###
**GET /vf/rest/createNewAutoSthipment/${accessToken}?device=123987230987**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "shipmentId": 23819 //ID of created shipment
  }
}
```
### Init device colors example ###
**GET /vf/rest/initDeviceColors/${accessToken}?company=5148**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Get readings example ###
**GET /vf/rest/getReadings/${accessToken}?startDate=2016-07-26T08-17-58&endDate=2016-07-26T09-18-18&device=1234987039487**  
**GET /vf/rest/getReadings/${accessToken}?sn=703948&trip=1**  
**CSV text response:**  
```
id,type,time,battery,temperature,latitude,longitude,device,shipment,createdon,alerts
870,SwitchedOn,2016-08-01 16:45,27,11.0°C,12.34,56.78,-1234987039487,,2016-08-01 20:45,
871,SwitchedOn,2016-08-01 17:45,27,11.0°C,12.34,56.78,-1234987039487,,2016-08-01 20:45,"Battery,Hot,Cold"
873,SwitchedOn,2016-08-01 19:45,27,11.0°C,12.34,56.78,-1234987039487,703948(1),2016-08-01 20:45,
```

### Get Shipment Report example ###
**GET /vf/rest/getShipmentReport/${accessToken}?shipmentId=2714**  
**GET /vf/rest/getShipmentReport/${accessToken}?sn=3456&trip=1**  

**Returns PDF file as byte stream**  

### Email Shipment Report example ###
**GET /vf/rest/emailShipmentReport/${accessToken}**  
**Request**  
```json
{
  "sn": "39485",
  "trip": 1,
  "subject": "Shipment report from JUnit test",
  "messageBody": "Given report is sent from JUnit test",
  "recipients": [
    {
      "type": "user",
      "value": 19806
    },
    {
      "type": "email",
      "value": "junit@smarttrace.com.au"
    }
  ]
}
```  
**Response**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Get Performance Report example ###
**GET /vf/rest/getPerformanceReport/${accessToken}?month=2016-07**  

**Returns PDF file as byte stream**  
### Add Interim Stop example ###
**POST /vf/rest/addInterimStop/${accessToken}**  
**Request:**  
```json
{
  "shipmentId": 32348,
  "locationId": 33197,
  "latitude": 11.11,
  "longitude": 12.12,
  "time": 10,
  "stopDate": "2016-09-28 06:13"
}
```
**Response:**  
```json  
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "id": 1134
  }
}
```
### Save Interim Stop example ###
**POST /vf/rest/saveInterimStop/${accessToken}**  
**Request:**  
```json
{
  "id": 1515,
  "shipmentId": 37536,
  "locationId": 38660,
  "time": 10,
  "stopDate": "2016-10-05 11:20"
}
```
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "id": 1516
  }
}
```

### Delete Interim Stop example ###
**GET /vf/rest/deleteInterimStop/${accessToken}?id=1517&shipment=37537**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```

### Get Interim Stop example ###
**GET /vf/rest/getInterimStops/${accessToken}?shipment=37540**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 1520,
      "shipmentId": 37540,
      "locationId": 38674,
      "time": 15,
      "stopDate": "2016-10-06 15:07"
    },
    {
      "id": 1521,
      "shipmentId": 37540,
      "locationId": 38674,
      "time": 15,
      "stopDate": "2016-10-06 15:07"
    }
  ]
}
```
### Get Shipment Audits example ###
**GET /vf/rest/getShipmentAudits/${accessToken}?sc=userId&pageIndex=1&pageSize=100&so=asc&userId=7491**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 443,
      "action": "Autocreated",
      "shipmentId": 5632,
      "time": "2017-04-29T04:33",
      "userId": 7491,
      "additionalInfo": {
        "key1": "value1",
        "key2": "value2"
      }
    },
    {
      "id": 444,
      "action": "Autocreated",
      "shipmentId": 5633,
      "time": "2017-04-29T04:33",
      "userId": 7491,
      "additionalInfo": {
        "key1": "value1",
        "key2": "value2"
      }
    }
  ],
  "totalCount": 2
}
```
### Get Corrective Action list example ###
**GET /vf/rest/getCorrectiveActionList/${accessToken}?id=52**  
**Response:**  
```json
Response:
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "listId": 61,
    "listName": "JUnit action list",
    "description": null,
    "actions": [
      {
        "action": "a",
        "requestVerification": false
      },
      {
        "action": "b",
        "requestVerification": false
      }
    ]
  }
}
```
### Save Corrective Action list example ###
**POST /vf/rest/saveCorrectiveActionList/${accessToken}**  
**Request:**  
```json
{
  "listId": null,
  "listName": "JUnit action list",
  "description": null,
  "actions": [
    {
      "action": "a",
      "requestVerification": false
    },
    {
      "action": "b",
      "requestVerification": false
    }
  ]
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "listId": 52,
    "listName": "JUnit action list",
    "description": null,
    "actions": [
      "a",
      "b"
    ]
  }
}
```
### Delete Corrective Action list example ###
**GET /vf/rest/deleteCorrectiveActionList/${accessToken}?id=52**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Get Corrective Action lists example ###
**GET /vf/rest/getCorrectiveActionLists/${accessToken}?sc=listId&pageIndex=1&pageSize=10000&so=asc**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "listId": 53,
      "listName": "b",
      "description": null,
      "actions": [
         "First action",
         "Second action"
      ]
    },
    {
      "listId": 54,
      "listName": "a",
      "description": null,
      "actions": []
    },
    {
      "listId": 55,
      "listName": "c",
      "description": null,
      "actions": []
    }
  ],
  "totalCount": 3
}
```
### Get Action Taken example ###
**GET /vf/rest/getActionTaken/${accessToken}?id=121**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "id": 121,
    "action": {
      "action": "Check the door opened",
      "requestVerification": false
    },
    "time": "2017-06-14T09:25",
    "comments": "Any comments",
    "alert": 582,
    "confirmedBy": 1714,
    "verifiedBy": null,
    "alertTime": "2017-06-14T09:25", //view only parameter
    "alertDescription": ">18.0°C for 0 min in total", //view only parameter
    "confirmedByEmail": "a@b.c", //view only parameter
    "confirmedByName": "Yury Gagarin", //view only parameter
    "verifiedByEmail": null, //view only parameter
    "verifiedByName": "", //view only parameter
    "shipmentSn": "039485", //view only parameter
    "shipmentTripCount": 1 //view only parameter
  }
}
```
### Save Action Taken example ###
**POST /vf/rest/saveActionTaken/${accessToken}**  
**Request:**  
```json
{
  "id": 117,
  "action": {
    "action": "Check the door opened",
    "requestVerification": false
  },
  "time": "2017-06-14T09:25",
  "comments": "Any comments",
  "alert": 576,
  "confirmedBy": 1705,
  "verifiedBy": null
}
```  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": {
    "actionTakenId": 117
  }
}
```
### Delete Action Taken example ###
**GET /vf/rest/deleteActionTaken/${accessToken}?id=120**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": null
}
```
### Get Action Takens example ###
**GET /vf/rest/getActionTakens/${accessToken}?shipment=1294**  
**Response:**  
```json
{
  "status": {
    "code": 0,
    "message": "Success"
  },
  "response": [
    {
      "id": 118,
      "action": {
        "action": "Check the door opened",
        "requestVerification": false
      },
      "time": "2017-06-14T09:25",
      "comments": "Any comments",
      "alert": 578,
      "confirmedBy": 1708,
      "verifiedBy": null,
      "alertTime": "2017-06-14T09:25",
      "alertDescription": ">18.0°C for 0 min in total",
      "confirmedByEmail": "a@b.c",
      "confirmedByName": "Yury Gagarin",
      "verifiedByEmail": null,
      "verifiedByName": "",
      "shipmentSn": "039485",
      "shipmentTripCount": 1
    },
    {
      "id": 119,
      "action": {
        "action": "Check the door opened",
        "requestVerification": false
      },
      "time": "2017-06-14T09:40",
      "comments": "Any comments",
      "alert": 579,
      "confirmedBy": 1708,
      "verifiedBy": null,
      "alertTime": "2017-06-14T09:40",
      "alertDescription": "entering bright environment",
      "confirmedByEmail": "a@b.c",
      "confirmedByName": "Yury Gagarin",
      "verifiedByEmail": null,
      "verifiedByName": "",
      "shipmentSn": "039485",
      "shipmentTripCount": 1
    }
  ],
  "totalCount": 2
}
```
