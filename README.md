#SMARTTRACE CLIENT ON ANGULARJS PROJECT

##Caching solution
- Idea: The system must loading new file - html template, javascript, css - immediately when new version of code was deployed.
- Implemented:
    - Create a json file named `version.json`

```json
{
  "version": 1
}
```