// --- AUTH0 ACTIONS TEMPLATE https://github.com/auth0/opensource-marketplace/blob/main/templates/add-email-to-access-token-POST_LOGIN ---

const axios = require('axios');

const NAMESPACE = 'https://ifttt.com/semsportal';
/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  console.log(`onExecutePostLogin: email: ${event.user.email}`);
  const providerAccessToken = await refreshProviderAccessToken(event, api);
  const planJustCreated = createDefaultPlan(event, api);
  const userClaim = getUserClaim(event, providerAccessToken, planJustCreated);
  api.accessToken.setCustomClaim(NAMESPACE + '/user', userClaim);
};

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api
*/
async function refreshProviderAccessToken(event, api) {
  console.log('refresh started');
  let status = '';
  let providerAccessToken;
  const auth = event.user.app_metadata?.auth;
  if (auth?.password) {
    const tokenOptions = {
      method: 'POST',
      url: `https://eu.semsportal.com/api/v2/Common/CrossLogin`,
      headers: { 'Token': '{"version":"v3.1","client":"ios","language":"en"}' },
      data: {
        account: event.user.email,
        pwd: Buffer.from(auth.password, 'base64').toString()
      }
    };

    const res = await axios.request(tokenOptions)
      .catch(function (error) {
        if (error.response) {
          status = error.response.status;
        } else {
          status = error.message;
        }
      });

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
    console.log(status === 'OK' ? 'finished' : 'login failed');
  } else {
    console.log('missing password');
  }
  if (status !== 'OK') {
    logout(event, api);
  }
  return providerAccessToken;
}

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api
*/
function logout(event, api) {
  api.redirect.sendUserTo(`https://${event.tenant.id}.eu.auth0.com/v2/logout`, {
    query: {
      returnTo: event.transaction.redirect_uri
    }
  });
}

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api
* @return {object} default plan just created or null if already existed
*/
function createDefaultPlan(event, api) {
  if (!event.user.user_metadata?.plan) {
    const plan = {
      created_at: Date.now(),
      check_period_sec: 300
    };
    api.user.setUserMetadata('plan', plan);
    console.log('default plan created');
    return plan;
  }
}

/**
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {string | null | undefined} providerAccessToken
* @param {object | null} planJustCreated
*/
function getUserClaim(event, providerAccessToken, planJustCreated) {
  const u = {};
  u.email = event.user.email;
  if (providerAccessToken) {
    u.auth = {};
    u.auth.access_token = providerAccessToken;
  }
  const plan = planJustCreated || event.user.user_metadata.plan;
  if (plan) {
    u.plan = {};
    u.plan.check_period_sec = plan.check_period_sec;
    u.plan.created_at = plan.created_at;
    u.plan.expires_at = plan.expires_at;
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
