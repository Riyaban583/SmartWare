// Configuration and Constants
const STORAGE_CONFIG = {
    totalCapacity: 100, // cubic meters
    usedCapacity: 70,   // cubic meters
    alertThreshold: 0.9, // 90% capacity is concerning
    criticalThreshold: 0.95 // 95% capacity is critical
};

// Sample inventory data - in a real application, this would come from a database
const storageItems = [
    {
        id: 1,
        name: "Food Rations",
        category: "Supplies",
        location: "Bay A, Section 1",
        volume: 12, // cubic meters
        priority: "High",
        lastAccessed: "2025-03-10",
        expirationDate: "2025-09-15",
        movable: true,
        fragility: "Low"
    },
    {
        id: 2,
        name: "Scientific Equipment",
        category: "Research",
        location: "Bay B, Section 3",
        volume: 8,
        priority: "Medium",
        lastAccessed: "2025-03-05",
        expirationDate: null,
        movable: true,
        fragility: "High"
    },
    {
        id: 3,
        name: "Backup Life Support",
        category: "Critical Systems",
        location: "Bay A, Section 2",
        volume: 15,
        priority: "Critical",
        lastAccessed: "2025-02-20",
        expirationDate: null,
        movable: false,
        fragility: "High"
    },
    {
        id: 4,
        name: "Spare Parts",
        category: "Maintenance",
        location: "Bay C, Section 1",
        volume: 10,
        priority: "Medium",
        lastAccessed: "2025-03-15",
        expirationDate: null,
        movable: true,
        fragility: "Medium"
    },
    {
        id: 5,
        name: "Medical Supplies",
        category: "Medical",
        location: "Bay A, Section 3",
        volume: 6,
        priority: "High",
        lastAccessed: "2025-03-08",
        expirationDate: "2026-01-20",
        movable: true,
        fragility: "Medium"
    },
    {
        id: 6,
        name: "Personal Items",
        category: "Crew",
        location: "Bay D, Section 2",
        volume: 9,
        priority: "Low",
        lastAccessed: "2025-03-12",
        expirationDate: null,
        movable: true,
        fragility: "Low"
    },
    {
        id: 7,
        name: "Water Reserves",
        category: "Supplies",
        location: "Bay B, Section 2",
        volume: 14,
        priority: "High",
        lastAccessed: "2025-03-01",
        expirationDate: "2025-10-30",
        movable: true,
        fragility: "Low"
    },
    {
        id: 8,
        name: "EVA Equipment",
        category: "Operations",
        location: "Bay C, Section 3",
        volume: 11,
        priority: "Medium",
        lastAccessed: "2025-02-25",
        expirationDate: null,
        movable: true,
        fragility: "High"
    }
];

