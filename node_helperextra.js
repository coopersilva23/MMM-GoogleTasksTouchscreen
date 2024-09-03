const NodeHelper = require("node_helper");
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Paths to your credentials and token files
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node_helper for Google Tasks");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_TASKS') {
            this.getTasks();
        } else if (notification === 'MARK_TASK_COMPLETED') {
            this.markTaskAsCompleted(payload);
        }
    },

    // Load OAuth2 client with credentials and token
    authorize: async function() {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
        const { client_id, client_secret, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Load previously stored token
        try {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
            oAuth2Client.setCredentials(token);
        } catch (error) {
            console.error('Error loading token:', error);
            return null;
        }

        // Check if the token is expired and refresh it if necessary
        if (oAuth2Client.isTokenExpiring()) {
            try {
                const { credentials: refreshedToken } = await oAuth2Client.refreshAccessToken();
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(refreshedToken));
                oAuth2Client.setCredentials(refreshedToken);
            } catch (error) {
                console.error('Error refreshing token:', error);
                return null;
            }
        }

        return oAuth2Client;
    },

    getTasks: async function() {
        const oAuth2Client = await this.authorize();
        if (!oAuth2Client) return;

        const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

        try {
            const res = await tasks.tasks.list({
                tasklist: '@default',
                maxResults: 10
            });
            this.sendSocketNotification('TASKS_DATA', { tasks: res.data.items });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    },

    markTaskAsCompleted: async function(taskId) {
        const oAuth2Client = await this.authorize();
        if (!oAuth2Client) return;

        const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

        try {
            await tasks.tasks.update({
                tasklist: '@default',
                task: taskId,
                requestBody: {
                    status: 'completed'
                }
            });
            // Update the task list after marking the task as completed
            this.getTasks();
        } catch (error) {
            console.error('Error marking task as completed:', error);
        }
    }
});