const queryString = require('querystring');
const axios = require('axios');
require('dotenv').config();

const atlassianAuthTokenEndpoint = 'https://auth.atlassian.com/authorize';
const atlassianAccessTokenEndpoint = 'https://auth.atlassian.com/oauth/token'

const scopes = ['read:jira-work', 'write:jira-work', 'read:jira-user'];

const queryParams = {
    audience: 'api.atlassian.com',
    client_id: process.env.ATLASSIAN_CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: `http://localhost:3000${process.env.ATLASSIAN_REDIRECT_URI}`,
    /* Set this to a value that is associated with the user you are directing to the authorization URL, for example,
    a hash of the user's session ID. Make sure that this is a value that cannot be guessed. You may be able to generate
    and validate this value automatically, if you are using an OAuth 2.0 client library or an authentication library
    with OAuth 2.0 support. For more information, including why this parameter is required for security, see What is
    the state parameter used for? below.*/
    state: 'someState',
    response_type: 'code',
    prompt: 'consent'
}

const getAuthCodeUrl = `${atlassianAuthTokenEndpoint}?${queryString.stringify(queryParams)}`

const getAccessToken = async (authorizationCode) => {
    const accessTokenParams = {
        grant_type: 'authorization_code',
        client_id: process.env.ATLASSIAN_CLIENT_ID,
        client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
        code: authorizationCode,
        redirect_uri: `http://localhost:3000${process.env.ATLASSIAN_REDIRECT_URI}`,
    };

    return await axios.post(
        atlassianAccessTokenEndpoint,
        {
            ...accessTokenParams
        },
        {
            headers: {
                "Content-Type": 'application/json'
            }
        }
    )
}

const getAccessibleResources = async (accessToken) => {
    return await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {headers: {Authorization: `Bearer ${accessToken}`}})
}

const callJiraApi = async (apiEndpoint, cloudId, accessToken, method, body=null) => {
    const requestUrl = `https://api.atlassian.com/ex/jira/${cloudId}${apiEndpoint.charAt(0) === '/' ? apiEndpoint : '/' + apiEndpoint.toString}`;

    const requestParams = {method: method, url: requestUrl, headers: {Authorization: `Bearer ${accessToken}`}};

    if(body) {
        requestParams.body = body;
        requestParams.headers['Content-Type'] = 'application/json';
    }

    console.log(requestParams);
    return await axios.request(requestParams);
}

module.exports = {getAuthCodeUrl, getAccessToken, getAccessibleResources, callJiraApi};