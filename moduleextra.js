Module.register("MMGoogleTasks", {
    // Default module configuration
    defaults: {
        updateInterval: 5 * 60 * 1000, // Update every 5 minutes
        initialLoadDelay: 0, // Delay before initial load
        maxTasks: 10, // Maximum number of tasks to display
    },

    // Initialize the module
    start: function() {
        this.tasks = [];
        this.sendSocketNotification('GET_TASKS'); // Request tasks from node_helper
        setInterval(() => {
            this.sendSocketNotification('GET_TASKS');
        }, this.config.updateInterval);
    },

    // Get the DOM for the module
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.tasks.length === 0) {
            wrapper.innerHTML = "Loading tasks...";
            return wrapper;
        }

        var ul = document.createElement("ul");
        this.tasks.forEach(task => {
            var li = document.createElement("li");
            li.className = "task"; // Apply CSS class
            li.dataset.taskId = task.id;
            li.innerHTML = task.title;

            // Add click event listener to mark task as completed
            li.addEventListener("click", () => {
                this.markTaskAsCompleted(task.id);
            });

            ul.appendChild(li);
        });

        wrapper.appendChild(ul);
        return wrapper;
    },

    // Handle marking a task as completed
    markTaskAsCompleted: function(taskId) {
        this.sendSocketNotification('MARK_TASK_COMPLETED', taskId);
    },

    // Receive socket notifications from the node_helper
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'TASKS_DATA') {
            this.tasks = payload.tasks;
            this.updateDom(); // Refresh the DOM to show updated tasks
        }
    },

    // Load CSS for styling
    getStyles: function() {
        return ["styles.css"];
    }
});