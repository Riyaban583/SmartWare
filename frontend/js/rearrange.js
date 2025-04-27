// Global variables
let warehouseData = {
    zones: [],
    objectTypes: [],
    placedObjects: [],
    priorityDistribution: {
        high: 0,
        medium: 0,
        low: 0
    }
};

let charts = {
    priorityChart: null
};

let visualization = {
    scene: null,
    camera: null,
    renderer: null,
    objects: []
};

let currentCargoSpecs = null;
let websocket = null;

// DOM elements
const cargoForm = document.getElementById('cargoForm');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close-btn');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data
    fetchWarehouseData();

    // Set up event listeners
    setupEventListeners();

    // Initialize 3D visualization
    initializeVisualization();

    // Connect to WebSocket for real-time updates
    connectWebSocket();
});

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    cargoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cargoSpecs = {
            type: document.getElementById('cargoType').value,
            length: parseFloat(document.getElementById('cargoLength').value),
            width: parseFloat(document.getElementById('cargoWidth').value),
            height: parseFloat(document.getElementById('cargoHeight').value),
            weight: parseFloat(document.getElementById('cargoWeight').value),
            priority: document.getElementById('cargoPriority').value
        };
        
        // Store current specs for use in confirmation
        currentCargoSpecs = cargoSpecs;
        
        // Generate placement suggestions
        generatePlacementSuggestions(cargoSpecs);
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', fetchWarehouseData);
    
    // Settings button
    settingsBtn.addEventListener('click', function() {
        showNotification('Settings feature coming soon', 'warning');
    });
    
    // Modal close button
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Modal confirm button
    confirmBtn.addEventListener('click', function() {
        if (this.dataset.suggestion && currentCargoSpecs) {
            const suggestion = JSON.parse(this.dataset.suggestion);
            confirmPlacement(currentCargoSpecs, suggestion);
            modal.style.display = 'none';
        }
    });
    
    // Modal cancel button
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Connect to WebSocket for real-time updates
function connectWebSocket() {
    // In production, use your actual server URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/warehouse`;
    
    try {
        websocket = new WebSocket(wsUrl);
        
        websocket.onopen = function() {
            console.log('WebSocket connection established');
        };
        
        websocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };
        
        websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
        websocket.onclose = function() {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };
    } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
        // For demo purposes, fallback to polling
        setInterval(fetchWarehouseData, 10000);
    }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === 'warehouse_update') {
        // Update warehouse data
        warehouseData = data.data;
        updateDashboard();
    } else if (data.type === 'new_placement') {
        // Add new placement to visualization
        addObjectToVisualization(data.object);
        showNotification(`New object placed in ${data.object.zone}`, 'success');
    } else if (data.type === 'notification') {
        // Display notification
        showNotification(data.message, data.notificationType);
    }
}

// Fetch warehouse data from the backend
function fetchWarehouseData() {
    // For demo purposes, we'll use mock data
    // In production, this would be a fetch request to your Python backend
    fetch('/api/warehouse-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            warehouseData = data;
            updateDashboard();
        })
        .catch(error => {
            console.error('Error fetching warehouse data:', error);
            // Use mock data for demonstration
            generateMockData();
            updateDashboard();
        });
}

