let map, routingControl, userMarker, userCoords, currentDistance = 0;

function initMap() {
    map = L.map('map').setView([11.0168, 76.9558], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false
    }).addTo(map);

    map.on('click', (e) => {
        if (!userCoords) return alert("Detect location 📍 first!");
        updateMapRoute(e.latlng);
        document.getElementById('end-point').value = "Pinned on Map";
    });

    routingControl.on('routesfound', (e) => {
        currentDistance = e.routes[0].summary.totalDistance / 1000;
        document.getElementById('dist-val').innerText = `${currentDistance.toFixed(2)} km`;
        document.getElementById('water-val').innerText = `${(currentDistance * 0.1).toFixed(1)} L`;
        document.getElementById('cal-val').innerText = `${(currentDistance * 62).toFixed(0)} kcal`;
    });
}

function updateMapRoute(destLatLng) {
    routingControl.setWaypoints([
        L.latLng(userCoords.lat, userCoords.lng),
        L.latLng(destLatLng.lat, destLatLng.lng)
    ]);
    map.flyTo([destLatLng.lat, destLatLng.lng], 14);
}

// Manual Destination Logic
document.getElementById('end-point').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const address = e.target.value;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    updateMapRoute({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                } else {
                    alert("Location not found.");
                }
            });
    }
});

window.findMe = () => {
    map.locate({setView: true, watch: true, enableHighAccuracy: true});
    map.on('locationfound', (e) => {
        userCoords = e.latlng;
        if (!userMarker) userMarker = L.marker(e.latlng).addTo(map).bindPopup("You").openPopup();
        else userMarker.setLatLng(e.latlng);
        document.getElementById('start-point').value = "Location Locked";
    });
};

window.startRun = () => {
    if (currentDistance <= 0) return alert("Plan a route first!");
    document.getElementById('start-run-btn').style.display = 'none';
    document.getElementById('complete-run-btn').style.display = 'block';
};

window.completeRun = () => {
    const tbody = document.getElementById('activity-body');
    const row = `<tr>
        <td>${new Date().toLocaleDateString()}</td>
        <td><strong>${currentDistance.toFixed(2)} km</strong></td>
        <td>${(currentDistance * 0.1).toFixed(1)} L</td>
        <td>${(currentDistance * 62).toFixed(0)} kcal</td>
    </tr>`;
    tbody.insertAdjacentHTML('afterbegin', row);
    
    alert("Run Saved to Table!");
    document.getElementById('start-run-btn').style.display = 'block';
    document.getElementById('complete-run-btn').style.display = 'none';
};

initMap();