// Storage zones data
const storageZones = [
    {
        id: "bay-a",
        name: "Bay A",
        capacity: 35,
        used: 33,
        sections: ["Section 1", "Section 2", "Section 3"],
        specialConditions: null
    },
    {
        id: "bay-b",
        name: "Bay B",
        capacity: 30,
        used: 22,
        sections: ["Section 1", "Section 2", "Section 3"],
        specialConditions: null
    },
    {
        id: "bay-c",
        name: "Bay C",
        capacity: 25,
        used: 21,
        sections: ["Section 1", "Section 2", "Section 3"],
        specialConditions: "Temperature controlled"
    },
    {
        id: "bay-d",
        name: "Bay D",
        capacity: 20,
        used: 14,
        sections: ["Section 1", "Section 2"],
        specialConditions: "Low traffic area"
    }
];

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    updateStorageStats();
    
    // Event Listeners
    document.getElementById('analyze-btn').addEventListener('click', analyzeSpaceRequirements);
    
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    document.getElementById('approve-btn').addEventListener('click', approveRearrangement);
    document.getElementById('modify-btn').addEventListener('click', modifyRearrangementPlan);
    document.getElementById('cancel-btn').addEventListener('click', cancelRearrangement);
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('confirmation-modal').style.display = 'none';
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('confirmation-modal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('confirmation-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Update storage statistics display
function updateStorageStats() {
    document.getElementById('total-capacity').textContent = `${STORAGE_CONFIG.totalCapacity} cubic meters`;
    document.getElementById('used-capacity').textContent = `${STORAGE_CONFIG.usedCapacity} cubic meters`;
    document.getElementById('available-capacity').textContent = `${STORAGE_CONFIG.totalCapacity - STORAGE_CONFIG.usedCapacity} cubic meters`;
    
    const usedPercentage = (STORAGE_CONFIG.usedCapacity / STORAGE_CONFIG.totalCapacity) * 100;
    const progressBar = document.getElementById('capacity-progress');
    progressBar.style.width = `${usedPercentage}%`;
    
    // Change color based on capacity thresholds
    if (usedPercentage >= STORAGE_CONFIG.criticalThreshold * 100) {
        progressBar.style.backgroundColor = 'var(--danger)';
    } else if (usedPercentage >= STORAGE_CONFIG.alertThreshold * 100) {
        progressBar.style.backgroundColor = 'var(--warning)';
    } else {
        progressBar.style.backgroundColor = 'var(--accent)';
    }
}

// Analyze space requirements for new shipment
function analyzeSpaceRequirements() {
    // Get shipment details from form
    const shipmentVolume = parseFloat(document.getElementById('shipment-volume').value);
    const shipmentPriority = document.getElementById('shipment-priority').value;
    const shipmentContents = document.getElementById('shipment-contents').value;
    
    // Check if there's enough space
    const availableSpace = STORAGE_CONFIG.totalCapacity - STORAGE_CONFIG.usedCapacity;
    
    // Show optimization section
    const optimizationSection = document.getElementById('optimization-section');
    optimizationSection.style.display = 'block';
    
    const spaceAlert = document.getElementById('space-alert');
    const alertMessage = document.getElementById('alert-message');
    
    if (shipmentVolume <= availableSpace) {
        // Enough space available
        spaceAlert.className = 'alert success';
        alertMessage.textContent = `There's enough space for this shipment. ${availableSpace} cubic meters available, ${shipmentVolume} cubic meters needed.`;
        
        // Still suggest optimization if we'll be close to capacity
        if ((STORAGE_CONFIG.usedCapacity + shipmentVolume) / STORAGE_CONFIG.totalCapacity >= STORAGE_CONFIG.alertThreshold) {
            alertMessage.textContent += ' However, storage will be near capacity after this shipment. Consider optimization.';
            
            // Generate simple rearrangement suggestions
            generateOptimizationSuggestions(shipmentVolume, shipmentPriority, false);
        } else {
            // Hide the tabs and show simple storage assignment
            document.querySelector('.tabs').style.display = 'none';
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            document.getElementById('items-to-move').style.display = 'block';
            document.getElementById('items-to-move-body').innerHTML = '<tr><td colspan="5">No rearrangement needed. Proceed with standard placement.</td></tr>';
        }
    } else {
        // Not enough space, need to optimize
        spaceAlert.className = 'alert danger';
        alertMessage.textContent = `Space shortage detected! Need ${(shipmentVolume - availableSpace).toFixed(1)} more cubic meters. Rearrangement required.`;
        
        // Generate rearrangement suggestions
        generateOptimizationSuggestions(shipmentVolume, shipmentPriority, true);
    }
    
    // Scroll to optimization section
    optimizationSection.scrollIntoView({ behavior: 'smooth' });
}

// Find optimal new location for an item
function findOptimalNewLocation(item, currentBay) {
    // Find zones with available space, excluding the current location
    const candidateZones = storageZones.filter(zone => {
        // Skip current bay
        if (zone.name === currentBay) return false;
        
        // Check if zone has enough space
        return (zone.capacity - zone.used) >= item.volume;
    }).sort((a, b) => {
        // Sort by available space (prefer zones with more available space)
        const aAvailable = a.capacity - a.used;
        const bAvailable = b.capacity - b.used;
        return bAvailable - aAvailable;
    });
    
    if (candidateZones.length > 0) {
        // Select first section in the best zone
        const bestZone = candidateZones[0];
        const section = bestZone.sections[0];
        return `${bestZone.name}, ${section}`;
    }
    
    return null; // No suitable location found
}

// Generate optimization suggestions
function generateOptimizationSuggestions(shipmentVolume, shipmentPriority, isRequired) {
    // The goal is to free up enough space for the new shipment
    const availableSpace = STORAGE_CONFIG.totalCapacity - STORAGE_CONFIG.usedCapacity;
    const spaceNeeded = isRequired ? 
        shipmentVolume - availableSpace : 
        0;
    
    // Determine items that can be moved based on various factors
    const movableItems = storageItems.filter(item => {
        // Don't move critical items unless absolutely necessary
        if (item.priority === "Critical" && !isRequired) return false;
        // Don't move immovable items
        if (!item.movable) return false;
        // Prefer to move low priority items
        return true;
    }).sort((a, b) => {
        // Sort by priority (move lower priority items first)
        const priorityOrder = { "Low": 0, "Medium": 1, "High": 2, "Critical": 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Identify items to move
    const itemsToMove = [];
    let spaceRecovered = 0;
    
    for (const item of movableItems) {
        if (isRequired && spaceRecovered >= spaceNeeded) break;
        
        // Find optimal new location for this item
        const currentLocation = item.location.split(', ')[0]; // e.g., "Bay A"
        const newLocation = findOptimalNewLocation(item, currentLocation);
        
        if (newLocation) {
            itemsToMove.push({
                ...item,
                newLocation: newLocation
            });
            spaceRecovered += item.volume;
        }
    }
    
    // Update the "Items to Move" table
    const tableBody = document.getElementById('items-to-move-body');
    tableBody.innerHTML = '';
    
    if (itemsToMove.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No suitable items found for rearrangement.</td></tr>';
    } else {
        itemsToMove.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.location}</td>
                <td>${item.volume} m³</td>
                <td>${item.priority}</td>
                <td>${item.newLocation}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update space recovered display
    document.getElementById('space-recovered').textContent = spaceRecovered.toFixed(1);
    
    // Update new arrangement tab
    updateNewArrangementTab(itemsToMove);
    
    // Update visualization tab
    updateVisualizationTab(itemsToMove, shipmentVolume);
    
    // Show rearrangement summary
    updateRearrangementSummary(itemsToMove, spaceRecovered, shipmentVolume, isRequired);
    
    // Show the tabs
    document.querySelector('.tabs').style.display = 'flex';
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'block';
    });
    document.querySelector('.tab-btn').click(); // Activate first tab
    
    // Generate tasks for the confirmation modal
    generateTasks(itemsToMove);
}

// Update the new arrangement tab with rearrangement plan
function updateNewArrangementTab(itemsToMove) {
    const zonesContainer = document.getElementById('zones-container');
    zonesContainer.innerHTML = '';
    
    // Create a deep copy of storage zones to simulate the new arrangement
    const newArrangement = JSON.parse(JSON.stringify(storageZones));
    
    // Update the usage in each zone based on moves
    itemsToMove.forEach(item => {
        const oldBay = item.location.split(', ')[0]; // e.g., "Bay A"
        const newBay = item.newLocation.split(', ')[0]; // e.g., "Bay B"
        
        // Find the zone objects
        const oldZone = newArrangement.find(zone => zone.name === oldBay);
        const newZone = newArrangement.find(zone => zone.name === newBay);
        
        if (oldZone && newZone) {
            // Update usage
            oldZone.used -= item.volume;
            newZone.used += item.volume;
        }
    });
    
    // Display the new arrangement
    newArrangement.forEach(zone => {
        const zoneEl = document.createElement('div');
        zoneEl.className = 'zone';
        
        // Check if this zone is affected by optimization
        const isOptimized = itemsToMove.some(item => 
            item.location.startsWith(zone.name) || 
            item.newLocation.startsWith(zone.name)
        );
        
        if (isOptimized) {
            zoneEl.classList.add('optimized');
        }
        
        const usedPercentage = (zone.used / zone.capacity * 100).toFixed(1);
        
        zoneEl.innerHTML = `
            <h4>${zone.name}</h4>
            <p>Capacity: ${zone.capacity} m³</p>
            <p>Used: ${zone.used.toFixed(1)} m³ (${usedPercentage}%)</p>
            <p>Available: ${(zone.capacity - zone.used).toFixed(1)} m³</p>
        `;
        
        zonesContainer.appendChild(zoneEl);
    });
    
    // Update arrangement notes
    const notesEl = document.getElementById('arrangement-notes');
    notesEl.innerHTML = '';
    
    if (itemsToMove.length > 0) {
        const notes = [
            "Items are relocated to optimize space efficiency.",
            "Priority was given to keeping critical items in their original locations.",
            "Fragile items will be handled with extra care during relocation."
        ];
        
        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note;
            notesEl.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "No rearrangement required at this time.";
        notesEl.appendChild(li);
    }
}

// Update visualization tab with before/after representation
function updateVisualizationTab(itemsToMove, shipmentVolume) {
    const beforeViz = document.getElementById('before-viz');
    const afterViz = document.getElementById('after-viz');
    
    // Clear visualizations
    beforeViz.innerHTML = '';
    afterViz.innerHTML = '';
    
    // Create a deep copy of storage zones for before and after
    const beforeZones = JSON.parse(JSON.stringify(storageZones));
    const afterZones = JSON.parse(JSON.stringify(storageZones));
    
    // Update after zones based on moves
    itemsToMove.forEach(item => {
        const oldBay = item.location.split(', ')[0];
        const newBay = item.newLocation.split(', ')[0];
        
        const oldZone = afterZones.find(zone => zone.name === oldBay);
        const newZone = afterZones.find(zone => zone.name === newBay);
        
        if (oldZone && newZone) {
            oldZone.used -= item.volume;
            newZone.used += item.volume;
        }
    });
    
    // Calculate space needed for new shipment
    const availableSpace = STORAGE_CONFIG.totalCapacity - STORAGE_CONFIG.usedCapacity;
    const spaceNeeded = Math.max(0, shipmentVolume - availableSpace);
    
    // Create visualization blocks
    createStorageVisualization(beforeViz, beforeZones, false, shipmentVolume);
    createStorageVisualization(afterViz, afterZones, true, shipmentVolume);
}

// Create blocks representing storage usage
function createStorageVisualization(container, zones, isAfter, shipmentVolume) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Total width of all zones
    const totalWidth = containerWidth * 0.9;
    
    // Total capacity across all zones
    const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
    
    // Starting X position (centering the blocks)
    let startX = (containerWidth - totalWidth) / 2;
    
    // Colors for different types of usage
    const colors = {
        used: 'var(--accent)',
        critical: 'var(--danger)',
        new: 'var(--success)',
        available: 'var(--light-gray)'
    };
    
    // Create blocks for each zone
    zones.forEach(zone => {
        const zoneWidth = (zone.capacity / totalCapacity) * totalWidth;
        const zoneHeight = containerHeight * 0.8;
        const startY = (containerHeight - zoneHeight) / 2;
        
        // Create zone container
        const zoneBlock = document.createElement('div');
        zoneBlock.className = 'viz-block';
        zoneBlock.style.left = `${startX}px`;
        zoneBlock.style.top = `${startY}px`;
        zoneBlock.style.width = `${zoneWidth}px`;
        zoneBlock.style.height = `${zoneHeight}px`;
        zoneBlock.style.backgroundColor = 'white';
        zoneBlock.style.border = '1px solid var(--secondary)';
        zoneBlock.style.color = 'var(--dark)';
        zoneBlock.textContent = zone.name;
        
        container.appendChild(zoneBlock);
        
        // Add used space block
        const usedHeight = (zone.used / zone.capacity) * zoneHeight;
        
        const usedBlock = document.createElement('div');
        usedBlock.className = 'viz-block';
        usedBlock.style.left = `${startX}px`;
        usedBlock.style.top = `${startY + zoneHeight - usedHeight}px`;
        usedBlock.style.width = `${zoneWidth}px`;
        usedBlock.style.height = `${usedHeight}px`;
        usedBlock.style.backgroundColor = colors.used;
        
        container.appendChild(usedBlock);
        
        // If this is the "after" visualization, add the new shipment block if possible
        if (isAfter && zone.capacity - zone.used > 0) {
            // Only add if this zone will receive the new shipment
            // In a real app, you'd determine this based on shipment placement logic
            
            // For demo purposes, let's assume shipment goes to the zone with most space
            const availableInZone = zone.capacity - zone.used;
            const shipmentInThisZone = Math.min(availableInZone, shipmentVolume);
            
            if (shipmentInThisZone > 0) {
                const newHeight = (shipmentInThisZone / zone.capacity) * zoneHeight;
                
                const newBlock = document.createElement('div');
                newBlock.className = 'viz-block';
                newBlock.style.left = `${startX}px`;
                newBlock.style.top = `${startY + zoneHeight - usedHeight - newHeight}px`;
                newBlock.style.width = `${zoneWidth}px`;
                newBlock.style.height = `${newHeight}px`;
                newBlock.style.backgroundColor = colors.new;
                
                container.appendChild(newBlock);
                
                // We've placed the shipment, so set to 0 for other zones
                shipmentVolume = 0;
            }
        }
        
        startX += zoneWidth;
    });
    
    // Add legend
    const legendItems = [
        { label: "Current Items", color: colors.used },
        { label: "New Shipment", color: colors.new },
        { label: "Available Space", color: colors.available }
    ];
    
    const legend = document.createElement('div');
    legend.style.position = 'absolute';
    legend.style.bottom = '5px';
    legend.style.left = '50%';
    legend.style.transform = 'translateX(-50%)';
    legend.style.display = 'flex';
    legend.style.gap = '15px';
    legend.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    legend.style.padding = '5px';
    legend.style.borderRadius = '3px';
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.fontSize = '10px';
        
        const colorBox = document.createElement('div');
        colorBox.style.width = '10px';
        colorBox.style.height = '10px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '5px';
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(document.createTextNode(item.label));
        
        legend.appendChild(legendItem);
    });
    
    container.appendChild(legend);
}

