// Initialize data structures
let cargoItems = [];
let moduleInfo = {
    name: "Progress MS-24",
    undockDate: "2025-04-15",
    totalCapacity: 45
};

// DOM elements for frequent access
const elements = {
    // Module info elements
    moduleName: document.getElementById('module-name'),
    undockDate: document.getElementById('undock-date'),
    totalCapacity: document.getElementById('total-capacity'),
    updateModuleBtn: document.getElementById('update-module-btn'),
    
    // Cargo list elements
    cargoItemsContainer: document.getElementById('cargo-items-container'),
    addCargoForm: document.getElementById('add-cargo-form'),
    
    // Filter buttons
    allFilter: document.getElementById('all-filter'),
    wasteFilter: document.getElementById('waste-filter'),
    scienceFilter: document.getElementById('science-filter'),
    equipmentFilter: document.getElementById('equipment-filter'),
    
    // Space allocation elements
    totalCapacityDisplay: document.getElementById('total-capacity-display'),
    allocatedSpace: document.getElementById('allocated-space'),
    remainingSpace: document.getElementById('remaining-space'),
    reclaimedSpace: document.getElementById('reclaimed-space'),
    
    // Charts containers
    spaceGaugeContainer: document.getElementById('space-gauge-container'),
    allocationChart: document.getElementById('allocation-chart'),
    priorityChart: document.getElementById('priority-chart'),
    reclamationChart: document.getElementById('reclamation-chart'),
    
    // Action buttons
    optimizeBtn: document.getElementById('optimize-btn'),
    exportBtn: document.getElementById('export-btn'),
    finalizeBtn: document.getElementById('finalize-btn'),
    
    // Modal elements
    optimizationModal: document.getElementById('optimization-modal'),
    optimizationResults: document.getElementById('optimization-results'),
    acceptOptimization: document.getElementById('accept-optimization'),
    closeModalBtn: document.querySelector('.close-btn')
};

// Chart objects
let spaceGauge = null;
let allocationPieChart = null;
let priorityBarChart = null;
let reclamationLineChart = null;

// Initialize the application
function initApp() {
    // Set initial values from moduleInfo
    elements.moduleName.value = moduleInfo.name;
    elements.undockDate.value = moduleInfo.undockDate;
    elements.totalCapacity.value = moduleInfo.totalCapacity;
    elements.totalCapacityDisplay.textContent = `${moduleInfo.totalCapacity} cubic units`;
    elements.remainingSpace.textContent = `${moduleInfo.totalCapacity} cubic units`;
    
    // Add event listeners
    setupEventListeners();
    
    // Initialize charts
    initializeCharts();
    
    // Load some sample data
    loadSampleData();
    
    // Update UI
    updateCargoList();
    updateSpaceAllocation();
    updateCharts();
}

// Set up all event listeners
function setupEventListeners() {
    // Module info form
    elements.updateModuleBtn.addEventListener('click', updateModuleInfo);
    
    // Add cargo form
    elements.addCargoForm.addEventListener('submit', addCargoItem);
    
    // Filter buttons
    elements.allFilter.addEventListener('click', () => filterCargoItems('all'));
    elements.wasteFilter.addEventListener('click', () => filterCargoItems('Waste'));
    elements.scienceFilter.addEventListener('click', () => filterCargoItems('Science'));
    elements.equipmentFilter.addEventListener('click', () => filterCargoItems('Equipment'));
    
    // Action buttons
    elements.optimizeBtn.addEventListener('click', optimizeCargoPlan);
    elements.exportBtn.addEventListener('click', exportManifest);
    elements.finalizeBtn.addEventListener('click', finalizeReturnPlan);
    
    // Modal
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.acceptOptimization.addEventListener('click', acceptOptimization);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === elements.optimizationModal) {
            closeModal();
        }
    });
}

