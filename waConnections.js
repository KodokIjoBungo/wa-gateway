// WA Connections Management
async function loadWAConnectionsContent() {
    const tabContent = document.querySelector('#wa-connections');
    
    try {
        const response = await fetch('/api/wa', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const connections = await response.json();
            
            tabContent.innerHTML = `
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">WhatsApp Connections</h1>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addConnectionModal">
                        <i class="bi bi-plus"></i> Add Connection
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Phone Number</th>
                                <th>Status</th>
                                <th>Last Connection</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${connections.map(conn => `
                                <tr>
                                    <td>${conn.phone_number}</td>
                                    <td>
                                        <span class="badge ${getConnectionStatusBadge(conn.status)}">
                                            ${conn.status}
                                        </span>
                                    </td>
                                    <td>${conn.last_connection ? new Date(conn.last_connection).toLocaleString() : 'Never'}</td>
                                    <td>
                                        ${conn.status === 'pending' ? `
                                            <button class="btn btn-sm btn-outline-primary show-qr" data-id="${conn.id}" data-session="${conn.session_name}">
                                                <i class="bi bi-qr-code"></i> Show QR
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-sm btn-outline-danger delete-connection" data-id="${conn.id}">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Add Connection Modal -->
                <div class="modal fade" id="addConnectionModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add WhatsApp Connection</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addConnectionForm">
                                    <div class="mb-3">
                                        <label for="phoneNumber" class="form-label">Phone Number</label>
                                        <input type="text" class="form-control" id="phoneNumber" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="sessionName" class="form-label">Session Name</label>
                                        <input type="text" class="form-control" id="sessionName" required>
                                        <div class="form-text">Unique identifier for this connection</div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveConnectionBtn">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Set up event listeners
            setupWAConnectionEvents();
        } else {
            const error = await response.json();
            tabContent.innerHTML = `<div class="alert alert-danger">${error.error || 'Failed to load connections'}</div>`;
        }
    } catch (error) {
        console.error('Error loading WA connections:', error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load connections</div>';
    }
}

function getConnectionStatusBadge(status) {
    switch(status) {
        case 'connected':
            return 'bg-success';
        case 'pending':
            return 'bg-warning text-dark';
        case 'disconnected':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function setupWAConnectionEvents() {
    // Save new connection
    document.getElementById('saveConnectionBtn').addEventListener('click', async function() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const sessionName = document.getElementById('sessionName').value;
        
        try {
            const response = await fetch('/api/wa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    session_name: sessionName
                })
            });
            
            if (response.ok) {
                // Close modal and refresh list
                bootstrap.Modal.getInstance(document.getElementById('addConnectionModal')).hide();
                await loadWAConnectionsContent();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add connection');
            }
        } catch (error) {
            console.error('Error adding connection:', error);
            alert('An error occurred while adding connection');
        }
    });
    
    // Show QR code
    document.querySelectorAll('.show-qr').forEach(button => {
        button.addEventListener('click', function() {
            const sessionName = this.getAttribute('data-session');
            showQRCode(sessionName);
        });
    });
    
    // Delete connection
    document.querySelectorAll('.delete-connection').forEach(button => {
        button.addEventListener('click', async function() {
            if (confirm('Are you sure you want to delete this connection?')) {
                const connectionId = this.getAttribute('data-id');
                
                try {
                    const response = await fetch(`/api/wa/${connectionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    
                    if (response.ok) {
                        await loadWAConnectionsContent();
                    } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to delete connection');
                    }
                } catch (error) {
                    console.error('Error deleting connection:', error);
                    alert('An error occurred while deleting connection');
                }
            }
        });
    });
}

function showQRCode(sessionName) {
    // In a real implementation, you would get the QR code from the WhatsApp client
    // For this example, we'll simulate it
    
    document.getElementById('qrCodeContainer').innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Generating QR code...</p>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('qrModal'));
    modal.show();
    
    // Simulate QR code generation after a delay
    setTimeout(() => {
        // Generate a sample QR code (in a real app, use the actual QR from WhatsApp client)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sessionName)}`;
        
        document.getElementById('qrCodeContainer').innerHTML = `
            <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid">
        `;
    }, 1500);
}
