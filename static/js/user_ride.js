window.onload = async function() {
    document.getElementById('login-btn').textContent =  sessionStorage.getItem("name");
    document.getElementById('login-btn').href = '/account';
    document.getElementById("username-display").textContent = "Username: " + sessionStorage.getItem("name");
    document.getElementById("phone-display").textContent = "Phone Number: " + sessionStorage.getItem("number");
    const response = await fetch('/api/rides');
    all_rides = await response.json();
    console.log(all_rides);
    find_ride();
}

function initMap() {
    map = new google.maps.Map(document.getElementById("mini-map"), {
        center: { lat: 10.7589381, lng: 78.8106432 },
        zoom: 15,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map });
}

async function find_ride() { 
    const response = await fetch('/api/rides');
    all_rides = await response.json();
    console.log(all_rides);
    document.getElementById("username-display").textContent = sessionStorage.getItem("name");
    document.getElementById("phone-display").textContent = sessionStorage.getItem("number");
    let source = all_rides.find(ride => ride.number == sessionStorage.getItem("number"))["source"];
    let destination = all_rides.find(ride => ride.number == sessionStorage.getItem("number"))["destination"];
    directionsService.route(
        {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(response);
        } else {
            alert("Directions request failed due to " + status);
        }
        }
    );
}