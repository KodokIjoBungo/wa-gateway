document.addEventListener('DOMContentLoaded', () => {
  loadSunscreenData();
  setupSunscreenForm();
  loadSunscreenStats();
});

function loadSunscreenData() {
  fetch('/api/sunscreen')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        renderSunscreenTable(data.sunscreens);
      } else {
        alert('Error loading sunscreen data');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function renderSunscreenTable(sunscreens) {
  const table = document.createElement('table');
  table.className = 'data-table';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Code</th>
      <th>Sender</th>
      <th>Amount</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  `;
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  sunscreens.forEach(sunscreen => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sunscreen.code}</td>
      <td>${sunscreen.sender}</td>
      <td>${sunscreen.amount}</td>
      <td>${new Date(sunscreen.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn view-btn" data-id="${sunscreen.id}">View</button>
        <button class="btn edit-btn" data-id="${sunscreen.id}">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${sunscreen.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  table.appendChild(thead);
  table.appendChild(tbody);
  
  const container = document.getElementById('content');
  container.innerHTML = '<h2>Sunscreen Data</h2>';
  container.appendChild(table);
  
  // Add event listeners to buttons
  addSunscreenTableEventListeners();
}

function setupSunscreenForm() {
  const form = document.createElement('form');
  form.id = 'sunscreen-form';
  form.innerHTML = `
    <h3>Add/Edit Sunscreen</h3>
    <input type="hidden" id="sunscreen-id">
    <div class="form-group">
      <label for="code">Code</label>
      <select id="code" name="code" required>
        <option value="SUNSCREEN">SUNSCREEN</option>
        <option value="SUNSCREENSRC">SUNSCREENSRC</option>
      </select>
    </div>
    <div class="form-group">
      <label for="sender">Sender</label>
      <input type="text" id="sender" name="sender" required>
    </div>
    <div class="form-group">
      <label for="amount">Amount</label>
      <input type="number" id="amount" name="amount" required>
    </div>
    <div class="form-group">
      <label for="media">Media File</label>
      <input type="file" id="media" name="media">
    </div>
    <div class="form-group">
      <label for="keterangan">Keterangan</label>
      <textarea id="keterangan" name="keterangan"></textarea>
    </div>
    <button type="submit" class="btn">Save</button>
    <button type="button" class="btn btn-danger" id="cancel-edit">Cancel</button>
  `;
  
  form.addEventListener('submit', handleSunscreenFormSubmit);
  document.getElementById('cancel-edit').addEventListener('click', resetSunscreenForm);
  
  document.getElementById('content').appendChild(form);
}

function loadSunscreenStats() {
  fetch('/api/sunscreen/stats/summary')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        renderSunscreenStats(data.summary);
      }
    });
}

function renderSunscreenStats(summary) {
  const statsContainer = document.createElement('div');
  statsContainer.className = 'stats-container';
  
  statsContainer.innerHTML = `
    <h3>Sunscreen Statistics</h3>
    <div class="stats-cards">
      <div class="stat-card">
        <h3>Total Entries</h3>
        <div class="value">${summary.total}</div>
      </div>
      <div class="stat-card">
        <h3>Total Amount</h3>
        <div class="value">${summary.totalAmount}</div>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="sunscreenChart"></canvas>
    </div>
  `;
  
  document.getElementById('content').appendChild(statsContainer);
  
  // Render chart
  const ctx = document.getElementById('sunscreenChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: summary.byCode.map(item => item.code),
      datasets: [{
        label: 'Entries by Code',
        data: summary.byCode.map(item => item.count),
        backgroundColor: [
          'rgba(37, 211, 102, 0.7)',
          'rgba(18, 140, 126, 0.7)'
        ],
        borderColor: [
          'rgba(37, 211, 102, 1)',
          'rgba(18, 140, 126, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
