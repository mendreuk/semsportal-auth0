function login(email, password, callback) {
    const request = require('request');
  
  request.post({
    url: 'https://eu.semsportal.com/api/v2/Common/CrossLogin',
    headers: {
        'Token': '{"version":"v3.1","client":"ios","language":"en"}'
    },
    json: {
      account: email,
      pwd: password
    }
    //for more options check:
    //https://github.com/mikeal/request#requestoptions-callback
  }, function(err, response, body) {
    if (err) {
	console.log(err.message);
      return callback(new WrongUsernameOrPasswordError(email, err.message));
    }
    if (response.statusCode !== 200) {
	console.log(`response status: ${response.statusCode}`);
      return callback(new WrongUsernameOrPasswordError(email, `SemsPortal error status: ${response.statusCode}`));
    }
    if (body.code !== 0) {
	console.log(`response code: ${body.code}: body.msg`);
      return callback(new WrongUsernameOrPasswordError(email, `SemsPortal error code ${body.code}: ${body.msg}`));
    }
    
    console.log('login successful');
    callback(null, {
      user_id: body.data.uid,
      email: email,
      app_metadata: {
        auth: {
          provider: 'semsportal',
          password: Buffer.from(password).toString('base64')
        },
        plan: {
          created_at: Date.now(),
          check_period_sec: 300
        }
      }
	});
  });
}