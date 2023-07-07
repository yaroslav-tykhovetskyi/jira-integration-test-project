Need to create .env file with ATLASSIAN_CLIENT_ID, ATLASSIAN_CLIENT_SECRET and ATLASSIAN_REDIRECT_URI variables. 
ATLASSIAN_REDIRECT_URI should be equal to /api/auth/callback/atlassian.

You need to create app in Atlassian Developer Console and take CLIENT_ID, CLIENT_SECRET variables from there and paste them to .env.
You need to provide necessary permissions, as specified in jiraAuthUtils 'scopes'
