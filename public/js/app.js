document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Setup navigation
  setupNavigation();
  
  // Load dashboard by default
  loadContent('dashboard');
});

function checkAuth() {
  fetch('/api/auth/status')
    .then(response => response.json())
    .then(data => {
      if (data.authenticated) {
        document.getElementById('user-info').textContent = `Welcome, ${data.user.username}`;
      } else {
        window.location.href = '/login.html';
      }
    })
    .catch(error => {
      console.error('Error checking auth:', error);
      window.location.href = '/login.html';
    });
}

function setupNavigation() {
  document.querySelector('.dashboard-link').addEventListener('click', (e) => {
    e.preventDefault();
    loadContent('dashboard');
  });
  
  document.querySelector('.wa-connections-link').addEventListener('click', (e) => {
    e.preventDefault();
    loadContent('wa-connections');
  });
  
  // Add similar event listeners for other navigation items
  document.querySelector('.logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

function loadContent(page) {
  fetch(`/views/${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      
      // Load corresponding JS
      const script = document.createElement('script');
      script.src = `/js/${page}.js`;
      document.body.appendChild(script);
    })
    .catch(error => {
      console.error('Error loading content:', error);
      document.getElementById('content').innerHTML = '<p>Error loading content</p>';
    });
}

function logout() {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/login.html';
    })
    .catch(error => {
      console.error('Error logging out:', error);
    });
}
