const express = require('express');
const cors = require('cors');
const jiraAuthUtils = require('./jiraAuthUtils');
require('dotenv').config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send({exampleMessage: 'Some example message on \'/\' mapping!'})
})

/**
 * This endpoint redirects user to atlassian consent screen where he agrees with given permissions
 */
app.get('/getJiraAuthCode', async (req, res) => {
    try {
        res.redirect(jiraAuthUtils.getAuthCodeUrl);
    } catch (error) {
        res.sendStatus(500);
        console.log(error.message);
    }
})

/**
 * After sending user to consent screen, when he agrees, he is redirected here with 'state' and 'code' - jira authorization token,
 * from authorization token we can get many useful prompts, like user id in jira
 */
app.get('/api/auth/callback/atlassian', async (req, res) => {
    // ! get authorization token from request parameters
    const authorizationCode = req.query.code;

    // check if authCode is present(it will be present only in first request here)
    if(authorizationCode) {
        try {
            // ! get access token in exchange for out authorization code
            const response = await jiraAuthUtils.getAccessToken(authorizationCode);
            const {access_token} = response.data;
            console.log(response.data);

            // ! get accessible resources from jira API
            const accessibleResourcesResponse = await jiraAuthUtils.getAccessibleResources(access_token);
            const resources = accessibleResourcesResponse.data;
            console.log(resources);

            const resourceCloudId = resources[0].id;

            // get projects
            const projects = await jiraAuthUtils.callJiraApi('/rest/api/3/project', resourceCloudId, access_token, 'GET');

            // get current user info
            // const currentUser = await jiraAuthUtils.callJiraApi('/rest/api/3/myself?expand=groups', resourceCloudId, access_token, 'GET');

            // const serverInfo = await jiraAuthUtils.callJiraApi('/rest/api/3/serverInfo', resourceCloudId, access_token, 'GET');

            console.log(projects.data);
        } catch(error) {
            res.sendStatus(500);
        }
    }
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})