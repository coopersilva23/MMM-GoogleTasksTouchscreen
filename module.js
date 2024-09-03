Module.register("MMGoogleTasks", {
    defaults: {
        updateInterval: 60000, // Update interval in milliseconds
    },

    start: function() {
        this.getTasks();
        setInterval(() => {
            this.getTasks();
        }, this.config.updateInterval);
    },

    getTasks: function() {
        this.sendSocketNotification('GET_TASKS');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'TASKS_DATA') {
            this.tasks = payload.tasks;
            this.updateDom();
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        if (!this.tasks) {
            wrapper.innerHTML = "Loading tasks...";
            return wrapper;
        }

        var ul = document.createElement("ul");
        this.tasks.forEach(task => {
            var li = document.createElement("li");
            li.className = "task";
            li.dataset.taskId = task.id;
            li.innerHTML = task.title;
            li.addEventListener("click", () => {
                this.markTaskAsCompleted(task.id);
            });
            ul.appendChild(li);
        });

        wrapper.appendChild(ul);
        return wrapper;
    },

    markTaskAsCompleted: function(taskId) {
        this.sendSocketNotification('MARK_TASK_COMPLETED', taskId);
    }
});