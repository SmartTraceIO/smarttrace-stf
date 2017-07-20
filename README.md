
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
        
    |   Actions:                                              | Expected Result:                                                    |
    |---------------------------------------------------------|---------------------------------------------------------------------|
    |  1. Click **Edit** button on the profile                | 1. Opens the page with the rules of the profile                     |
    |  2. Clear the **Name** Field empty  and click **Save**  | 2. The page is not saving. The **Name** field ask for the alert name|
    |  3. Enter any profile name that is longer than 40 signs | 3. The Profile name fills only with 40signs                         |
    |  4. Enter any numbers to the field and click **Save**   | 4. The alert to be saved, having numbers in its name                |
    
    
    
1. **Discription input field:** 

    |   Actions:                                                       | Expected Result:                                                |
    |------------------------------------------------------------------|-----------------------------------------------------------------|
    |  1. Clear the description field and click **Save**               | 1. The changes can be saved with an empty **Description** field |
    |  2. The max length of the description is not more than 120 signs | 2. Max number of signs is 120                                   |
    |  3. Enter any numbers and signs                                  | 3. The description field can include numbers and signs          |
    
1. **Low temperature of report field:**

    |   Actions:                                     | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  from -273 to 100  | 3. The changes save with integer values                   |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |

1. **High temperature of report field:**

    |   Actions:                                     | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  from -273 to 100  | 3. The changes save with integer values                   |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |
    
    
    
    
*****************************************************************************************************************
####Low Temperature Rules####

1. **Less than field:**

    |   Actions:                                     | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  from -273 to 100  | 3. The changes save with integer values                   |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |
    |  5. Clear the field                            | 5. The changes are not saving, **Less than** is required  |
    
    
1. **Time type of check:**

    |  ACtions:                 | Expected Result:                                          |
    |---------------------------|-----------------------------------------------------------|
    |  1. Choose an option:     | 1. The option can be chosen and the changes are saved     |
    |       * Continiously for  |                                                           |
    |       * For a total of    |                                                           |

1. **How often can the alert fire:**

    | Actions:                        | Expected Result                                                        |
    |---------------------------------|------------------------------------------------------------------------|
    | 1. Choose an option:            | 1. Any option can be chosen and the  changes are saved  with the option| 
    |     * Once per trip             |                                                                        |
    |     * Once every 24hrs          |                                                                        |
    |     * Once every 48hrs          |                                                                        |
    |     * Once every 7days          |                                                                        |
    
1. **Mins field:**

    | Actions:                                       | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  less 10           | 3. The changes are not saved with less than 10 number     |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |
    |  5. Clear the field                            | 5. The changes are not saving, **Mins** is required       |
    
1. **Mark as critical:**

    | Actions:                           | Expected Result:                           |
    |------------------------------------|--------------------------------------------|
    | 1. Tick the **Mark as critical**   | 1. The **Actions to take field** is active |
    | 2. Untick the **Mark as critical** | 2. The **Actions to take field** is unable |
    
1. **Add another button:**

    | Actions:                          | Expected Result:                     |
    |-----------------------------------|--------------------------------------|
    | 1. Click **Add another** button   | 1. New Low temperature rule appeares |
    
1. **Delete button:**

    | Actions:                    | Expected Result:                    |
    |-----------------------------|-------------------------------------|
    | 1. Click **Delete** button  | 1. The low temperature rule deletes |
    
    
    
    
    
*************************************************************************************
####High Temperature Rules####



1. **More than field:**

    |   Actions:                                     | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  from -273 to 100  | 3. The changes save with integer values                   |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |
    |  5. Clear the field                            | 5. The changes are not saving, **Less than** is required  |
    
    
1. **Time type of check:**

    |  ACtions:                 | Expected Result:                                          |
    |---------------------------|-----------------------------------------------------------|
    |  1. Choose an option:     | 1. The option can be chosen and the changes are saved     |
    |       * Continiously for  |                                                           |
    |       * For a total of    |                                                           |

1. **How often can the alert fire:**

    | Actions:                        | Expected Result                                                        |
    |---------------------------------|------------------------------------------------------------------------|
    | 1. Choose an option:            | 1. Any option can be chosen and the  changes are saved  with the option| 
    |     * Once per trip             |                                                                        |
    |     * Once every 24hrs          |                                                                        |
    |     * Once every 48hrs          |                                                                        |
    |     * Once every 7days          |                                                                        |
    
