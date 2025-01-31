// --- AUTH0 ACTIONS TEMPLATE https://github.com/auth0/opensource-marketplace/blob/main/templates/add-email-to-access-token-POST_LOGIN ---

const axios = require('axios');

const SEMSPORTAL_IFTTT_BASEURL = 'https://ifttt.com/semsportal';
const NAMESPACE = SEMSPORTAL_IFTTT_BASEURL;
/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  console.log(`onExecutePostLogin: email: ${event.user.email}`);
  const providerAccessToken = await refreshProviderAccessToken(event, api);
  const userClaim = createUserClaim(event, providerAccessToken);
  api.accessToken.setCustomClaim(NAMESPACE + '/user', userClaim);
};

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api
*/
async function refreshProviderAccessToken(event, api) {
  console.log('refresh started');
  const auth = event.user.app_metadata.auth;
  if (!auth.password) {
    throw new Error('missing password');
  }

  const tokenOptions = {
    method: 'POST',
    url: `https://eu.semsportal.com/api/v2/Common/CrossLogin`,
    headers: { 'Token': '{"version":"v3.1","client":"ios","language":"en"}' },
    data: {
      account: event.user.email,
      pwd: Buffer.from(auth.password, 'base64').toString()
    }
  };
  let status = '';

  const res = await axios.request(tokenOptions)
    .catch(function (error) {
      if (error.response) {
        status = error.response.status;
      } else {
        status = error.message;
      }
    });

  let providerAccessToken = null;
  if (res && res.data && res.data.code == 0) {
    status = 'OK';
    providerAccessToken = Buffer.from(JSON.stringify(res.data.data)).toString('base64');
  } else if (res && res.data) {
    status = res.data.code + " " + res.data.msg;
  }
  console.log('returned', status);
  auth.access_token = providerAccessToken;
  auth.last_status = status;
  auth.last_status_created_at = Date.now();
  api.user.setAppMetadata('auth', auth);
  if (status === 'OK') {
    console.log('finished');
    return providerAccessToken;
  } else {
    console.log('login failed');
    api.redirect.sendUserTo(`https://${event.tenant.id}.us.auth0.com/v2/logout`, {
      query: { 
        client_id: event.client.client_id,
        returnTo: `${SEMSPORTAL_IFTTT_BASEURL}/activation/start`
        }
    });
  }
}

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {string | null | undefined} providerAccessToken
*/
function createUserClaim(event, providerAccessToken) {
  const u = {};
  u.email = event.user.email;
  if (providerAccessToken) {
    u.auth = {};
    u.auth.access_token = providerAccessToken;
  }
  if (event.user.app_metadata.plan) {
    u.plan = {};
    u.plan.check_period_sec = event.user.app_metadata.plan.check_period_sec;
    u.plan.created_at = event.user.app_metadata.plan.created_at;
    u.plan.expires_at = event.user.app_metadata.plan.expires_at;
  }
  return u;
}

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
// exports.onContinuePostLogin = async (event, api) => {
// };
