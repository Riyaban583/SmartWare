// Constants for efficiency
const ACTIVITY_CODES = {
    "EVA": 1,      // Extravehicular Activity
    "MAINT": 2,    // Maintenance
    "EXP": 3,      // Experiment
    "REST": 4,     // Rest period
    "EX": 5,       // Exercise
    "MEAL": 6,     // Meal time
    "COMM": 7,     // Communication with ground
    "EMER": 8      // Emergency procedure
};

const LOCATION_NAMES = {
    "1": "Module A",
    "2": "Module B",
    "3": "Module C",
    "4": "Airlock",
    "5": "External"
};

const ACTIVITY_NAMES = {
    "EVA": "Extravehicular Activity",
    "MAINT": "Maintenance",
    "EXP": "Experiment",
    "REST": "Rest Period",
    "EX": "Exercise",
    "MEAL": "Meal Time",
    "COMM": "Communication",
    "EMER": "Emergency Procedure"
};

// Main logger class
class AstronautLogger {
    constructor() {
        this.logs = [];
        this.activeAstronauts = {};
        this.initFromStorage();
        this.setupEventListeners();
        this.updateStats();
    }

    // Initialize from localStorage to maintain persistence
    initFromStorage() {
        try {
            const storedLogs = localStorage.getItem('astronautLogs');
            if (storedLogs) {
                this.logs = JSON.parse(storedLogs);
                this.renderLogs();
                this.populateFilters();
            }
        } catch (e) {
            console.error('Error loading logs from storage:', e);
            // Create fresh storage if corrupted
            localStorage.setItem('astronautLogs', JSON.stringify([]));
        }
    }

    // Set up UI event handlers
    setupEventListeners() {
        document.getElementById('start-activity').addEventListener('click', () => this.startActivity());
        document.getElementById('end-activity').addEventListener('click', () => this.endActivity());
        document.getElementById('log-search').addEventListener('input', () => this.filterLogs());
        document.getElementById('filter-astronaut').addEventListener('change', () => this.filterLogs());
        document.getElementById('filter-activity').addEventListener('change', () => this.filterLogs());
    }

    // Start a new activity
    startActivity() {
        const astronautId = document.getElementById('astronaut-id').value.trim();
        if (!astronautId) {
            alert('Please enter an Astronaut ID');
            return;
        }
        
        // Check if astronaut is already active
        if (this.activeAstronauts[astronautId]) {
            alert(`Astronaut ${astronautId} is already performing an activity. End current activity first.`);
            return;
        }
        
        const activity = document.getElementById('activity-type').value;
        const location = document.getElementById('location').value;
        const timestamp = Date.now();
        
        // Store active astronaut data
        this.activeAstronauts[astronautId] = {
            activity,
            location,
            startTime: timestamp
        };
        
        // Notify user
        alert(`Started ${ACTIVITY_NAMES[activity]} for Astronaut ${astronautId}`);
    }

    // End an active activity
    endActivity() {
        const astronautId = document.getElementById('astronaut-id').value.trim();
        if (!astronautId) {
            alert('Please enter an Astronaut ID');
            return;
        }
        
        // Check if astronaut has an active activity
        if (!this.activeAstronauts[astronautId]) {
            alert(`No active activity found for Astronaut ${astronautId}`);
            return;
        }
        
        const astronaut = this.activeAstronauts[astronautId];
        const endTime = Date.now();
        const duration = Math.round((endTime - astronaut.startTime) / 60000); // Convert to minutes
        
        // Create log entry (compressed binary-like format for efficiency)
        const logEntry = {
            timestamp: astronaut.startTime,
            astronautId,
            activityCode: ACTIVITY_CODES[astronaut.activity],
            activity: astronaut.activity,
            duration: duration || parseInt(document.getElementById('duration').value), // Use calculated or manual duration
            location: astronaut.location,
            endTime
        };
        
        // Add to logs and update storage
        this.logs.unshift(logEntry); // Add to beginning for most recent first
        this.saveToStorage();
        this.renderLogs();
        this.populateFilters();
        this.updateStats();
        
        // Clear active astronaut
        delete this.activeAstronauts[astronautId];
        
        // Notify user
        alert(`Ended ${ACTIVITY_NAMES[astronaut.activity]} for Astronaut ${astronautId} (${duration} minutes)`);
    }

