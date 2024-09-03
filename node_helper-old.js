const NodeHelper = require("node_helper");
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

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

    getTasks: async function() {
        const oauth2Client = new OAuth2(
            'YOUR_CLIENT_ID', // Replace with your client ID
            'YOUR_CLIENT_SECRET', // Replace with your client secret
            'YOUR_REDIRECT_URL' // Replace with your redirect URL
        );

        // Set the credentials from your stored token
        oauth2Client.setCredentials({
            refresh_token: 'YOUR_REFRESH_TOKEN' // Replace with your refresh token
        });

        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

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
        const oauth2Client = new OAuth2(
            'YOUR_CLIENT_ID', // Replace with your client ID
            'YOUR_CLIENT_SECRET', // Replace with your client secret
            'YOUR_REDIRECT_URL' // Replace with your redirect URL
        );

        // Set the credentials from your stored token
        oauth2Client.setCredentials({
            refresh_token: 'YOUR_REFRESH_TOKEN' // Replace with your refresh token
        });

        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

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