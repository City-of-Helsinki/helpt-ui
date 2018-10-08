import { createUserManager } from 'redux-oidc';

const OPENID_CONNECT_CLIENT_ID = window.CONFIG.OPENID_CONNECT_CLIENT_ID;

const userManagerConfig = {
  client_id: OPENID_CONNECT_CLIENT_ID,
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/callback`,
  response_type: 'id_token token',
  scope: 'openid profile https://api.hel.fi/auth/projects',
  authority: 'https://api.hel.fi/sso/openid/',
  silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/silent_renew.html`,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
