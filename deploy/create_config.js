
const fs = require('fs');

function create() {
  if (process.env.API_URL) {
    const config = {
      API_URL: process.env.API_URL,
      // The SSO OpenId Connect client id
      OPENID_CONNECT_CLIENT_ID: process.env.OPENID_CONNECT_CLIENT_ID,
      // A test user uuid for open id connect
      // if you wish to play with the mock API using
      // a real login flow
      TEST_USER_UUID: process.env.TEST_USER_UUID
    };
    fs.writeFileSync(process.env.WEB_ROOT + '/config.js', `window.CONFIG = ${JSON.stringify(config)}`, {encoding: 'utf8'});
    console.log("Environment configuration saved");
    return 0;
  } else {
    console.log('CONFIGURATION ERROR');
    console.log('configuration environmental variables missing');
    return 1;
  }
}

process.exit(create());