    // Save logs to local storage (compressed format)
    saveToStorage() {
        try {
            localStorage.setItem('astronautLogs', JSON.stringify(this.logs));
        } catch (e) {
            console.error('Error saving to storage:', e);
            alert('Warning: Unable to save log data. Storage may be full.');
        }
    }

    // Render logs to the table
    renderLogs() {
        const tbody = document.getElementById('log-entries');
        tbody.innerHTML = '';
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        this.logs.forEach(log => {
            const row = document.createElement('tr');
            
            // Format timestamp
            const date = new Date(log.timestamp);
            const timeString = date.toLocaleString();
            
            row.innerHTML = `
                <td>${timeString}</td>
                <td>${log.astronautId}</td>
                <td>${ACTIVITY_NAMES[log.activity]}</td>
                <td>${log.duration} min</td>
                <td>${LOCATION_NAMES[log.location]}</td>
            `;
            
            fragment.appendChild(row);
        });
        
        tbody.appendChild(fragment);
    }

    // Populate filter dropdowns
    populateFilters() {
        const astronautFilter = document.getElementById('filter-astronaut');
        const activityFilter = document.getElementById('filter-activity');
        
        // Clear previous options but keep the default
        while (astronautFilter.options.length > 1) {
            astronautFilter.remove(1);
        }
        
        while (activityFilter.options.length > 1) {
            activityFilter.remove(1);
        }
        
        // Get unique astronauts and activities
        const astronauts = [...new Set(this.logs.map(log => log.astronautId))];
        const activities = [...new Set(this.logs.map(log => log.activity))];
        
        // Add options
        astronauts.forEach(astronaut => {
            const option = document.createElement('option');
            option.value = astronaut;
            option.textContent = astronaut;
            astronautFilter.appendChild(option);
        });
        
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = ACTIVITY_NAMES[activity];
            activityFilter.appendChild(option);
        });
    }

    // Filter logs based on search and filters
    filterLogs() {
        const searchTerm = document.getElementById('log-search').value.toLowerCase();
        const astronautFilter = document.getElementById('filter-astronaut').value;
        const activityFilter = document.getElementById('filter-activity').value;
        
        const rows = document.getElementById('log-entries').getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const astronautCell = row.getElementsByTagName('td')[1];
            const activityCell = row.getElementsByTagName('td')[2];
            
            if (!astronautCell || !activityCell) continue;
            
            const astronaut = astronautCell.textContent;
            const activity = activityCell.textContent;
            const rowText = row.textContent.toLowerCase();
            
            const matchesSearch = !searchTerm || rowText.includes(searchTerm);
            const matchesAstronaut = !astronautFilter || astronaut === astronautFilter;
            const matchesActivity = !activityFilter || activity === ACTIVITY_NAMES[activityFilter];
            
            row.style.display = (matchesSearch && matchesAstronaut && matchesActivity) ? '' : 'none';
        }
    }

    // Update statistics display
    updateStats() {
        // Calculate total EVA time
        const totalEVA = this.logs
            .filter(log => log.activity === 'EVA')
            .reduce((total, log) => total + log.duration, 0);
        
        // Count activities today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activitiesToday = this.logs.filter(log => new Date(log.timestamp) >= today).length;
        
        // Update UI
        document.getElementById('total-eva').textContent = `${totalEVA} min`;
        document.getElementById('activities-today').textContent = activitiesToday;
        
        // Simulate power usage analysis
        const powerUsage = this.calculatePowerUsage();
        document.getElementById('power-usage').textContent = powerUsage;
    }

    // Calculate simulated power usage based on log patterns
    calculatePowerUsage() {
        const recentLogs = this.logs.slice(0, 20); // Only consider recent logs
        const totalDuration = recentLogs.reduce((total, log) => total + log.duration, 0);
        
        // Higher power activities
        const highPowerActivities = recentLogs.filter(log => 
            log.activity === 'EVA' || log.activity === 'MAINT' || log.activity === 'EXP'
        ).length;
        
        const powerScore = (totalDuration / 100) + (highPowerActivities * 2);
        
        if (powerScore < 5) return 'Low';
        if (powerScore < 10) return 'Moderate';
        return 'High';
    }
}

// Initialize the logger when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.logger = new AstronautLogger();
});