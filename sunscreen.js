// Sunscreen Reports Management
async function loadSunscreenContent() {
    const tabContent = document.querySelector('#sunscreen');
    
    try {
        const response = await fetch('/api/sunscreen', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const reports = await response.json();
            
            tabContent.innerHTML = `
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Sunscreen Reports</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button class="btn btn-sm btn-outline-secondary">Export</button>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">Sunscreen Stats</div>
                            <div class="card-body">
                                <canvas id="sunscreenChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">Quick Filters</div>
                            <div class="card-body">
                                <div class="btn-group w-100">
                                    <button class="btn btn-outline-primary active filter-btn" data-filter="all">All</button>
                                    <button class="btn btn-outline-primary filter-btn" data-filter="today">Today</button>
                                    <button class="btn btn-outline-primary filter-btn" data-filter="week">This Week</button>
                                    <button class="btn btn-outline-primary filter-btn" data-filter="month">This Month</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped" id="sunscreenTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Kode</th>
                                <th>Nomor Pengirim</th>
                                <th>AML</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reports.map(report => `
                                <tr>
                                    <td>${new Date(report.created_at).toLocaleDateString()}</td>
                                    <td>${report.kode}</td>
                                    <td>${report.nomor_pengirim}</td>
                                    <td>${report.aml || '-'}</td>
                                    <td>${report.jumlah || '-'}</td>
                                    <td>
                                        <span class="badge ${getStatusBadgeClass(report.status)}">
                                            ${report.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary view-report" data-id="${report.id}">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary edit-report" data-id="${report.id}">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Report Details Modal -->
                <div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Report Details</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="reportDetailsContent">
                                <!-- Content will be loaded dynamically -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize chart
            initSunscreenChart(reports);
            
            // Set up event listeners
            setupSunscreenEvents();
        } else {
            const error = await response.json();
            tabContent.innerHTML = `<div class="alert alert-danger">${error.error || 'Failed to load reports'}</div>`;
        }
    } catch (error) {
        console.error('Error loading sunscreen reports:', error);
        tabContent.innerHTML = '<div class="alert alert-danger">Failed to load reports</div>';
    }
}

function initSunscreenChart(reports) {
    // Group reports by date for the chart
    const dateCounts = {};
    reports.forEach(report => {
        const date = new Date(report.created_at).toLocaleDateString();
        dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    const dates = Object.keys(dateCounts).sort();
    const counts = dates.map(date => dateCounts[date]);
    
    const ctx = document.getElementById('sunscreenChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Reports per Day',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
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

function setupSunscreenEvents() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // In a real implementation, you would filter the data
            // For this example, we'll just show all rows
            document.querySelectorAll('#sunscreenTable tbody tr').forEach(row => {
                row.style.display = '';
            });
        });
    });
    
    // View report details
    document.querySelectorAll('.view-report').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            viewReportDetails(reportId);
        });
    });
    
    // Edit report
    document.querySelectorAll('.edit-report').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            editReport(reportId);
        });
    });
}

async function viewReportDetails(reportId) {
    try {
        const response = await fetch(`/api/sunscreen/${reportId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            
            // Format report details
            let content = `
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-bordered">
                            <tr>
                                <th width="40%">Date</th>
                                <td>${new Date(report.created_at).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Kode</th>
                                <td>${report.kode}</td>
                            </tr>
                            <tr>
                                <th>Nomor Pengirim</th>
                                <td>${report.nomor_pengirim}</td>
                            </tr>
                            <tr>
                                <th>AML</th>
                                <td>${report.aml || '-'}</td>
                            </tr>
                            <tr>
                                <th>Jumlah</th>
                                <td>${report.jumlah || '-'}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td><span class="badge ${getStatusBadgeClass(report.status)}">${report.status}</span></td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Keterangan</h6>
                        <div class="p-3 bg-light rounded mb-3">${report.keterangan || '-'}</div>
            `;
            
            // Add media if available
            if (report.media_path || report.gdrive_url) {
                content += `
                    <h6>Media</h6>
                    ${report.gdrive_url ? `
                        <div class="text-center mb-3">
                            <a href="${report.gdrive_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-google"></i> View on Google Drive
                            </a>
                        </div>
                    ` : ''}
                    ${report.media_path ? `
                        <div class="text-center">
                            <img src="${report.media_path}" class="img-fluid" style="max-height: 200px;">
                        </div>
                    ` : ''}
                `;
            }
            
            content += `</div></div>`;
            
            // Show in modal
            document.getElementById('reportDetailsContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('reportModal'));
            modal.show();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to load report details');
        }
    } catch (error) {
        console.error('Error viewing report:', error);
        alert('An error occurred while loading report details');
    }
}

async function editReport(reportId) {
    try {
        const response = await fetch(`/api/sunscreen/${reportId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            
            // Create edit form
            const content = `
                <form id="editReportForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Kode</label>
                            <input type="text" class="form-control" value="${report.kode}" disabled>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nomor Pengirim</label>
                            <input type="text" class="form-control" value="${report.nomor_pengirim}" disabled>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">AML</label>
                            <input type="text" class="form-control" name="aml" value="${report.aml || ''}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Jumlah</label>
                            <input type="number" class="form-control" name="jumlah" value="${report.jumlah || ''}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Keterangan</label>
                        <textarea class="form-control" name="keterangan" rows="3">${report.keterangan || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status">
                            <option value="processed" ${report.status === 'processed' ? 'selected' : ''}>Processed</option>
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="failed" ${report.status === 'failed' ? 'selected' : ''}>Failed</option>
                        </select>
                    </div>
                    <input type="hidden" name="id" value="${report.id}">
                </form>
            `;
            
            // Show in modal with save button
            document.getElementById('reportDetailsContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('reportModal'));
            
            // Update modal title and add save button
            document.querySelector('#reportModal .modal-title').textContent = 'Edit Report';
            document.querySelector('#reportModal .modal-footer').innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveReportBtn">Save Changes</button>
            `;
            
            modal.show();
            
            // Set up save button
            document.getElementById('saveReportBtn').addEventListener('click', async function() {
                const formData = new FormData(document.getElementById('editReportForm'));
                const data = Object.fromEntries(formData.entries());
                
                try {
                    const saveResponse = await fetch(`/api/sunscreen/${reportId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (saveResponse.ok) {
                        modal.hide();
                        await loadSunscreenContent();
                    } else {
                        const error = await saveResponse.json();
                        alert(error.error || 'Failed to update report');
                    }
                } catch (error) {
                    console.error('Error updating report:', error);
                    alert('An error occurred while updating report');
                }
            });
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to load report for editing');
        }
    } catch (error) {
        console.error('Error editing report:', error);
        alert('An error occurred while loading report for editing');
    }
}
