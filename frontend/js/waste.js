// Initial waste items data
let wasteItems = [
    { id: 1, name: 'Expired Medication', category: 'Pharmaceutical', volume: 0.5, container: 'Red Bin', status: 'pending' },
    { id: 2, name: 'Used Batteries', category: 'Electronic', volume: 0.8, container: 'E-waste Bin', status: 'pending' },
    { id: 3, name: 'Empty Food Container', category: 'Plastic', volume: 1.2, container: 'Recycling Bin', status: 'pending' },
    { id: 4, name: 'Old Newspaper', category: 'Paper', volume: 0.7, container: 'Paper Recycling', status: 'pending' },
    { id: 5, name: 'Broken Phone Charger', category: 'Electronic', volume: 0.3, container: 'E-waste Bin', status: 'pending' }
];

// Container definitions
const containers = {
    'Pharmaceutical': { name: 'Red Bin', description: 'For medical and pharmaceutical waste' },
    'Electronic': { name: 'E-waste Bin', description: 'For electronic devices and batteries' },
    'Plastic': { name: 'Recycling Bin', description: 'For plastic containers and packaging' },
    'Paper': { name: 'Paper Recycling', description: 'For paper, cardboard, and printed materials' }
};

// DOM elements
const wasteItemsContainer = document.getElementById('waste-items-container');
const addWasteForm = document.getElementById('add-waste-form');
const totalItemsElement = document.getElementById('total-items');
const spaceCreatedElement = document.getElementById('space-created');
const itemsProcessedElement = document.getElementById('items-processed');
const pieChartContainer = document.getElementById('pie-chart');
const containerListElement = document.getElementById('container-list');

// Filter buttons
const allFilterBtn = document.getElementById('all-filter');
const pharmaceuticalFilterBtn = document.getElementById('pharmaceutical-filter');
const electronicFilterBtn = document.getElementById('electronic-filter');
const plasticFilterBtn = document.getElementById('plastic-filter');
const paperFilterBtn = document.getElementById('paper-filter');

// Current filter
let currentFilter = 'all';

// Chart instance
let pieChart = null;

// Initialize the application
function init() {
    renderWasteItems();
    updateStats();
    renderChart();
    renderContainerSuggestions();
    setupEventListeners();
}

// Render waste items list
function renderWasteItems() {
    wasteItemsContainer.innerHTML = '';
    
    const filteredItems = currentFilter === 'all' 
        ? wasteItems 
        : wasteItems.filter(item => item.category === currentFilter);
    
    if (filteredItems.length === 0) {
        wasteItemsContainer.innerHTML = '<p class="no-items">No waste items found.</p>';
        return;
    }
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `waste-item ${item.category}`;
        itemElement.setAttribute('data-id', item.id);
        
        const statusClass = item.status === 'processed' ? 'processed' : '';
        
        itemElement.innerHTML = `
            <div class="waste-item-info ${statusClass}">
                <div class="waste-item-name">${item.name}</div>
                <div class="waste-item-details">
                    <span>${item.category}</span>
                    <span>${item.volume} cubic units</span>
                    <span>Container: ${item.container}</span>
                </div>
            </div>
            <div class="waste-item-actions">
                ${item.status === 'pending' ? 
                    `<button class="btn primary-btn process-btn" data-id="${item.id}">Process</button>` : 
                    `<button class="btn secondary-btn" disabled style="padding: 0.75rem 1.0rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    width: 100%;
    display: flex
;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 10px;
    border-color:red
    ">Processed</button>`}
                <button class="btn danger-btn delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        wasteItemsContainer.appendChild(itemElement);
    });
    
    // Add event listeners to newly created buttons
    document.querySelectorAll('.process-btn').forEach(btn => {
        btn.addEventListener('click', processItem);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteItem);
    });
}

// Update statistics
function updateStats() {
    const totalItems = wasteItems.length;
    const processedItems = wasteItems.filter(item => item.status === 'processed').length;
    const spaceCreated = wasteItems.reduce((sum, item) => sum + parseFloat(item.volume), 0).toFixed(1);
    
    totalItemsElement.textContent = totalItems;
    itemsProcessedElement.textContent = processedItems;
    spaceCreatedElement.textContent = `${spaceCreated} cubic units`;
}

