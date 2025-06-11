document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    
    // Setup tab navigation
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('href');
            loadTabContent(tabId);
        });
    });
    
    // Load initial tab
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        loadTabContent('#' + activeTab.id);
    }
});

async function initDashboard() {
    // Load stats
    await loadStats();
    
    // Initialize charts
    initCharts();
    
    // Load recent messages
    await loadRecentMessages();
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        document.getElementById('sunscreen-count').textContent = data.sunscreenCount;
        document.getElementById('shopsign-count').textContent = data.shopsignCount;
        document.getElementById('mitra-count').textContent = data.mitraCount;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function initCharts() {
    // Messages Chart
    const messagesCtx = document.getElementById('messagesChart').getContext('2d');
    const messagesChart = new Chart(messagesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Incoming Messages',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Outgoing Messages',
                data: [8, 15, 5, 7, 4, 6],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Messages Overview'
                }
            }
        }
    });
    
    // Reports Chart
    const reportsCtx = document.getElementById('reportsChart').getContext('2d');
    const reportsChart = new Chart(reportsCtx, {
        type: 'bar',
        data: {
            labels: ['Sunscreen', 'Shopsign', 'Mitra', 'Incentive'],
            datasets: [{
                label: 'Reports',
                data: [12, 19, 3, 5],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Reports by Type'
                }
            }
        }
    });
}

async function loadRecentMessages() {
    try {
        const response = await fetch('/api/messages/recent');
        const messages = await response.json();
        
        const tbody = document.querySelector('#recentMessagesTable tbody');
        tbody.innerHTML = '';
        
        messages.forEach(msg => {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            timeCell.textContent = new Date(msg.received_at).toLocaleString();
            
            const senderCell = document.createElement('td');
            senderCell.textContent = msg.sender;
            
            const messageCell = document.createElement('td');
            messageCell.textContent = msg.message_text || '[Media]';
            
            const typeCell = document.createElement('td');
            typeCell.textContent = msg.message_type;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = msg.status || 'N/A';
            
            row.appendChild(timeCell);
            row.appendChild(senderCell);
            row.appendChild(messageCell);
            row.appendChild(typeCell);
            row.appendChild(statusCell);
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading recent messages:', error);
    }
}

async function loadTabContent(tabId) {
    switch(tabId) {
        case '#wa-connections':
            await loadWAConnections();
            break;
        case '#messages':
            await loadMessages();
            break;
        case '#sunscreen':
            await loadSunscreenData();
            break;
        case '#shopsign':
            await loadShopsignData();
            break;
        case '#mitra':
            await loadMitraData();
            break;
        case '#contacts':
            await loadContacts();
            break;
        case '#auto-replies':
            await loadAutoReplies();
            break;
        case '#users':
            await loadUsers();
            break;
    }
}

// Implement other tab loading functions similarly
async function loadWAConnections() {
    try {
        const response = await fetch('/api/wa');
        const connections = await response.json();
        
        // Render connections in the WA connections tab
        const container = document.querySelector('#wa-connections .table-container');
        if (container) {
            // Build and render table
        }
    } catch (error) {
        console.error('Error loading WA connections:', error);
    }
}

// Implement similar functions for other tabs
