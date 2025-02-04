# semsportal-auth0

## Installing DEV tenant from scratch (alois.huho@gmail.com)

* Applications -> Applications -> new Regular Web Application
    * Settings
        * Basic Information
            * Name: `semsportal-oauth-dev`
            * Description: The OAuth authentication facade for accessing GoodWe SemsPortal from IFTTT.
        * Application Properties
            * Logo: https://play-lh.googleusercontent.com/Q9ASU8NrsRJlDiu_vFfdmpqpoungCQOQ9Ws66Ja2bqCNjVsv3obYLYRIYdNZZNAWIE0
            * Application Type: Regular Web Application
        * Application URIs
            * Allowed Callback URLs: `https://ifttt.com/channels/semsportal_dev/authorize`
            * Allower Logout URLs: `https://ifttt.com/semsportal_dev/activation/start`
        * Refresh Token Expiration
            * Set Maximum Refresh Token Lifetime
            * Maximum Refresh Token Lifetime: default (`31557600`)
        * Refresh Token Rotation
            * Allow Refresh Token Rotation
            * Rotation Overlap Period: `3600`
    * Connections
        * disable all Social
* Applications -> APIs -> create new API
    * Name: `semsportal-ifttt-dev`
    * Identifier: `semsportal-ifttt` (no dev here)
    * Access Settings: Allow Offline Access
* optional for using https://auth0.com/docs/api/management/v2: new Application 'API Explorer Application' (M2M) ...
* Authentication -> Database -> Username-Password-Authentication -> Settings
    * Disable Sign Ups
* Custom Database
    * Use my own database
    * Database Action Scripts
        * no scripts other than **Login**: source `db-connection-login.js`
* Branding -> Universal Login
    * Company Logo: https://play-lh.googleusercontent.com/Q9ASU8NrsRJlDiu_vFfdmpqpoungCQOQ9Ws66Ja2bqCNjVsv3obYLYRIYdNZZNAWIE0
    * Primary Color: `#40b1f3`
* Actions -> Triggers -> post-login
    * build action from scratch in Node22 with Name **Refresh provider access token**: source `post-login-action.js`
    * modify api.redirect.sendUserTo (line 76) to proper domain *.eu.auth0.com
    * modify const SEMSPORTAL_IFTTT_BASEURL = 'https://ifttt.com/semsportal_dev' (line 5) to proper dev url
    * add dependency: `axios` (1.7.9)
    * drag&drop between Start and Complete -> Apply
* Settings
    * General -> Settings
        * Friendly Name: GoodWe SemsPortal Auth0
        * Support Email: alois.huho+auth0@gmail.com
    * Advanced
        * Tenant Login URI: `https://ifttt.com/semsportal_dev/activation/start`
* deleting "Forgot password?" from login page: https://community.auth0.com/t/how-to-remove-the-forgot-password-link-from-the-new-universal-login-page/92554


TODO doresit M2M app