1. **Mins field:**

    | Actions:                                       | Expected Result:                                          |
    |------------------------------------------------|-----------------------------------------------------------|
    |  1. Enter any  not integer number to the field | 1. The changes must not be saved with not integer numbers |
    |  2. Enter any symbols                          | 2. The changes must not be saved with symbols             |
    |  3. Enter any integer value  less 10           | 3. The changes are not saved with less than 10 number     |
    |  4. Change the temperature measurement unit    | 4. The measurement unit and the value must be changed     |
    |  5. Clear the field                            | 5. The changes are not saving, **Mins** is required       |
    
1. **Mark as critical:**

    | Actions:                           | Expected Result:                           |
    |------------------------------------|--------------------------------------------|
    | 1. Tick the **Mark as critical**   | 1. The **Actions to take field** is active |
    | 2. Untick the **Mark as critical** | 2. The **Actions to take field** is unable |
    
1. **Add another button:**

    | Actions:                          | Expected Result:                     |
    |-----------------------------------|--------------------------------------|
    | 1. Click **Add another** button   | 1. New High temperature rule appeares|
    
1. **Delete button:**

    | Actions:                    | Expected Result:                    |
    |-----------------------------|-------------------------------------|
    | 1. Click **Delete** button  | 1. The High temperature rule deletes|
    
    
    
    
******************************************************************************************

###Add/Edit corrective action list page:###

1. **Name** input field restriction length is 40 symbols. Can include signs/numbers.(is required)
2. *Description* input field can be empty. Can include signs/numbers. The length is 120signs.
3. **Add another** button opens a new empty corrective action field.
4. **Corrective Action** input field has no restricted length. Can include signs/numbers.( is required)
5. **Arrows Up and Down** buttons move the action up/down.
6. **Requires verification** can be checked or unchecked.
7. **Delete** button deletes the action after saving the changes in the list.
8. **Save** button saves the changes made in the list.
9. **Cancel** button gives a prompt message asking to save/not to save the changes. If **Cancel-> OK**  - the changes in the list are not saved and opens the page of **Corrective Action List**. If **Cancel->Cancel** - opens the editing page of the already opened list.


####Test Cases####

1. **Corrective action lists edit:**

    | Actions:                                                      | Expected Result:                                  |
    |---------------------------------------------------------------|---------------------------------------------------|
    | 1. Choose **Correct Action List** in **Setup** dropdown menu  | 1. Opens the page with **Corrective Action Lists**|
    | 2. Click **Edit** on any list                                 | 2. Opens the chosen list                          |
    
2. **Name input field:**

    | Actions:                                   | Expected Result:                                         |
    |--------------------------------------------|----------------------------------------------------------|
    | 1. Clear the field and click **Save**      | 1. The list not to be saved (**Name** is required field) |
    | 2. Enter list name no longer than 40 signs | 2. Restricted length of the field is 40 signs            |
    | 3. Enter any signs/numbers                 | 3. The **Name** field can be saved with any signs/numbers|
    
3. **Description input field:**

    | Actions:                                            | Expected Result:                                                    |
    |-----------------------------------------------------|---------------------------------------------------------------------|
    | 1. Clear the **Description** field and **Save**     | 1. The list saves without description                               |
    | 2. Enter any discription no longer than 120 symbols | 2. The **Description** field has  a length restriction of 120 signs |
    | 3. Enter any signs/numbers                          | 3. The list saves with signs/numbers in the **Description** field   |

4. **Add another:**

    | Actions:                         | Expected Result:                                |
    |----------------------------------|-------------------------------------------------|
    | 1. Click **Add another** button  | 1. Opens a new empty **Corrective Action** field|
    
5. **Corrective Actions field**

    | Actions:                                 | Expected Result:                                                                         |
    |------------------------------------------|------------------------------------------------------------------------------------------|
    | 1. Enter any signs/ numbers and **Save** | 1. The list saves with numbers/signs                                                     |
    | 2. Enter a text of any length            | 2. The length of the field is not restricted. The **Corrective Action** field is required|

