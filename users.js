// User Management
async function loadUsersContent() {
    // Only admin can access this page
    if (currentUser.role !== 'administrator' && currentUser.role !== 'admin') {
        document.querySelector('#users').innerHTML = `
            <div class="alert alert-danger mt-3">You don't have permission to access this page</div>
        `;
        return;
    }
    
    const tabContent = document.querySelector('#users');
    
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            
            tabContent.innerHTML = `
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">User Management</h1>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                        <i class="bi bi-plus"></i> Add User
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>
                                        <span class="badge ${user.role === 'administrator' ? 'bg-danger' : user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">
                                            ${user.role}
                                        </span>
                                    </td>
                                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        ${user.id !== currentUser.id ? `
                                            <button class="btn btn-sm btn-outline-danger delete-user" data-id="${user.id}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Add User Modal -->
                <div class="modal fade" id="addUserModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add New User</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addUserForm">
                                    <div class="mb-3">
                                        <label for="newUsername" class="form-label">Username</label>
                                        <input type="text" class="form-control" id="newUsername" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="newPassword" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="newPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="userRole" class="form-label">Role</label>
                                        <select class="form-select" id="userRole" required>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            ${currentUser.role === 'administrator' ? '<option value="administrator">Administrator</option>' : ''}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveUserBtn">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Set up event listeners
            setupUserEvents();
        } else {
            const error = await response.json();
            tabContent.innerHTML = `<div class="alert alert-danger">${error.error || 'Failed to load users'}</div>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load users</div>';
    }
}

function setupUserEvents() {
    // Save new user
    document.getElementById('saveUserBtn').addEventListener('click', async function() {
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('userRole').value;
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            });
            
            if (response.ok) {
                // Close modal and refresh list
                bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
                await loadUsersContent();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('An error occurred while adding user');
        }
    });
    
    // Delete user
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    
                    if (response.ok) {
                        await loadUsersContent();
                    } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to delete user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('An error occurred while deleting user');
                }
            }
        });
    });
}