// Render pie chart
function renderChart() {
    // Group waste items by category
    const categoryData = {};
    wasteItems.forEach(item => {
        if (!categoryData[item.category]) {
            categoryData[item.category] = 0;
        }
        categoryData[item.category] += parseFloat(item.volume);
    });
    
    // Prepare data for chart
    const chartData = Object.keys(categoryData).map(category => ({
        category,
        volume: categoryData[category]
    }));
    
    // Color mapping for categories
    const colorMap = {
        'Pharmaceutical': '#e74c3c',
        'Electronic': '#f39c12',
        'Plastic': '#2ecc71',
        'Paper': '#9b59b6'
    };
    
    // Create chart using Chart.js
    const ctx = document.createElement('canvas');
    pieChartContainer.innerHTML = '';
    pieChartContainer.appendChild(ctx);
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map(item => item.category),
            datasets: [{
                data: chartData.map(item => item.volume),
                backgroundColor: chartData.map(item => colorMap[item.category] || '#3498db'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} cubic units (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render container suggestions
function renderContainerSuggestions() {
    containerListElement.innerHTML = '';
    
    // Count items per container type
    const containerCounts = {};
    wasteItems.forEach(item => {
        if (item.status === 'pending') {
            if (!containerCounts[item.container]) {
                containerCounts[item.container] = 0;
            }
            containerCounts[item.container]++;
        }
    });
    
    // Create container suggestion elements
    Object.entries(containers).forEach(([category, container]) => {
        const count = wasteItems.filter(item => item.category === category && item.status === 'pending').length;
        
        if (count > 0) {
            const containerElement = document.createElement('div');
            containerElement.className = 'container-item';
            
            // Determine icon based on category
            let iconClass = '';
            switch(category) {
                case 'Pharmaceutical': iconClass = '💊'; break;
                case 'Electronic': iconClass = '🔋'; break;
                case 'Plastic': iconClass = '♻️'; break;
                case 'Paper': iconClass = '📄'; break;
                default: iconClass = '🗑️';
            }
            
            containerElement.innerHTML = `
                <div class="container-icon">${iconClass}</div>
                <div class="container-info">
                    <div class="container-name">${container.name}</div>
                    <div class="container-details">
                        ${container.description} • ${count} items pending
                    </div>
                </div>
            `;
            
            containerListElement.appendChild(containerElement);
        }
    });
    
    if (containerListElement.children.length === 0) {
        containerListElement.innerHTML = '<p>No waste items pending for disposal.</p>';
    }
}

// Process an item
function processItem(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    const itemIndex = wasteItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        wasteItems[itemIndex].status = 'processed';
        renderWasteItems();
        updateStats();
        renderContainerSuggestions();
    }
}

// Delete an item
function deleteItem(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    wasteItems = wasteItems.filter(item => item.id !== itemId);
    
    renderWasteItems();
    updateStats();
    renderChart();
    renderContainerSuggestions();
}

// Add a new waste item
function addWasteItem(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('item-name');
    const categoryInput = document.getElementById('item-category');
    const volumeInput = document.getElementById('item-volume');
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const volume = parseFloat(volumeInput.value);
    
    if (!name || !category || isNaN(volume)) {
        alert('Please fill in all fields correctly.');
        return;
    }
    
    // Generate new ID
    const newId = wasteItems.length > 0 ? Math.max(...wasteItems.map(item => item.id)) + 1 : 1;
    
    // Add new item
    wasteItems.push({
        id: newId,
        name,
        category,
        volume,
        container: containers[category].name,
        status: 'pending'
    });
    
    // Reset form
    nameInput.value = '';
    categoryInput.value = '';
    volumeInput.value = '';
    
    // Update UI
    renderWasteItems();
    updateStats();
    renderChart();
    renderContainerSuggestions();
}

// Set up event listeners
function setupEventListeners() {
    // Add waste item form
    addWasteForm.addEventListener('submit', addWasteItem);
    
    // Filter buttons
    allFilterBtn.addEventListener('click', () => setFilter('all'));
    pharmaceuticalFilterBtn.addEventListener('click', () => setFilter('Pharmaceutical'));
    electronicFilterBtn.addEventListener('click', () => setFilter('Electronic'));
    plasticFilterBtn.addEventListener('click', () => setFilter('Plastic'));
    paperFilterBtn.addEventListener('click', () => setFilter('Paper'));
}

// Set active filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active class on filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    switch(filter) {
        case 'all': allFilterBtn.classList.add('active'); break;
        case 'Pharmaceutical': pharmaceuticalFilterBtn.classList.add('active'); break;
        case 'Electronic': electronicFilterBtn.classList.add('active'); break;
        case 'Plastic': plasticFilterBtn.classList.add('active'); break;
        case 'Paper': paperFilterBtn.classList.add('active'); break;
    }
    
    renderWasteItems();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);