// Initialize charts
function initializeCharts() {
    // Space gauge
    const gaugeCanvas = document.createElement('canvas');
    gaugeCanvas.id = 'space-gauge';
    elements.spaceGaugeContainer.appendChild(gaugeCanvas);
    
    spaceGauge = new Chart(gaugeCanvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, moduleInfo.totalCapacity],
                backgroundColor: [
                    '#3498db',  // Used space - blue
                    '#ecf0f1'   // Available space - light gray
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: -90,
            cutout: '80%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
    
    // Allocation pie chart
    const allocationCanvas = document.createElement('canvas');
    allocationCanvas.id = 'allocation-pie-chart';
    elements.allocationChart.appendChild(allocationCanvas);
    
    allocationPieChart = new Chart(allocationCanvas, {
        type: 'pie',
        data: {
            labels: ['Waste', 'Science', 'Equipment'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#e74c3c',  // Waste - red
                    '#3498db',  // Science - blue
                    '#f39c12'   // Equipment - orange
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
    
    // Priority bar chart
    const priorityCanvas = document.createElement('canvas');
    priorityCanvas.id = 'priority-bar-chart';
    elements.priorityChart.appendChild(priorityCanvas);
    
    priorityBarChart = new Chart(priorityCanvas, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Items by Priority',
                data: [0, 0, 0],
                backgroundColor: [
                    '#e74c3c',  // High - red
                    '#f39c12',  // Medium - orange
                    '#95a5a6'   // Low - gray
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Reclamation line chart
    const reclamationCanvas = document.createElement('canvas');
    reclamationCanvas.id = 'reclamation-line-chart';
    elements.reclamationChart.appendChild(reclamationCanvas);
    
    const undockDate = new Date(moduleInfo.undockDate);
    const dates = [];
    
    // Generate 5 dates after undocking
    for (let i = 0; i < 5; i++) {
        const date = new Date(undockDate);
        date.setDate(date.getDate() + i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    reclamationLineChart = new Chart(reclamationCanvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Space Utilization',
                data: [100, 85, 70, 50, 30],  // Initial percentages
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Space Utilization (%)'
                    }
                }
            }
        }
    });
}

// Update module information
function updateModuleInfo() {
    moduleInfo.name = elements.moduleName.value;
    moduleInfo.undockDate = elements.undockDate.value;
    moduleInfo.totalCapacity = parseFloat(elements.totalCapacity.value);
    
    // Update displays
    elements.totalCapacityDisplay.textContent = `${moduleInfo.totalCapacity} cubic units`;
    updateSpaceAllocation();
    updateCharts();
    
    // Show confirmation message
    alert(`Module information updated successfully for ${moduleInfo.name}`);
}

// Add cargo item to the manifest
function addCargoItem(event) {
    event.preventDefault();
    
    const itemName = document.getElementById('item-name').value;
    const itemType = document.getElementById('item-type').value;
    const itemPriority = document.getElementById('item-priority').value;
    const itemVolume = parseFloat(document.getElementById('item-volume').value);
    
    // Check if adding this would exceed capacity
    const currentAllocated = getTotalAllocatedSpace();
    if (currentAllocated + itemVolume > moduleInfo.totalCapacity) {
        alert(`Cannot add item. It would exceed the module's capacity by ${(currentAllocated + itemVolume - moduleInfo.totalCapacity).toFixed(1)} cubic units.`);
        return;
    }
    
    // Generate a unique ID
    const itemId = `item-${Date.now()}`;
    
    // Create the cargo item object
    const newItem = {
        id: itemId,
        name: itemName,
        type: itemType,
        priority: itemPriority,
        volume: itemVolume
    };
    
    // Add to cargo items array
    cargoItems.push(newItem);
    
    // Clear the form
    document.getElementById('item-name').value = '';
    document.getElementById('item-type').value = '';
    document.getElementById('item-volume').value = '';
    
    // Update UI
    updateCargoList();
    updateSpaceAllocation();
    updateCharts();
}

// Remove cargo item from the manifest
function removeCargoItem(itemId) {
    cargoItems = cargoItems.filter(item => item.id !== itemId);
    
    // Update UI
    updateCargoList();
    updateSpaceAllocation();
    updateCharts();
}

// Filter cargo items by type
function filterCargoItems(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (type === 'all') {
        elements.allFilter.classList.add('active');
    } else if (type === 'Waste') {
        elements.wasteFilter.classList.add('active');
    } else if (type === 'Science') {
        elements.scienceFilter.classList.add('active');
    } else if (type === 'Equipment') {
        elements.equipmentFilter.classList.add('active');
    }
    
    // Filter items and update list
    updateCargoList(type);
}

// Update the cargo list display
function updateCargoList(filterType = 'all') {
    const container = elements.cargoItemsContainer;
    container.innerHTML = '';
    
    // Filter items if needed
    let filteredItems = cargoItems;
    if (filterType !== 'all') {
        filteredItems = cargoItems.filter(item => item.type === filterType);
    }
    
    // Display message if no items
    if (filteredItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No cargo items added yet.';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#7f8c8d';
        container.appendChild(emptyMessage);
        return;
    }
    
    // Sort items by priority (High > Medium > Low)
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    filteredItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Create and append cargo item elements
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `cargo-item ${item.type}`;
        itemElement.innerHTML = `
            <div class="cargo-item-info">
                <div class="cargo-item-name">${item.name}</div>
                <div class="cargo-item-details">
                    <span>Type: ${item.type}</span>
                    <span>Volume: ${item.volume} cu</span>
                    <span class="priority-tag priority-${item.priority}">${item.priority}</span>
                </div>
            </div>
            <div class="cargo-item-actions">
                <button class="btn danger-btn btn-sm remove-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        container.appendChild(itemElement);
        
        // Add event listener to the remove button
        const removeBtn = itemElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => removeCargoItem(item.id));
    });
}

// Calculate and update space allocation
function updateSpaceAllocation() {
    const allocatedSpace = getTotalAllocatedSpace();
    const remainingSpace = moduleInfo.totalCapacity - allocatedSpace;
    
    // Update display elements
    elements.allocatedSpace.textContent = `${allocatedSpace.toFixed(1)} cubic units`;
    elements.remainingSpace.textContent = `${remainingSpace.toFixed(1)} cubic units`;
    
    // Update reclaimed space display
    elements.reclaimedSpace.textContent = `${allocatedSpace.toFixed(1)}`;
}

// Get total allocated space
function getTotalAllocatedSpace() {
    return cargoItems.reduce((total, item) => total + item.volume, 0);
}

// Update all charts
function updateCharts() {
    updateSpaceGauge();
    updateAllocationPieChart();
    updatePriorityBarChart();
    updateReclamationLineChart();
}

// Update the space gauge chart
function updateSpaceGauge() {
    const allocatedSpace = getTotalAllocatedSpace();
    const remainingSpace = moduleInfo.totalCapacity - allocatedSpace;
    
    spaceGauge.data.datasets[0].data = [allocatedSpace, remainingSpace];
    spaceGauge.update();
}

// Update the allocation pie chart
function updateAllocationPieChart() {
    // Calculate volume by type
    const volumeByType = {
        'Waste': 0,
        'Science': 0,
        'Equipment': 0
    };
    
    cargoItems.forEach(item => {
        volumeByType[item.type] += item.volume;
    });
    
    allocationPieChart.data.datasets[0].data = [
        volumeByType['Waste'],
        volumeByType['Science'],
        volumeByType['Equipment']
    ];
    
    allocationPieChart.update();
}

// Update the priority bar chart
function updatePriorityBarChart() {
    // Count items by priority
    const countByPriority = {
        'High': 0,
        'Medium': 0,
        'Low': 0
    };
    
    cargoItems.forEach(item => {
        countByPriority[item.priority]++;
    });
    
    priorityBarChart.data.datasets[0].data = [
        countByPriority['High'],
        countByPriority['Medium'],
        countByPriority['Low']
    ];
    
    priorityBarChart.update();
}

// Update the reclamation line chart
function updateReclamationLineChart() {
    const allocatedSpace = getTotalAllocatedSpace();
    
    // Calculate the percentage of space utilized initially (100%)
    const initialUtilization = 100;
    
    // Calculate a simulated decay curve for space utilization after undocking
    const dayTwo = initialUtilization * 0.85;
    const dayThree = initialUtilization * 0.70;
    const dayFour = initialUtilization * 0.50;
    const dayFive = initialUtilization * 0.30;
    
    reclamationLineChart.data.datasets[0].data = [
        initialUtilization,
        dayTwo,
        dayThree,
        dayFour,
        dayFive
    ];
    
    reclamationLineChart.update();
}

// Optimize cargo plan
function optimizeCargoPlan() {
    // Only optimize if there are items
    if (cargoItems.length === 0) {
        alert('No cargo items to optimize.');
        return;
    }
    
    // Create optimization suggestions
    const suggestions = [];
    
    // 1. Remove low priority items if space is almost full
    const allocatedSpace = getTotalAllocatedSpace();
    const remainingSpace = moduleInfo.totalCapacity - allocatedSpace;
    const spaceUtilizationPercentage = (allocatedSpace / moduleInfo.totalCapacity) * 100;
    
    if (spaceUtilizationPercentage > 90) {
        const lowPriorityItems = cargoItems.filter(item => item.priority === 'Low');
        if (lowPriorityItems.length > 0) {
            suggestions.push({
                title: 'Remove Low Priority Items',
                action: `Consider removing ${lowPriorityItems.length} low priority items to free up ${lowPriorityItems.reduce((total, item) => total + item.volume, 0).toFixed(1)} cubic units.`,
                reason: 'Space utilization is over 90%, and these items can be delayed to a future return mission.'
            });
        }
    }
    
    // 2. Consolidate waste items
    const wasteItems = cargoItems.filter(item => item.type === 'Waste');
    if (wasteItems.length > 3) {
        suggestions.push({
            title: 'Consolidate Waste Items',
            action: 'Compact or consolidate waste items to optimize space usage.',
            reason: 'Multiple waste items can often be compressed or combined.'
        });
    }
    
    // 3. Prioritize science returns
    const scienceItems = cargoItems.filter(item => item.type === 'Science');
    if (scienceItems.length > 0 && spaceUtilizationPercentage > 80) {
        suggestions.push({
            title: 'Prioritize Science Returns',
            action: 'Ensure science returns have appropriate priority levels.',
            reason: 'Science returns often contain time-sensitive experimental data.'
        });
    }
    
    // 4. Volume distribution check
    const volumeByType = {
        'Waste': cargoItems.filter(item => item.type === 'Waste').reduce((total, item) => total + item.volume, 0),
        'Science': cargoItems.filter(item => item.type === 'Science').reduce((total, item) => total + item.volume, 0),
        'Equipment': cargoItems.filter(item => item.type === 'Equipment').reduce((total, item) => total + item.volume, 0)
    };
    
    if (volumeByType['Waste'] > allocatedSpace * 0.7) {
        suggestions.push({
            title: 'Reduce Waste Volume',
            action: 'Consider reducing waste volume allocation.',
            reason: 'Waste currently makes up over 70% of return cargo volume.'
        });
    }
    
    // Display suggestions in the modal
    displayOptimizationSuggestions(suggestions);
}

// Display optimization suggestions in the modal
function displayOptimizationSuggestions(suggestions) {
    const resultsContainer = elements.optimizationResults;
    resultsContainer.innerHTML = '';
    
    if (suggestions.length === 0) {
        resultsContainer.innerHTML = '<p>No optimization suggestions available. Your cargo plan is already well-optimized!</p>';
    } else {
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'optimization-item';
            suggestionElement.innerHTML = `
                <h4>${suggestion.title}</h4>
                <div class="optimization-action">${suggestion.action}</div>
                <div class="optimization-reason">${suggestion.reason}</div>
            `;
            resultsContainer.appendChild(suggestionElement);
        });
    }
    
    // Show the modal
    elements.optimizationModal.style.display = 'block';
}

// Accept optimization suggestions
function acceptOptimization() {
    // In a real implementation, this would apply the suggested changes
    alert('Optimization suggestions applied successfully.');
    closeModal();
}

// Close the modal
function closeModal() {
    elements.optimizationModal.style.display = 'none';
}

// Export manifest as JSON
function exportManifest() {
    const manifest = {
        moduleInfo: moduleInfo,
        cargoItems: cargoItems,
        statistics: {
            totalItems: cargoItems.length,
            allocatedSpace: getTotalAllocatedSpace(),
            remainingSpace: moduleInfo.totalCapacity - getTotalAllocatedSpace(),
            typeBreakdown: {
                'Waste': cargoItems.filter(item => item.type === 'Waste').length,
                'Science': cargoItems.filter(item => item.type === 'Science').length,
                'Equipment': cargoItems.filter(item => item.type === 'Equipment').length
            },
            priorityBreakdown: {
                'High': cargoItems.filter(item => item.priority === 'High').length,
                'Medium': cargoItems.filter(item => item.priority === 'Medium').length,
                'Low': cargoItems.filter(item => item.priority === 'Low').length
            }
        },
        exportDate: new Date().toISOString()
    };
    
    // Create a downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cargo-manifest-${moduleInfo.name.replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Finalize return plan
function finalizeReturnPlan() {
    // Check if there are any items
    if (cargoItems.length === 0) {
        alert('Cannot finalize plan. No cargo items have been added.');
        return;
    }
    
    // Check if there's space left
    const allocatedSpace = getTotalAllocatedSpace();
    const remainingSpace = moduleInfo.totalCapacity - allocatedSpace;
    const utilizationPercentage = (allocatedSpace / moduleInfo.totalCapacity) * 100;
    
    let message = `Return plan for ${moduleInfo.name} has been finalized.\n\n`;
    message += `Total items: ${cargoItems.length}\n`;
    message += `Space utilization: ${utilizationPercentage.toFixed(1)}%\n`;
    message += `Allocated space: ${allocatedSpace.toFixed(1)} cubic units\n`;
    message += `Remaining space: ${remainingSpace.toFixed(1)} cubic units\n\n`;
    
    if (remainingSpace > moduleInfo.totalCapacity * 0.2) {
        message += 'Warning: You have more than 20% of space remaining. Consider adding more items.';
    } else {
        message += 'Plan looks good! The module is well-utilized for the return journey.';
    }
    
    alert(message);
}

// Load sample data for demonstration
function loadSampleData() {
    cargoItems = [
        {
            id: 'sample-1',
            name: 'Waste Containers Set A',
            type: 'Waste',
            priority: 'High',
            volume: 8.5
        },
        {
            id: 'sample-2',
            name: 'Plant Growth Experiment',
            type: 'Science',
            priority: 'High',
            volume: 5.2
        },
        {
            id: 'sample-3',
            name: 'Defective Air Filter',
            type: 'Equipment',
            priority: 'Medium',
            volume: 4.0
        },
        {
            id: 'sample-4',
            name: 'Biomedical Sample Container',
            type: 'Science',
            priority: 'High',
            volume: 3.7
        },
        {
            id: 'sample-5',
            name: 'Used Clothing Batch',
            type: 'Waste',
            priority: 'Low',
            volume: 6.8
        }
    ];
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);