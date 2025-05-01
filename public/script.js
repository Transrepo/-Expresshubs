// public/script.js
function updateTrackingDetails(tracking) {
    document.getElementById('currentLocation').textContent = tracking.currentLocation;
    document.getElementById('status').textContent = tracking.status;
    document.getElementById('estimatedDelivery').textContent = 
        tracking.estimatedDelivery ? new Date(tracking.estimatedDelivery).toLocaleDateString() : 'Not set';
}

function updateMap(tracking) {
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const currentCoords = [tracking.coordinates.current.lat, tracking.coordinates.current.lon];
    const destCoords = [tracking.coordinates.destination.lat, tracking.coordinates.destination.lon];
    L.marker(currentCoords).addTo(map)
        .bindPopup(`Current Location: ${tracking.currentLocation}`).openPopup();
    L.marker(destCoords).addTo(map)
        .bindPopup(`Destination: ${tracking.destination}`);
    map.fitBounds([currentCoords, destCoords]);
}

function updateTimeline(status) {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.classList.remove('active');
        const content = item.querySelector('.timeline-content').textContent;
        if (
            (status === 'Processing' && content === 'Processing') ||
            (['In Transit', 'Out for Delivery', 'Delayed', 'Delivered'].includes(status) && content === 'In Transit') ||
            (status === 'Out for Delivery' && content === 'Out for Delivery') ||
            (status === 'Delivered' && content === 'Delivered')
        ) {
            item.classList.add('active');
        }
    });
}

function updateHistory(history) {
    const historyContainer = document.getElementById('tracking-history');
    historyContainer.innerHTML = '';
    history.forEach(entry => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${new Date(entry.timestamp).toLocaleString()}:</strong> Location: ${entry.location}, Status: ${entry.status}`;
        historyContainer.appendChild(p);
    });
}