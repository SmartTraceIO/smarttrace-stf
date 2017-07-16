#SMARTTRACE CLIENT ON ANGULARJS PROJECT

##Caching solution

###Idea
The system must loading new file - html template, javascript, css - immediately when new version of code was deployed.
###Implemented:
Create a json file named `version.json` in directory 	`app/config`

```json
{
  "version": 1
}
```

Add follow code to `index.html`. This code will try to get file `version.json` every time when the file `index.html` was loaded. It then does parse the file `version.json` and pass version information into a global variable named `version` (that was defined by `var version = 0`).

```javascript
<script>
    var version = 0;
    var v = (new Date()).getTime();
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'app/config/version.json?v='+v, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            var jsonVer = JSON.parse(xobj.responseText);
            if (jsonVer) {
                version = jsonVer.version;
            }
        }
    };
    xobj.send(null);
</script>
```

In file `app/config/routeConfig.js` we implement lazy loading solution by adding version infomation to the end of each `templateUrl` and `dependencies`.

```javascript
{
      name: 'login',
      config: {
          url: "/login"
          , views: {
              "content": {
                  templateUrl: "app/login/login.html?v=" + version
                   , controller: 'LoginCtrl'
              }
          }
      },
      dependencies: [
          'app/login/login.js?v=' + version,
      ]
  },
```

###Usage:
- When the new version of code was deployed, let's change the version information in file `app/config/version.json` by increase the version-number by +1.
- In client side (here is a browser), let's refresh the page by `click on button refresh`, `press Ctrl + F5` or `close the page and re-open it`.

###Explain
Web-Browser like google-chrome, Firefox do cache for static file (html, javascript, css) and refer them back to render website as needed. Browser base on url to refer caching. By adding version information to the end of url we can force browser reload cached files


##Testing
###Add/Edit Alert Profile Screen

1. **Name input** field (is required).
1. **Description** field can be empty.
1. **Low temperature for reports** input field must contain an integer value in a current temperature measurement unit.
1. **High temperatures for reports** input field must contain an integer value in a current temperature measurement unit.
1. **Less than** input field must contain an integer value in a current temperature measurement unit.
1. **Less than** input field(is required).
1. **Time type check** input field options:
      * Continiously for
      * For a total of
1. In **How often can the alert fire** include:
      * Once per trip
      * Once every 24hrs
      * Once every 48hrs
      * Once every 7days
1. **Mins** field must contain an itager value in minutes.
1. If the **Mark as critical** is unchecked, the **Actions to take when the alert fires** field must be unable.
1. If the **Mark as critical** is checked, the **Actions to take when the alert fires** field must contain a number of actions and one empty option.
1. **Add another** button must open one more low temperature rule.
1. In **High temperatures** field **More than** input field must contain an intager number in a current temperature measurement unit.
1. **More than** input field (is required).
1. **Time type check** input field options:
      * Continiously for
      * For a total of
1. In **How often can the alert fire**  contains a  maximum number of times the alert can fire:
      * Once per trip
      * Once every 24hrs
      * Once every 48hrs
      * Once every 7days
1. **Mins** field must contain an itager value in minutes.
1. If the **Mark as critical** is unchecked, the **Actions to take when the alert fires** input field must be unable.
1. If the **Mark as critical** is checked, the **Actions to take when the alert fires** input field must contain a number of actions and one empty option.
1. **Add another** button must open one more high temperature rule.
1. *Other Alerts ->* **Enter Bright Environment** can stay unchecked.
1. *Other Alerts ->* **Low Battery** can stay unchecked.
1. If  the **Enter Bright Environment** is unchecked, the **Actions to take when the alerts fires**  field must be unable.
1. If the  **Enter Bright Environment** is checked, the **Actions to take when the alerts fires**  field must contaia number of actions and one empty option.
1. If  the **Low Battery** is unchecked, the **Actions to take when the alerts fires**  field must be unable.
1. If the  **Low Battery** is checked, the **Actions to take when the alerts fires**  field must contain a number of actions and one empty option.
1. **Save** button sends the data to the server, without page refresh.
1. **Cancel** button gives prompt message with "Any unsaved changes will be lost including delete, are you sure you want to cancel?" question.
     * *Ok* button in the prompt form closes the editing page without saving the changes and opens the *List of Alerts profiles*.
     * *Cancel* button in the prompt form closes the prompt form and returnes to the Editing page.
     
##Test Cases for Alert Profiles
1. **Launch site and open alert profiles page:**
        
    |    Actions:                                                           | Expected Result:                |
    |---------------------------------------------------------------------- | --------------------------------|
    |   1. Go to file:///home/ilona/smarttrace-stf/index.html#/manage/alert | 1. Site opens                   |
    |   2. Choose **Alert Profiles** in the **Setup** dropdown list         | 2. List of alert profiles opens |
   
   
        
1. **Name input field:**
        
    |   Actions:                                              | Expacted Result:                                                    |
    |---------------------------------------------------------|---------------------------------------------------------------------|
    |  1. Click **Edit** button on the profile                | 1. Opens the page with the rules of the profile                     |
    |  2. Clear the **Name** Field empty  and click **Save**  | 2. The page is not saving. The **Name** field ask for the alert name|
    |  3. Enter any profile name that is longer than 40 signs | 3. The Profile name fills only with 40signs                         |
    |  4. Enter any numbers to the field and click **Save**   | 4. The alert to be saved, having numbers in its name                |
    
    
    
1. **Discription input field:** 
    |   Actions:                                                       | Expacted Result:                                                |
    |------------------------------------------------------------------|-----------------------------------------------------------------|
    |  1. Clear the description field and click **Save**               | 1. The changes can be saved with an empty **Description** field |
    |  2. The max length of the description is not more than 120 signs | 2. Max number of signs is 120                                   |
    |  3. Enter any numbers and signs                                  | 3. The description field can include numbers and signs          |
    