// Generate mock data for demonstration
function generateMockData() {
    // Create sample warehouse zones
    warehouseData.zones = [
        { id: 'zone-a', name: 'Zone A', capacity: 1000, used: 600, availability: 40 },
        { id: 'zone-b', name: 'Zone B', capacity: 800, used: 320, availability: 60 },
        { id: 'zone-c', name: 'Zone C', capacity: 1200, used: 300, availability: 75 },
        { id: 'zone-d', name: 'Zone D', capacity: 500, used: 450, availability: 10 }
    ];

    // Create sample object types
    warehouseData.objectTypes = [
        { type: 'container', length: 6.0, width: 2.4, height: 2.6, count: 25 },
        { type: 'pallet', length: 1.2, width: 1.0, height: 0.15, count: 150 },
        { type: 'box', length: 0.6, width: 0.4, height: 0.3, count: 320 },
        { type: 'barrel', length: 0.6, width: 0.6, height: 0.9, count: 78 }
    ];

    // Create sample placed objects
    warehouseData.placedObjects = [
        { id: 'obj-001', type: 'container', zone: 'zone-a', position: {x: 0, y: 0, z: 0}, priority: 'high' },
        { id: 'obj-002', type: 'container', zone: 'zone-a', position: {x: 6, y: 0, z: 0}, priority: 'high' },
        { id: 'obj-003', type: 'pallet', zone: 'zone-b', position: {x: 0, y: 0, z: 0}, priority: 'medium' },
        { id: 'obj-004', type: 'box', zone: 'zone-c', position: {x: 2, y: 1, z: 3}, priority: 'low' }
    ];

    // Calculate priority distribution
    warehouseData.priorityDistribution = {
        high: 35,
        medium: 45,
        low: 20
    };
}

// Update the dashboard with current data
function updateDashboard() {
    updateObjectsPlaced();
    updateDimensionsTable();
    updateSpaceAvailability();
    updatePriorityChart();
    updateVisualization();
}

// Update objects placed statistics
function updateObjectsPlaced() {
    const totalObjects = warehouseData.objectTypes.reduce((sum, type) => sum + type.count, 0);
    const efficiency = calculatePlacementEfficiency();
    
    document.getElementById('objectsPlaced').textContent = totalObjects;
    document.getElementById('placementEfficiency').textContent = `${efficiency}%`;
}

// Calculate placement efficiency (mock calculation)
function calculatePlacementEfficiency() {
    // In a real application, this would be a more complex calculation
    const totalCapacity = warehouseData.zones.reduce((sum, zone) => sum + zone.capacity, 0);
    const totalUsed = warehouseData.zones.reduce((sum, zone) => sum + zone.used, 0);
    
    const efficiency = Math.round((totalUsed / totalCapacity) * 100);
    return efficiency;
}

// Update dimensions table
function updateDimensionsTable() {
    const tableBody = document.querySelector('#dimensionsTable tbody');
    tableBody.innerHTML = '';
    
    warehouseData.objectTypes.forEach(type => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type.type.charAt(0).toUpperCase() + type.type.slice(1)}</td>
            <td>${type.length} m</td>
            <td>${type.width} m</td>
            <td>${type.height} m</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update space availability visualization
function updateSpaceAvailability() {
    const container = document.getElementById('spaceAvailability');
    container.innerHTML = '';
    
    warehouseData.zones.forEach(zone => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        
        // Determine color based on availability
        let color;
        if (zone.availability > 60) {
            color = 'var(--success-color)';
        } else if (zone.availability > 30) {
            color = 'var(--warning-color)';
        } else {
            color = 'var(--danger-color)';
        }
        
        progressItem.innerHTML = `
            <div class="progress-label">
                <span>${zone.name}</span>
                <span>${zone.availability}% Available</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${zone.availability}%; background-color: ${color}"></div>
            </div>
        `;
        
        container.appendChild(progressItem);
    });
}

// Update priority chart
function updatePriorityChart() {
    const ctx = document.createElement('canvas');
    document.getElementById('priorityChart').innerHTML = '';
    document.getElementById('priorityChart').appendChild(ctx);
    
    const data = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [
                warehouseData.priorityDistribution.high,
                warehouseData.priorityDistribution.medium,
                warehouseData.priorityDistribution.low
            ],
            backgroundColor: [
                'var(--danger-color)',
                'var(--warning-color)',
                'var(--success-color)'
            ],
            borderWidth: 0
        }]
    };
    
    // Destroy existing chart if it exists
    if (charts.priorityChart) {
        charts.priorityChart.destroy();
    }
    
    // Create new chart
    charts.priorityChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            cutout: '65%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Generate placement suggestions based on cargo specifications
