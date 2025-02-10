# semsportal-auth0

## Installing new tenant from scratch
DEV EU account alois.huho@gmail.com

PROD EU account tra@g

To install PROD tenant replace `semsportal-ifttt-dev` with `semsportal-ifttt`, `semsportal-ifttt-api-dev` with `semsportal-ifttt-api` and `semsportal_dev` with `semsportal`.

1. Applications -> **Applications** -> new Regular Web Application
    * Settings
        * Basic Information
            * Name: `semsportal-ifttt-dev`
            * Description: `GoodWe SemsPortal IFTTT service`
        * Application Properties
            * Logo: https://play-lh.googleusercontent.com/Q9ASU8NrsRJlDiu_vFfdmpqpoungCQOQ9Ws66Ja2bqCNjVsv3obYLYRIYdNZZNAWIE0
            * Application Type: `Regular Web Application`
        * Application URIs
            * Allowed Callback URLs: `https://ifttt.com/channels/semsportal_dev/authorize`
        * Refresh Token Expiration
            * Set Maximum Refresh Token Lifetime
            * Maximum Refresh Token Lifetime: default (`31557600`)
        * Refresh Token Rotation
            * Allow Refresh Token Rotation
            * Rotation Overlap Period: `3600`
    * Connections
        * disable all Social
1. Applications -> **Applications** -> new Machine to Machine Application
    * Settings
        * Basic Information
            * Name: `semsportal-ifttt-api-dev`
            * Description: `GoodWe SemsPortal IFTTT service API`
        * Application Properties
            * Application Type: `Machine to Machine`
1. Applications -> **APIs** -> create new API
    * Name: `semsportal-ifttt-dev`
    * Identifier: `semsportal-ifttt` (no dev here)
    * Access Settings: Allow Offline Access
    * this API is used from IFTTT when calling Authorization URL (https://dev-chx50lp746zf2xfl.eu.auth0.com/authorize?audience=semsportal-ifttt&scope=offline_access+openid+email+profile)
1. open https://manage.auth0.com/dashboard/eu/dev-15hr8wvahf2zm7j0/apis/management/explorer to create a new API Explorer Application together with Auth0 Management API
1. Applications -> **APIs** -> Auth0 Management API
    * Machine to Machine Applications
        * authorize semsportal-ifttt-api-dev with only `read:users` (is used to initially read users and start their triggers)
        * authorize API Explorer Application with all permissions (is used for maintenance from https://auth0.com/docs/api/management/v2)
1. Authentication -> **Database** -> Username-Password-Authentication -> Settings
    * Disable Sign Ups
1. Custom **Database**
    * Use my own database
    * Database Action Scripts
        * **Login** script: source from file `db-connection-login.js`
        * **Delete** script: replace line 13
```
- return callback(new Error(msg));
+ return callback(null);
```
1. **Branding** -> Universal Login
    * Company Logo: https://play-lh.googleusercontent.com/Q9ASU8NrsRJlDiu_vFfdmpqpoungCQOQ9Ws66Ja2bqCNjVsv3obYLYRIYdNZZNAWIE0
    * Primary Color: `#1d5d8a` for dev (or '#35a6f8' for prod)
    * Custom Text:
        * pageTitle: `Log in to ${companyName}.`
        * title: `Log in to ${companyName}.`
        * description: `By logging in you confirm and agree that you authorize IFTTT to read your selected daily metrics of your GoodWe inverter and use them in triggers you set up. Access is strictly read-only and there is no way for IFTTT to make any changes to your inverter configuration.`
1. delete "Forgot password?" from login page:
    * set `disable_self_service_change_password: true` on the database **connection** using PATCH method
    * all other properties must be present in the request except for id, name, startegy, so use GET first
    * see https://community.auth0.com/t/how-to-remove-the-forgot-password-link-from-the-new-universal-login-page/92554
1. **Actions** -> Triggers -> post-login
    * build action from scratch in Node22 with Name **Refresh provider access token**: source from file `post-login-action.js`
    * add dependency: `axios` (1.7.9) -> Deploy
    * back to triggers and drag&drop between Start and Complete -> Apply
1. **Tenant** Settings
    * General -> Settings
        * Friendly Name: `GoodWe SemsPortal Automation`
        * Support Email: alois.huho+auth0@gmail.com
        * Support URL: https://docs.google.com/forms/d/e/1FAIpQLScYb5szsvl2ouJdjeXJ95rAqitq3sL5AXeJ9LZMU39NqWIshA/viewform
    * Advanced
        * Tenant Login URI: `https://ifttt.com/semsportal_dev/activation/start`
        * Allowed Logout URLs: `https://ifttt.com/channels/semsportal_dev/authorize`
    * General
        * Tenant Information: Run Readiness Check

## References
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [How to build an IFTTT integration - Getting started](https://www.youtube.com/watch?v=xkP_W9n21Nc)
- [How to build an IFTTT integration - Authentication Part ](https://www.youtube.com/watch?v=qnj1XKTZfjQ)
- [How to build an IFTTT integration - Authentication Part 2](https://www.youtube.com/watch?v=QwvPzcsYgh4)
