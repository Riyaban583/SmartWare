// Sample data - in a real application, this would come from a database or API
const inventoryItems = [
    {
        id: 1,
        name: "Medical Kit",
        location: "Storage Bay A, Shelf 3",
        category: "Medical",
        retrievalTime: 3, // in minutes
        distance: 15, // in meters
        expirationDate: "2025-06-15",
        priority: "High",
        lastUsed: "2025-03-01",
        dateAdded: "2024-12-10",
        quantity: 5,
        description: "Standard medical kit containing bandages, antiseptics, and basic medication."
    },
    {
        id: 2,
        name: "Oxygen Tank",
        location: "Storage Bay B, Rack 2",
        category: "Life Support",
        retrievalTime: 5,
        distance: 25,
        expirationDate: "2026-01-20",
        priority: "Critical",
        lastUsed: "2025-03-18",
        dateAdded: "2024-11-05",
        quantity: 8,
        description: "Portable oxygen supply for emergency situations or EVA activities."
    },
    {
        id: 3,
        name: "Tool Kit",
        location: "Workshop, Cabinet 1",
        category: "Maintenance",
        retrievalTime: 2,
        distance: 10,
        expirationDate: null, // No expiration
        priority: "Medium",
        lastUsed: "2025-03-10",
        dateAdded: "2024-09-20",
        quantity: 3,
        description: "Set of basic tools for standard repairs and maintenance tasks."
    },
    {
        id: 4,
        name: "Food Ration Pack",
        location: "Pantry, Section A",
        category: "Food",
        retrievalTime: 1,
        distance: 5,
        expirationDate: "2025-04-05", // Expiring soon
        priority: "Medium",
        lastUsed: null,
        dateAdded: "2024-10-15",
        quantity: 20,
        description: "Standard meal pack containing balanced nutrition for one day."
    },
    {
        id: 5,
        name: "EVA Suit",
        location: "Airlock Chamber, Locker 5",
        category: "EVA Equipment",
        retrievalTime: 8,
        distance: 35,
        expirationDate: "2027-02-10",
        priority: "High",
        lastUsed: "2025-02-28",
        dateAdded: "2024-08-15",
        quantity: 2,
        description: "Extravehicular Activity suit for space walks and external repairs."
    },
    {
        id: 6,
        name: "Water Purification Tablets",
        location: "Lab Storage, Drawer B",
        category: "Life Support",
        retrievalTime: 4,
        distance: 20,
        expirationDate: "2025-04-01", // Expiring very soon
        priority: "Medium",
        lastUsed: "2025-02-15",
        dateAdded: "2024-11-22",
        quantity: 50,
        description: "Chemical tablets for emergency water purification."
    },
    {
        id: 7,
        name: "Emergency Beacon",
        location: "Command Center, Safe 2",
        category: "Communication",
        retrievalTime: 6,
        distance: 30,
        expirationDate: "2026-08-30",
        priority: "Critical",
        lastUsed: null,
        dateAdded: "2025-01-05",
        quantity: 3,
        description: "Distress signal beacon with solar charging capabilities."
    },
    {
        id: 8,
        name: "Radiation Detector",
        location: "Science Lab, Shelf 1",
        category: "Safety",
        retrievalTime: 3,
        distance: 18,
        expirationDate: "2026-05-15",
        priority: "High",
        lastUsed: "2025-03-05",
        dateAdded: "2024-12-20",
        quantity: 4,
        description: "Handheld device for measuring radiation levels in the environment."
    }
];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const filterOptions = document.querySelectorAll('.filter-option');
const itemModal = document.getElementById('item-modal');
const closeModal = document.querySelector('.close-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemDetails = document.getElementById('modal-item-details');
const retrieveButton = document.getElementById('retrieve-button');
const cancelButton = document.getElementById('cancel-button');
const availableCount = document.getElementById('available-count');
const expiringCount = document.getElementById('expiring-count');
const avgRetrievalTime = document.getElementById('avg-retrieval-time');

// Current state
let currentFilter = 'fastest';
let selectedItemId = null;

// Initialize the application
function initApp() {
    // Update stats
    updateStats();
    
    // Display items with default filter
    displayItems(inventoryItems, currentFilter);
    
    // Add event listeners
    setupEventListeners();
}

// Update statistics display
function updateStats() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // Count items and calculate average retrieval time
    availableCount.textContent = inventoryItems.reduce((total, item) => total + item.quantity, 0);
    
    // Count expiring items (within next 30 days)
    const expiringItems = inventoryItems.filter(item => {
        if (!item.expirationDate) return false;
        const expDate = new Date(item.expirationDate);
        return expDate <= thirtyDaysFromNow;
    });
    expiringCount.textContent = expiringItems.length;
    
    // Calculate average retrieval time
    const totalRetrievalTime = inventoryItems.reduce((total, item) => total + item.retrievalTime, 0);
    avgRetrievalTime.textContent = (totalRetrievalTime / inventoryItems.length).toFixed(1) + ' min';
}

