document.addEventListener('DOMContentLoaded', function() {
  // Function to handle tab switching
  function openTab(tabName) {
    let contents = document.getElementsByClassName('tab-content');
    let buttons = document.getElementsByClassName('tab-button');

    // Hide all tab contents
    for (let i = 0; i < contents.length; i++) {
      contents[i].classList.remove('active');
    }

    // Remove active class from all buttons
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }

    // Show the selected tab's content and mark the button as active
    document.getElementById(tabName).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  // Default tab to show on page load
  openTab('bookmark');

  // Event listeners for tab buttons
  document.getElementById('bookmark-tab').addEventListener('click', function() {
    openTab('bookmark');
  });

  document.getElementById('countdown-tab').addEventListener('click', function() {
    openTab('countdown');
  });

  document.getElementById('calendar-tab').addEventListener('click', function() {
    openTab('calendar');
  });
  
  document.getElementById('dashboard-tab').addEventListener('click', function() {
    openTab('dashboard');
  });

  // Add bookmark functionality with tile format
  document.getElementById('add-bookmark').addEventListener('click', function() {
    const name = document.getElementById('bookmark-name').value;
    const url = document.getElementById('bookmark-url').value;

    if (name && url) {
      const bookmarkTiles = document.getElementById('bookmark-tiles');
      const tile = document.createElement('div');
      tile.className = 'bookmark-tile';

      // Create the favicon URL (assuming favicon is at /favicon.ico)
      const faviconUrl = new URL('/favicon.ico', url).href;

      // Add the favicon and bookmark name to the tile
      tile.innerHTML = `
        <img src="${faviconUrl}" onerror="this.src='fallback-icon.png';" alt="Favicon">
        <a href="${url}" target="_blank">${name}</a>
      `;

      // Append the new tile to the bookmark tiles container
      bookmarkTiles.appendChild(tile);

      // Save bookmark to chrome storage
      chrome.storage.sync.get(['bookmarks'], function(result) {
        let bookmarks = result.bookmarks || [];
        bookmarks.push({ name, url });
        chrome.storage.sync.set({ bookmarks }, function() {
          console.log('Bookmark saved');
        });
      });

      // Clear input fields
      document.getElementById('bookmark-name').value = '';
      document.getElementById('bookmark-url').value = '';
    }
  });

  // Load bookmarks from chrome storage on startup
  chrome.storage.sync.get(['bookmarks'], function(result) {
    const bookmarks = result.bookmarks || [];
    bookmarks.forEach(bookmark => {
      const bookmarkTiles = document.getElementById('bookmark-tiles');
      const tile = document.createElement('div');
      tile.className = 'bookmark-tile';

      const faviconUrl = new URL('/favicon.ico', bookmark.url).href;

      tile.innerHTML = `
        <img src="${faviconUrl}" onerror="this.src='fallback-icon.png';" alt="Favicon">
        <a href="${bookmark.url}" target="_blank">${bookmark.name}</a>
      `;

      bookmarkTiles.appendChild(tile);
    });
  });

  // Add countdown functionality with sorting and deletion
  let countdowns = [];

  // Function to sort countdowns by date
  function sortCountdowns() {
    countdowns.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  }

  // Function to display countdowns in order
  function displayCountdowns() {
    const countdownList = document.getElementById('countdown-list');
    countdownList.innerHTML = ''; // Clear the list

    sortCountdowns(); // Sort countdowns by date

    countdowns.forEach((countdown, index) => {
      const eventDate = new Date(countdown.eventDate);
      const today = new Date();
      const diffTime = Math.abs(eventDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const countdownItem = document.createElement('div');
      countdownItem.className = 'countdown-item';

      countdownItem.innerHTML = `
        <div class="countdown-info">
          ${countdown.eventName} - ${diffDays} days remaining (${countdown.eventDate})
        </div>
        <button class="delete-countdown" data-index="${index}"><i class="fas fa-times"></i></button>
      `;

      countdownList.appendChild(countdownItem);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-countdown').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        countdowns.splice(index, 1); // Remove the countdown
        displayCountdowns(); // Re-render the countdowns
      });
    });
  }

  // Add countdown
  document.getElementById('add-countdown').addEventListener('click', function() {
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;

    if (eventName && eventDate) {
      countdowns.push({ eventName, eventDate });
      displayCountdowns(); // Refresh the countdown list
      document.getElementById('event-name').value = '';
      document.getElementById('event-date').value = '';
    }
  });

  // Load countdowns from chrome storage on startup
  chrome.storage.sync.get(['countdowns'], function(result) {
    countdowns = result.countdowns || [];
    displayCountdowns();
  });

  // Calendar placeholder functionality
  const calendarElement = document.getElementById('calendar');
  calendarElement.innerHTML = `<h3>Calendar View</h3><p>Coming Soon!</p>`;

  // --- Dashboard Functionality ---

  // Calculate days remaining to end of year
  function calculateDaysRemaining() {
    const endDate = new Date('2024-12-31');
    const today = new Date();
    const diffTime = Math.abs(endDate - today);
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('days-remaining').innerText = daysRemaining;
  }

  // Function to update budget and KPI calculations
  function updateDashboard() {
    const totalBudget = parseFloat(document.getElementById('total-budget').value) || 0;
    const usedBudget = parseFloat(document.getElementById('used-budget').value) || 0;
    const remainingBudget = totalBudget - usedBudget;
    const remainingBudgetPercent = (remainingBudget / totalBudget) * 100;

    const kpiTarget = parseFloat(document.getElementById('kpi-target').value) || 0;

    // Update remaining budget percentage
    document.getElementById('remaining-budget-percent').innerText = remainingBudgetPercent.toFixed(2);

    // Save the data to chrome storage
    chrome.storage.sync.set({
      totalBudget,
      usedBudget,
      kpiTarget
    }, function() {
      console.log('Dashboard data saved');
    });
  }

  // Load data from storage (if available)
  chrome.storage.sync.get(['totalBudget', 'usedBudget', 'kpiTarget'], function(result) {
    if (result.totalBudget) document.getElementById('total-budget').value = result.totalBudget;
    if (result.usedBudget) document.getElementById('used-budget').value = result.usedBudget;
    if (result.kpiTarget) document.getElementById('kpi-target').value = result.kpiTarget;

    // Perform the update when loading saved data
    updateDashboard();
  });

  // Event listener to update the dashboard
  document.getElementById('update-dashboard').addEventListener('click', updateDashboard);

  // Calculate days remaining on load
  calculateDaysRemaining();
});
