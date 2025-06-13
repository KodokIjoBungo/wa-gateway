document.addEventListener('DOMContentLoaded', () => {
  loadWAConnections();
  setupConnectionForm();
});

function loadWAConnections() {
  fetch('/api/wa/connections')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        renderWAConnections(data.connections);
      } else {
        alert('Error loading connections');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function renderWAConnections(connections) {
  const table = document.createElement('table');
  table.className = 'data-table';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Phone Number</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  `;
  
  const tbody = document.createElement('tbody');
  
  connections.forEach(connection => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${connection.phoneNumber}</td>
      <td>
        <span class="status-badge ${connection.status}">
          ${connection.status}
        </span>
      </td>
      <td>
        <button class="btn connect-btn" data-number="${connection.phoneNumber}">
          ${connection.status === 'connected' ? 'Disconnect' : 'Connect'}
        </button>
        ${connection.qrCode ? `<button class="btn show-qr-btn" data-qr="${connection.qrCode}">Show QR</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  table.appendChild(thead);
  table.appendChild(tbody);
  
  const container = document.getElementById('content');
  container.innerHTML = '<h2>WA Connections</h2>';
  container.appendChild(table);
  
  // Add event listeners to buttons
  document.querySelectorAll('.connect-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phoneNumber = e.target.getAttribute('data-number');
      toggleConnection(phoneNumber);
    });
  });
  
  document.querySelectorAll('.show-qr-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qrCode = e.target.getAttribute('data-qr');
      showQRCode(qrCode);
    });
  });
}

function toggleConnection(phoneNumber) {
  fetch('/api/wa/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadWAConnections();
    } else {
      alert('Error toggling connection');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function showQRCode(qrCode) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h3>Scan QR Code</h3>
      <div class="qr-code">
        <img src="${qrCode}" alt="QR Code">
      </div>
      <p>Scan this QR code with your WhatsApp mobile app to connect</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });
}

function setupConnectionForm() {
  const form = document.createElement('form');
  form.id = 'add-connection-form';
  form.innerHTML = `
    <h3>Add New Connection</h3>
    <div class="form-group">
      <label for="phoneNumber">Phone Number</label>
      <input type="text" id="phoneNumber" name="phoneNumber" required>
    </div>
    <button type="submit" class="btn">Add Connection</button>
  `;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    fetch('/api/wa/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadWAConnections();
        form.reset();
      } else {
        alert('Error adding connection');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  
  document.getElementById('content').appendChild(form);
}