// Set up event listeners
function setupEventListeners() {
    // Search button click
    searchButton.addEventListener('click', handleSearch);
    
    // Search input enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Filter options
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update active class
            filterOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update current filter and display
            currentFilter = option.dataset.filter;
            handleSearch();
        });
    });
    
    // Modal close events
    closeModal.addEventListener('click', () => {
        itemModal.style.display = 'none';
    });
    
    cancelButton.addEventListener('click', () => {
        itemModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            itemModal.style.display = 'none';
        }
    });
    
    // Retrieve button click
    retrieveButton.addEventListener('click', () => {
        if (selectedItemId) {
            alert(`Retrieval instructions for item #${selectedItemId} have been sent to your device.`);
            itemModal.style.display = 'none';
        }
    });
}

// Handle search function
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredItems = inventoryItems;
    
    // Filter by search term if provided
    if (searchTerm) {
        filteredItems = inventoryItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.category.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Display with current filter
    displayItems(filteredItems, currentFilter);
}

// Display items based on filter
function displayItems(items, filterType) {
    // Clear results container
    resultsContainer.innerHTML = '';
    
    // Sort items based on filter
    let sortedItems = [...items];
    
    switch (filterType) {
        case 'fastest':
            sortedItems.sort((a, b) => a.retrievalTime - b.retrievalTime);
            break;
        case 'expiring':
            sortedItems.sort((a, b) => {
                // Handle null expiration dates (items that don't expire)
                if (!a.expirationDate) return 1;
                if (!b.expirationDate) return -1;
                return new Date(a.expirationDate) - new Date(b.expirationDate);
            });
            break;
        case 'priority':
            const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            sortedItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'recent':
            sortedItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
    }
    
    // No results message
    if (sortedItems.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No items found matching your search.</p>';
        return;
    }
    
    // Create item cards
    sortedItems.forEach(item => {
        resultsContainer.appendChild(createItemCard(item));
    });
}

// Create an item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // Check if item is expiring soon (within 30 days)
    const isExpiringSoon = item.expirationDate && isWithinDays(item.expirationDate, 30);
    
    // Create card content
    card.innerHTML = `
        <div class="item-card-header">
            <h3>${item.name}</h3>
        </div>
        <div class="item-card-body">
            <div class="item-detail">
                <span>Location:</span>
                <span>${item.location}</span>
            </div>
            <div class="item-detail">
                <span>Retrieval Time:</span>
                <span>${item.retrievalTime} min</span>
            </div>
            <div class="item-detail">
                <span>Category:</span>
                <span>${item.category}</span>
            </div>
            <div class="item-detail">
                <span>Quantity:</span>
                <span>${item.quantity}</span>
            </div>
            <div class="tags">
                ${item.priority === 'Critical' || item.priority === 'High' ? 
                    `<span class="tag priority">${item.priority}</span>` : ''}
                ${isExpiringSoon ? '<span class="tag expiring">Expiring Soon</span>' : ''}
                ${item.retrievalTime <= 3 ? '<span class="tag fast">Quick Retrieval</span>' : ''}
            </div>
        </div>
        <div class="item-card-footer">
            <span>${item.expirationDate ? 'Expires: ' + formatDate(item.expirationDate) : 'No Expiration'}</span>
            <button class="retrieve-btn" data-id="${item.id}">View Details</button>
        </div>
    `;
    
    // Add event listener to view details button
    const viewButton = card.querySelector('.retrieve-btn');
    viewButton.addEventListener('click', () => openItemDetails(item.id));
    
    return card;
}

// Open item details modal
function openItemDetails(itemId) {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    // Set selected item id
    selectedItemId = itemId;
    
    // Populate modal
    modalItemName.textContent = item.name;
    
    // Create detailed information
    modalItemDetails.innerHTML = `
        <div class="modal-detail-grid">
            <div class="detail-item">
                <strong>Category:</strong> ${item.category}
            </div>
            <div class="detail-item">
                <strong>Location:</strong> ${item.location}
            </div>
            <div class="detail-item">
                <strong>Retrieval Time:</strong> ${item.retrievalTime} minutes
            </div>
            <div class="detail-item">
                <strong>Distance:</strong> ${item.distance} meters
            </div>
            <div class="detail-item">
                <strong>Priority:</strong> ${item.priority}
            </div>
            <div class="detail-item">
                <strong>Quantity Available:</strong> ${item.quantity}
            </div>
            <div class="detail-item">
                <strong>Expiration Date:</strong> ${item.expirationDate ? formatDate(item.expirationDate) : 'N/A'}
            </div>
            <div class="detail-item">
                <strong>Last Used:</strong> ${item.lastUsed ? formatDate(item.lastUsed) : 'N/A'}
            </div>
        </div>
        <div class="item-description">
            <strong>Description:</strong>
            <p>${item.description}</p>
        </div>
        <div class="retrieval-instructions">
            <strong>Retrieval Instructions:</strong>
            <p>Navigate to ${item.location}. The item is stored in a ${item.category.toLowerCase()} container. 
            Estimated retrieval time is ${item.retrievalTime} minutes.</p>
        </div>
    `;
    
    // Show modal
    itemModal.style.display = 'block';
}

// Helper function: check if date is within specified days from now
function isWithinDays(dateStr, days) {
    const date = new Date(dateStr);
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    return date <= futureDate;
}

// Helper function: format date string
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);