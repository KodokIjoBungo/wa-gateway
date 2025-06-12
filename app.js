require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const { whatsapp } = require('./whatsapp-client');

const app = express();

// Database connection
const db = require('./db');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wa', require('./routes/wa'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/sunscreen', require('./routes/sunscreen'));
app.use('/api/shopsign', require('./routes/shopsign'));
app.use('/api/mitra', require('./routes/mitra'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/auto-replies', require('./routes/autoReplies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Scheduled tasks
cron.schedule('0 10 * * *', async () => {
  console.log('Running scheduled task at 10 AM');
  try {
    // Check for unsent messages and send them
    const unsentMessages = await db.query(`
      SELECT m.*, wc.session_name 
      FROM messages m
      JOIN wa_connections wc ON m.wa_connection_id = wc.id
      WHERE m.status = 'pending' AND m.is_group = FALSE
    `);
    
    for (const message of unsentMessages) {
      if (whatsapp.sessions[message.session_name]) {
        try {
          await whatsapp.sessions[message.session_name].sendMessage(
            message.receiver, 
            message.message_text
          );
          
          await db.query(
            'UPDATE messages SET status = "sent" WHERE id = ?',
            [message.id]
          );
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global variables
let currentUser = null;
let authToken = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Setup event listeners
    setupEventListeners();
});

function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (authToken && currentUser) {
        // User is logged in, show main content
        showMainContent();
        initDashboard();
    } else {
        // User is not logged in, show login form
        showLoginForm();
    }
}

function showMainContent() {
    // Hide login tab and show dashboard
    document.querySelector('#login').classList.remove('show', 'active');
    document.querySelector('#dashboard').classList.add('show', 'active');
    
    // Update UI for logged in user
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') !== '#login') {
            link.style.display = 'block';
        }
    });
    
    // Show user info in sidebar
    const userInfo = document.createElement('div');
    userInfo.className = 'text-white p-3 text-center';
    userInfo.innerHTML = `
        <div class="mb-2">
            <i class="bi bi-person-circle fs-3"></i>
        </div>
        <div class="fw-bold">${currentUser.username}</div>
        <small class="text-muted">${currentUser.role}</small>
    `;
    document.querySelector('#sidebar .position-sticky').prepend(userInfo);
}

function showLoginForm() {
    // Show login tab and hide others
    document.querySelector('#login').classList.add('show', 'active');
    document.querySelector('#dashboard').classList.remove('show', 'active');
    
    // Hide other navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') !== '#login') {
            link.style.display = 'none';
        }
    });
}

function setupEventListeners() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Reload the page to update UI
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Reload the page
        window.location.reload();
    });
    
    // Tab navigation
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#login') {
                e.preventDefault();
                loadTabContent(this.getAttribute('href'));
            }
        });
    });
}

async function loadTabContent(tabId) {
    // Show loading state
    const tabContent = document.querySelector(tabId);
    tabContent.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        // Load appropriate content based on tab
        switch(tabId) {
            case '#dashboard':
                await loadDashboardContent();
                break;
            case '#wa-connections':
                await loadWAConnectionsContent();
                break;
            case '#messages':
                await loadMessagesContent();
                break;
            case '#sunscreen':
                await loadSunscreenContent();
                break;
            case '#shopsign':
                await loadShopsignContent();
                break;
            case '#mitra':
                await loadMitraContent();
                break;
            case '#contacts':
                await loadContactsContent();
                break;
            case '#auto-replies':
                await loadAutoRepliesContent();
                break;
            case '#users':
                await loadUsersContent();
                break;
            default:
                tabContent.innerHTML = '<div class="alert alert-info">Content not available</div>';
        }
    } catch (error) {
        console.error(`Error loading ${tabId} content:`, error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load content</div>';
    }
}

// Initialize dashboard
async function initDashboard() {
    await loadDashboardContent();
    
    // Set up periodic refresh for dashboard
    setInterval(async () => {
        if (document.querySelector('#dashboard.show.active')) {
            await loadDashboardContent();
        }
    }, 30000); // Refresh every 30 seconds
}

