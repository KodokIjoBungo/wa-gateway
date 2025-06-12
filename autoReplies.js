// Auto Replies Management
async function loadAutoRepliesContent() {
    const tabContent = document.querySelector('#auto-replies');
    
    try {
        const response = await fetch('/api/auto-replies', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const autoReplies = await response.json();
            
            tabContent.innerHTML = `
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Auto Replies</h1>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAutoReplyModal">
                        <i class="bi bi-plus"></i> Add Auto Reply
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Trigger Keyword</th>
                                <th>Reply Text</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${autoReplies.map(reply => `
                                <tr>
                                    <td>${reply.trigger_keyword}</td>
                                    <td>${reply.reply_text.substring(0, 50)}${reply.reply_text.length > 50 ? '...' : ''}</td>
                                    <td>
                                        <span class="badge ${reply.is_active ? 'bg-success' : 'bg-secondary'}">
                                            ${reply.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary edit-reply" data-id="${reply.id}">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-reply" data-id="${reply.id}">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Add Auto Reply Modal -->
                <div class="modal fade" id="addAutoReplyModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Auto Reply</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addAutoReplyForm">
                                    <div class="mb-3">
                                        <label for="triggerKeyword" class="form-label">Trigger Keyword</label>
                                        <input type="text" class="form-control" id="triggerKeyword" required>
                                        <div class="form-text">Keyword that will trigger this reply</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="replyText" class="form-label">Reply Text</label>
                                        <textarea class="form-control" id="replyText" rows="4" required></textarea>
                                        <div class="form-text">Use {count} for dynamic values (e.g., "Total: {count}")</div>
                                    </div>
                                    <div class="mb-3 form-check">
                                        <input type="checkbox" class="form-check-input" id="isActive" checked>
                                        <label class="form-check-label" for="isActive">Active</label>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveAutoReplyBtn">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Edit Auto Reply Modal -->
                <div class="modal fade" id="editAutoReplyModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Auto Reply</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="editAutoReplyContent">
                                <!-- Content will be loaded dynamically -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="updateAutoReplyBtn">Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Set up event listeners
            setupAutoReplyEvents();
        } else {
            const error = await response.json();
            tabContent.innerHTML = `<div class="alert alert-danger">${error.error || 'Failed to load auto replies'}</div>`;
        }
    } catch (error) {
        console.error('Error loading auto replies:', error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load auto replies</div>';
    }
}

function setupAutoReplyEvents() {
    // Save new auto reply
    document.getElementById('saveAutoReplyBtn').addEventListener('click', async function() {
        const triggerKeyword = document.getElementById('triggerKeyword').value;
        const replyText = document.getElementById('replyText').value;
        const isActive = document.getElementById('isActive').checked;
        
        try {
            const response = await fetch('/api/auto-replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    trigger_keyword: triggerKeyword,
                    reply_text: replyText,
                    is_active: isActive
                })
            });
            
            if (response.ok) {
                // Close modal and refresh list
                bootstrap.Modal.getInstance(document.getElementById('addAutoReplyModal')).hide();
                await loadAutoRepliesContent();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add auto reply');
            }
        } catch (error) {
            console.error('Error adding auto reply:', error);
            alert('An error occurred while adding auto reply');
        }
    });
    
    // Edit auto reply
    document.querySelectorAll('.edit-reply').forEach(button => {
        button.addEventListener('click', async function() {
            const replyId = this.getAttribute('data-id');
            await loadAutoReplyForEdit(replyId);
        });
    });
    
    // Delete auto reply
    document.querySelectorAll('.delete-reply').forEach(button => {
        button.addEventListener('click', async function() {
            const replyId = this.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this auto reply?')) {
                try {
                    const response = await fetch(`/api/auto-replies/${replyId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    
                    if (response.ok) {
                        await loadAutoRepliesContent();
                    } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to delete auto reply');
                    }
                } catch (error) {
                    console.error('Error deleting auto reply:', error);
                    alert('An error occurred while deleting auto reply');
                }
            }
        });
    });
}

async function loadAutoReplyForEdit(replyId) {
    try {
        const response = await fetch(`/api/auto-replies/${replyId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const reply = await response.json();
            
            // Create edit form
            document.getElementById('editAutoReplyContent').innerHTML = `
                <form id="editAutoReplyForm">
                    <div class="mb-3">
                        <label class="form-label">Trigger Keyword</label>
                        <input type="text" class="form-control" name="trigger_keyword" value="${reply.trigger_keyword}" required>
                        <div class="form-text">Keyword that will trigger this reply</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Reply Text</label>
                        <textarea class="form-control" name="reply_text" rows="4" required>${reply.reply_text}</textarea>
                        <div class="form-text">Use {count} for dynamic values (e.g., "Total: {count}")</div>
                    </div>
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" name="is_active" id="editIsActive" ${reply.is_active ? 'checked' : ''}>
                        <label class="form-check-label" for="editIsActive">Active</label>
                    </div>
                    <input type="hidden" name="id" value="${reply.id}">
                </form>
            `;
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editAutoReplyModal'));
            modal.show();
            
            // Set up update button
            document.getElementById('updateAutoReplyBtn').addEventListener('click', async function() {
                const formData = new FormData(document.getElementById('editAutoReplyForm'));
                const data = Object.fromEntries(formData.entries());
                data.is_active = data.is_active === 'on';
                
                try {
                    const updateResponse = await fetch(`/api/auto-replies/${replyId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (updateResponse.ok) {
                        modal.hide();
                        await loadAutoRepliesContent();
                    } else {
                        const error = await updateResponse.json();
                        alert(error.error || 'Failed to update auto reply');
                    }
                } catch (error) {
                    console.error('Error updating auto reply:', error);
                    alert('An error occurred while updating auto reply');
                }
            });
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to load auto reply for editing');
        }
    } catch (error) {
        console.error('Error loading auto reply:', error);
        alert('An error occurred while loading auto reply for editing');
    }
}