function generatePlacementSuggestions(cargoSpecs = null) {
    const container = document.getElementById('suggestionContainer');
    
    // If no cargo specs provided, just clear the container
    if (!cargoSpecs) {
        container.innerHTML = '<p>Submit cargo details to get placement suggestions.</p>';
        return;
    }
    
    // Clear previous suggestions
    container.innerHTML = '';
    
    // In production, send request to backend for algorithm-based suggestions
    fetch('/api/suggest-placement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cargoSpecs)
    })
    .then(response => response.json())
    .then(suggestions => {
        displaySuggestions(suggestions, cargoSpecs);
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
        // Fallback to mock suggestions for demo
        const mockSuggestions = generateMockSuggestions(cargoSpecs);
        displaySuggestions(mockSuggestions, cargoSpecs);
    });
}

// Display suggestions in the UI
function displaySuggestions(suggestions, cargoSpecs) {
    const container = document.getElementById('suggestionContainer');
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p>No suitable placement locations found. Try adjusting cargo dimensions or priority.</p>';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        
        card.innerHTML = `
            <div class="suggestion-header">${suggestion.zone}</div>
            <div class="suggestion-info">
                <p>Position: X:${suggestion.position.x}, Y:${suggestion.position.y}, Z:${suggestion.position.z}</p>
                <p>Accessibility: ${suggestion.accessibility}%</p>
            </div>
            <div class="suggestion-score">Fit Score: ${suggestion.fitScore}%</div>
            <button class="select-btn" data-suggestion='${JSON.stringify(suggestion)}'>Select</button>
        `;
        
        container.appendChild(card);
    });
    
    // Add event listeners to select buttons
    document.querySelectorAll('.select-btn').forEach(button => {
        button.addEventListener('click', function() {
            const suggestion = JSON.parse(this.dataset.suggestion);
            showPlacementConfirmation(cargoSpecs, suggestion);
        });
    });
}

// Generate mock suggestions (in a real app, this would use algorithms)
function generateMockSuggestions(cargoSpecs) {
    // Find zones with enough space
    const availableZones = warehouseData.zones.filter(zone => zone.availability > 15);
    
    // If no zones available, return empty array
    if (availableZones.length === 0) {
        return [];
    }
    
    // Generate suggestions for up to 3 zones
    return availableZones.slice(0, 3).map((zone, index) => {
        // Calculate a realistic fit score based on available space and priority
        const baseScore = 50 + Math.random() * 40;
        
        // Adjust score based on priority matching
        let priorityBonus = 0;
        if (cargoSpecs.priority === 'high' && zone.availability < 30) {
            priorityBonus = 10; // High priority items get bonus for less trafficked areas
        } else if (cargoSpecs.priority === 'low' && zone.availability > 60) {
            priorityBonus = 15; // Low priority items get bonus for high availability zones
        }
        
        // Calculate final score and round to whole number
        const fitScore = Math.min(98, Math.round(baseScore + priorityBonus));
        
        // Generate realistic position coordinates
        const position = {
            x: Math.round(Math.random() * 10),
            y: Math.round(Math.random() * 3),
            z: Math.round(Math.random() * 5)
        };
        
        // Calculate mock accessibility score (in a real app this would be more complex)
        const accessibility = Math.round(40 + Math.random() * 55);
        
        return {
            zone: zone.name,
            zoneId: zone.id,
            position: position,
            fitScore: fitScore,
            accessibility: accessibility
        };
    });
}

// Show placement confirmation modal
function showPlacementConfirmation(cargoSpecs, suggestion) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    modalTitle.textContent = 'Confirm Placement';
    
    modalContent.innerHTML = `
        <div class="placement-details">
            <h3>Cargo Details</h3>
            <p><strong>Type:</strong> ${cargoSpecs.type}</p>
            <p><strong>Dimensions:</strong> ${cargoSpecs.length}m × ${cargoSpecs.width}m × ${cargoSpecs.height}m</p>
            <p><strong>Weight:</strong> ${cargoSpecs.weight} kg</p>
            <p><strong>Priority:</strong> ${cargoSpecs.priority}</p>
            
            <h3>Suggested Placement</h3>
            <p><strong>Zone:</strong> ${suggestion.zone}</p>
            <p><strong>Position:</strong> X:${suggestion.position.x}, Y:${suggestion.position.y}, Z:${suggestion.position.z}</p>
            <p><strong>Fit Score:</strong> ${suggestion.fitScore}%</p>
            <p><strong>Accessibility:</strong> ${suggestion.accessibility}%</p>
        </div>
    `;
    
    // Store suggestion data for use in confirm action
    confirmBtn.dataset.suggestion = JSON.stringify(suggestion);
    confirmBtn.dataset.cargoSpecs = JSON.stringify(cargoSpecs);
    
    // Show the modal
    modal.style.display = 'block';
}

