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