// Update rearrangement summary information
function updateRearrangementSummary(itemsToMove, spaceRecovered, shipmentVolume, isRequired) {
    // Calculate metrics
    const availableSpace = STORAGE_CONFIG.totalCapacity - STORAGE_CONFIG.usedCapacity;
    const totalSpaceAfterRearrangement = availableSpace + spaceRecovered;
    const spaceNeeded = isRequired ? shipmentVolume - availableSpace : 0;
    
    // Generate tasks for the confirmation modal
    generateTasks(itemsToMove);
}

// Generate task list for confirmation modal
function generateTasks(itemsToMove) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    if (itemsToMove.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No rearrangement tasks required.";
        taskList.appendChild(li);
        return;
    }
    
    // Add tasks for each item to move
    itemsToMove.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `Move ${item.name} from ${item.location} to ${item.newLocation}`;
        taskList.appendChild(li);
    });
    
    // Add inspection task
    const inspectionTask = document.createElement('li');
    inspectionTask.textContent = "Conduct final inspection after rearrangement";
    taskList.appendChild(inspectionTask);
    
    // Set estimated completion time
    const estimatedTime = Math.max(15, itemsToMove.length * 10); // 10 mins per item, minimum 15 mins
    document.getElementById('completion-time').textContent = `${estimatedTime} minutes`;
}

// Button handlers
function approveRearrangement() {
    // Show confirmation modal
    const modal = document.getElementById('confirmation-modal');
    document.querySelector('.modal-content h2').textContent = "Rearrangement Approved";
    document.querySelector('.modal-content p').textContent = "The rearrangement plan has been approved and sent to the logistics team.";
    modal.style.display = 'block';
}

function modifyRearrangementPlan() {
    alert("This feature would allow manual editing of the rearrangement plan. Not implemented in this demo.");
}

function cancelRearrangement() {
    // Show confirmation modal with cancellation message
    const modal = document.getElementById('confirmation-modal');
    document.querySelector('.modal-content h2').textContent = "Rearrangement Cancelled";
    document.querySelector('.modal-content p').textContent = "The rearrangement plan has been cancelled. Please consider alternative solutions.";
    modal.style.display = 'block';
}