// Confirm placement of cargo
function confirmPlacement(cargoSpecs, suggestion) {
    // Create placement object
    const placement = {
        cargoSpecs: cargoSpecs,
        placement: suggestion,
        timestamp: new Date().toISOString()
    };
    
    // In production, send to backend
    fetch('/api/confirm-placement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(placement)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success notification
            showNotification('Cargo placement confirmed', 'success');
            
            // Update local data
            updateAfterPlacement(cargoSpecs, suggestion);
        } else {
            showNotification('Error confirming placement: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error confirming placement:', error);
        
        // For demo, simulate success anyway
        showNotification('Cargo placement confirmed (demo mode)', 'success');
        updateAfterPlacement(cargoSpecs, suggestion);
    });
}

// Update local data after placement
function updateAfterPlacement(cargoSpecs, suggestion) {
    // Create new object ID
    const objectId = 'obj-' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');
    
    // Create new placed object
    const newObject = {
        id: objectId,
        type: cargoSpecs.type,
        zone: suggestion.zoneId,
        position: suggestion.position,
        priority: cargoSpecs.priority,
        dimensions: {
            length: cargoSpecs.length,
            width: cargoSpecs.width,
            height: cargoSpecs.height
        },
        weight: cargoSpecs.weight,
        placedAt: new Date().toISOString()
    };
    
    // Add to placed objects
    warehouseData.placedObjects.push(newObject);
    
    // Update object counts
    const typeIndex = warehouseData.objectTypes.findIndex(type => type.type === cargoSpecs.type);
    if (typeIndex !== -1) {
        warehouseData.objectTypes[typeIndex].count++;
    }
    
    // Update zone usage
    const zoneIndex = warehouseData.zones.findIndex(zone => zone.id === suggestion.zoneId);
    if (zoneIndex !== -1) {
        // Calculate object volume (simplified)
        const volume = cargoSpecs.length * cargoSpecs.width * cargoSpecs.height;
        
        // Update zone usage
        warehouseData.zones[zoneIndex].used += volume;
        
        // Recalculate availability
        warehouseData.zones[zoneIndex].availability = Math.max(
            0,
            Math.round(100 - (warehouseData.zones[zoneIndex].used / warehouseData.zones[zoneIndex].capacity * 100))
        );
    }
    
    // Update priority distribution
    const totalObjects = warehouseData.placedObjects.length;
    const highPriority = warehouseData.placedObjects.filter(obj => obj.priority === 'high').length;
    const mediumPriority = warehouseData.placedObjects.filter(obj => obj.priority === 'medium').length;
    const lowPriority = warehouseData.placedObjects.filter(obj => obj.priority === 'low').length;
    
    warehouseData.priorityDistribution = {
        high: Math.round(highPriority / totalObjects * 100),
        medium: Math.round(mediumPriority / totalObjects * 100),
        low: Math.round(lowPriority / totalObjects * 100)
    };
    
    // Update dashboard
    updateDashboard();
    
    // Add to visualization
    addObjectToVisualization(newObject);
    
    // Clear form
    cargoForm.reset();
    
    // Clear suggestions
    document.getElementById('suggestionContainer').innerHTML = '<p>Submit cargo details to get placement suggestions.</p>';
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notificationContainer');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<p>${message}</p>`;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize 3D visualization
function initializeVisualization() {
    try {
        // Create scene
        visualization.scene = new THREE.Scene();
        visualization.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        visualization.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            document.getElementById('visualizationContainer').clientWidth / 
            document.getElementById('visualizationContainer').clientHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        visualization.camera.position.set(15, 10, 15);
        visualization.camera.lookAt(0, 0, 0);
        
        // Create renderer
        visualization.renderer = new THREE.WebGLRenderer({ antialias: true });
        visualization.renderer.setSize(
            document.getElementById('visualizationContainer').clientWidth,
            document.getElementById('visualizationContainer').clientHeight
        );
        document.getElementById('visualizationContainer').appendChild(visualization.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        visualization.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        visualization.scene.add(directionalLight);
        
        // Add floor grid
        const gridHelper = new THREE.GridHelper(20, 20);
        visualization.scene.add(gridHelper);
        
        // Add zones visualization
        addZonesToVisualization();
        
        // Add existing objects
        warehouseData.placedObjects.forEach(obj => {
            addObjectToVisualization(obj);
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            visualization.renderer.render(visualization.scene, visualization.camera);
        }
        animate();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            const width = document.getElementById('visualizationContainer').clientWidth;
            const height = document.getElementById('visualizationContainer').clientHeight;
            
            visualization.camera.aspect = width / height;
            visualization.camera.updateProjectionMatrix();
            visualization.renderer.setSize(width, height);
        });
    } catch (error) {
        console.error('Error initializing visualization:', error);
        document.getElementById('visualizationContainer').innerHTML = '<p>3D visualization not available. Try using a browser with WebGL support.</p>';
    }
}

// Add zones to visualization
function addZonesToVisualization() {
    // Define zone colors
    const zoneColors = {
        'zone-a': 0x3a86ff,
        'zone-b': 0xff006e,
        'zone-c': 0x8338ec,
        'zone-d': 0xffbe0b
    };
    
    // Add each zone as a semi-transparent plane
    warehouseData.zones.forEach((zone, index) => {
        const size = 5; // Size of zone
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            color: zoneColors[zone.id] || 0xcccccc,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2; // Rotate to horizontal
        plane.position.set(index * 5, 0, 0); // Position zones side by side
        plane.userData.zoneId = zone.id;
        
        visualization.scene.add(plane);
    });
}

// Add object to visualization
function addObjectToVisualization(obj) {
    try {
        // Find object type dimensions
        const objectType = warehouseData.objectTypes.find(type => type.type === obj.type);
        if (!objectType) return;
        
        // Use dimensions from object if available, otherwise use type dimensions
        const length = obj.dimensions ? obj.dimensions.length : objectType.length;
        const width = obj.dimensions ? obj.dimensions.width : objectType.width;
        const height = obj.dimensions ? obj.dimensions.height : objectType.height;
        
        // Create geometry based on object type
        let geometry;
        if (obj.type === 'barrel') {
            // Use cylinder for barrels
            geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 16);
        } else {
            // Use box for other types
            geometry = new THREE.BoxGeometry(length, height, width);
        }
        
        // Set color based on priority
        let color;
        switch (obj.priority) {
            case 'high':
                color = 0xff5400; // orange-red
                break;
            case 'medium':
                color = 0xffbe0b; // yellow
                break;
            case 'low':
                color = 0x38b000; // green
                break;
            default:
                color = 0xcccccc; // gray
        }
        
        // Create material
        const material = new THREE.MeshLambertMaterial({ color: color });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position the object
        const zoneIndex = warehouseData.zones.findIndex(zone => zone.id === obj.zone);
        const xOffset = zoneIndex * 5; // Align with zone
        
        mesh.position.set(
            xOffset + obj.position.x, 
            height / 2 + obj.position.y, // Place on ground, adjusted for object height
            obj.position.z
        );
        
        // Store reference to the object
        mesh.userData.objectId = obj.id;
        
        // Add to scene
        visualization.scene.add(mesh);
        visualization.objects.push(mesh);
    } catch (error) {
        console.error('Error adding object to visualization:', error, obj);
    }
}

// Update visualization
function updateVisualization() {
    // Remove all existing objects
    visualization.objects.forEach(obj => {
        visualization.scene.remove(obj);
    });
    visualization.objects = [];
    
    // Add all objects back
    warehouseData.placedObjects.forEach(obj => {
        addObjectToVisualization(obj);
    });
}