// Dashboard content
async function loadDashboardContent() {
    const tabContent = document.querySelector('#dashboard');
    
    try {
        // Fetch stats and messages
        const [stats, messages] = await Promise.all([
            fetch('/api/stats', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(res => res.json()),
            fetch('/api/messages/recent', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(res => res.json())
        ]);
        
        // Render dashboard content
        tabContent.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Dashboard</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <div class="btn-group me-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
                        <i class="bi bi-calendar"></i> This week
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stat-card bg-primary">
                        <h5 class="card-title">Sunscreen Reports</h5>
                        <h2 class="card-text">${stats.sunscreenCount}</h2>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-success">
                        <h5 class="card-title">Shopsign Reports</h5>
                        <h2 class="card-text">${stats.shopsignCount}</h2>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-info">
                        <h5 class="card-title">Mitra Reports</h5>
                        <h2 class="card-text">${stats.mitraCount}</h2>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-warning">
                        <h5 class="card-title">Total Messages</h5>
                        <h2 class="card-text">${stats.totalMessages}</h2>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Messages Overview</div>
                        <div class="card-body">
                            <canvas id="messagesChart" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Reports by Type</div>
                        <div class="card-body">
                            <canvas id="reportsChart" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Messages -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Recent Messages</span>
                            <button class="btn btn-sm btn-primary">View All</button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-sm" id="recentMessagesTable">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Sender</th>
                                            <th>Message</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${messages.map(message => `
                                            <tr>
                                                <td>${new Date(message.received_at).toLocaleString()}</td>
                                                <td>${message.sender}</td>
                                                <td>${message.message_text ? message.message_text.substring(0, 50) + (message.message_text.length > 50 ? '...' : '') : '[Media]'}</td>
                                                <td>${message.message_type}</td>
                                                <td><span class="badge ${getStatusBadgeClass(message.status)}">${message.status || 'N/A'}</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary view-message" data-id="${message.id}">
                                                        <i class="bi bi-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize charts
        initCharts(stats.chartData);
        
        // Set up message view buttons
        document.querySelectorAll('.view-message').forEach(button => {
            button.addEventListener('click', function() {
                viewMessageDetails(this.getAttribute('data-id'));
            });
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load dashboard</div>';
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'processed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning text-dark';
        case 'failed':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function initCharts(chartData) {
    // Messages Chart
    const messagesCtx = document.getElementById('messagesChart').getContext('2d');
    new Chart(messagesCtx, {
        type: 'line',
        data: {
            labels: chartData.messages.labels,
            datasets: [
                {
                    label: 'Incoming Messages',
                    data: chartData.messages.incoming,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Outgoing Messages',
                    data: chartData.messages.outgoing,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            }
        }
    });
    
    // Reports Chart
    const reportsCtx = document.getElementById('reportsChart').getContext('2d');
    new Chart(reportsCtx, {
        type: 'bar',
        data: {
            labels: chartData.reports.labels,
            datasets: [{
                label: 'Reports',
                data: chartData.reports.data,
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
                }
            }
        }
    });
}

async function viewMessageDetails(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const message = await response.json();
            
            // Format message details
            let content = `
                <div class="mb-3">
                    <h6>Message Details</h6>
                    <table class="table table-bordered">
                        <tr>
                            <th width="30%">Time</th>
                            <td>${new Date(message.received_at).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <th>Sender</th>
                            <td>${message.sender}</td>
                        </tr>
                        <tr>
                            <th>Receiver</th>
                            <td>${message.receiver}</td>
                        </tr>
                        <tr>
                            <th>Type</th>
                            <td>${message.message_type}</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td><span class="badge ${getStatusBadgeClass(message.status)}">${message.status || 'N/A'}</span></td>
                        </tr>
                    </table>
                </div>
            `;
            
            // Add message content
            if (message.message_text) {
                content += `
                    <div class="mb-3">
                        <h6>Message Content</h6>
                        <div class="p-3 bg-light rounded">${message.message_text}</div>
                    </div>
                `;
            }
            
            // Add media if available
            if (message.media_url) {
                content += `
                    <div class="mb-3">
                        <h6>Media</h6>
                        <div class="text-center">
                            <img src="${message.media_url}" class="img-fluid" style="max-height: 300px;">
                        </div>
                    </div>
                `;
            }
            
            // Show in modal
            document.getElementById('messageDetailsContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('messageModal'));
            modal.show();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to load message details');
        }
    } catch (error) {
        console.error('Error viewing message:', error);
        alert('An error occurred while loading message details');
    }
}
