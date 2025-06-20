let map, directionsService, directionsRenderer;
document.getElementById('addRide').addEventListener('submit', addRide);

window.onload = check_rides()

async function check_rides() { 
    const response = await fetch('/api/rides');
    all_rides = await response.json();
    console.log(all_rides);
    if (all_rides && all_rides.some(ride => ride.number == sessionStorage.getItem("number"))) {
        alert("You have already added a ride.");
        window.location.href = "/user_ride";
    }
};

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 10.7589381, lng: 78.8106432 },
        zoom: 15,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map });

    const sourceEl = document.getElementById("ride-source");
    const destEl = document.getElementById("ride-destination");

    const sourceAutocomplete = new google.maps.places.Autocomplete(sourceEl, {
        types: ['geocode'], 
    });

    const destAutocomplete = new google.maps.places.Autocomplete(destEl, {
        types: ['geocode'], 
    });

    sourceAutocomplete.addListener("place_changed", () => {
        const place = sourceAutocomplete.getPlace();
        console.log("Source Place:", place); 
    });

    destAutocomplete.addListener("place_changed", () => {
        const place = destAutocomplete.getPlace();
        console.log("Destination Place:", place);
        if (place.geometry) {
            calculateAndDisplayRoute(sourceEl.value, place.formatted_address);
        } else {
            console.error("No geometry found for the destination place.");
        }
    });
}

function calculateAndDisplayRoute(source, destination) {
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

async function addRide() {

    const newRide = {
        name: sessionStorage.getItem("name"),
        number: sessionStorage.getItem("number"),
        source: document.getElementById("ride-source").value,
        destination: document.getElementById("ride-destination").value
    };
    
    await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRide)
    });
    
    alert('Ride added successfully!');
    window.location.href="/user_ride";
}