6. **Required verification checkbox:** 


    | Actions:                                     | Expected Result:                                 |
    |----------------------------------------------|--------------------------------------------------|
    | 1. Tick on/off the checkbox and **Save**     | 1. The list saves with checkbox checked/unchecked|
    
    
7. **Delete button:**

    | Actions:                         | Expected Result:                                      |
    |----------------------------------|-------------------------------------------------------|
    | 1. Click **Delete** button       | 1. The chosen list **Corrective Action** field deletes|
    
8. **Save button:**

    | Actions:                                                  | Expected Result:                                                                     |
    |-----------------------------------------------------------|--------------------------------------------------------------------------------------|
    | 1. Click **Save** button after the corrections were made  | 1. **Corrective Action** list saves and opens the page of **Corrective Action lists**|
    
9. **Cancel button:**

    | Actions:                                   | Expected Result:                                                                              |
    |--------------------------------------------|-----------------------------------------------------------------------------------------------|
    | 1. Click **Cancel**                        | 1. Opens a prompt message                                                                     |
    | 2. CLick **OK** in the prompt message      | 2. The chages made in the list are not saved and opens the page of **Corrective Action Lists**|
    | 3. Click **Cancel** in the prompt message  | 3. The prompt message box closes and opens the editing page of the list                       |
    
    
    
###List of Corrective Action Lists###

1. **Show** dropdown list include options:
      * 10
      * 20
      * 50
      * 100
2. **Add New Corrective Action List** button opens a tab of new corrective action list.
3. Table rows **ID, Name, Description** can be ordered alphabeticaly or non-alphabeticaly order with a click on one of them.
4. **Edit** button opens a chosen list for editing.
5. **Delete** button deletes the chosen list.


##CORRECTIVE ACTIONS##
1. **Add another action taken** button

    | Actions:                                   | Expected Result:                               |
    |--------------------------------------------|------------------------------------------------|
    | 1. Click **Add another action taken**      | 1. Opens an **Add another action taken window**|
    
2. **Verify** button

    | Actions:                                   | Expected Result:                           |
    |--------------------------------------------|--------------------------------------------|
    | 1. Click **Verify**                        | 1. Opens a verify action taken window      |
    

3. **Name** button

    | Actions:                                                       | Expected Result:                 |                                                             |
    |----------------------------------------------------------------|----------------------------------|
    | 1. Click **Name**  of the person, who verified/confirmed action| 1. Opens an User info window     |
    
##Add another action taken window##

    | Actions:                                   | Expected Result:                                              |
    |--------------------------------------------|---------------------------------------------------------------|
    | 1. Click **Add another action taken**      | 1. Opens an **Add another action taken window**               |
    | 2. Choose one of action taken              | 2. One action taken can be chosen                             |
    | 3. Add any comment                         | 3. Comment has no length restriction                          |
    | 4. Set time                                | 4. Time sets in the dd-mm-yy, hr:mn format                    |
    | 5. Click **Save**                          | 5. Saves one more action taken, adds to the corrective actions|
    | 6. Click **Cancel**                        | 6. Cancel all the changes. Does not add another action taken  |
    
##Verify##

    | Actions:                                   | Expected Result:                                                                           |
    |--------------------------------------------|--------------------------------------------------------------------------------------------|
    | 1. Click **Verify**                        | 1. Opens a **Verify window**.  Fields: ACtion taken, Comments, By, Time can not be changed |
    | 2. Tick **Verify**                         | 2. The button **Save** is active                                                           |
    | 3. Tick off  **Verify**                    | 3. The button **Save** is disabled                                                         |
    | 4. Add any comment                         | 4. Comment saves after clicking **Save**                                                   |
    | 5. Click **Save**                          | 5. Verifies the action taken                                                               |
    | 6. Click **Cancel**                        | 6. Cancel all the changes. Does not verify  action taken                                   | 

##User Details##

    | Actions:                                                        | Expected Result:                                                                                                      |
    |-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
    | 1. Click **Name** of the user who verified/commited action      | 1. Opens an **User Datails** window. Fields Name, Position, Company, Email,Mobile, SmartTrace Role can not be changed |
    | 2. Click **Cancel**                                             | 2. Closes the window                                                                                                  |

    