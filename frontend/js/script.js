function bookSlot(slot)
{
alert("Slot " + slot + " booked successfully");
}

var map = L.map('map').setView([16.3067, 80.4365], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

async function searchPlace(){

let place = document.getElementById("placeSearch").value;

let response = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${place}`
);

let data = await response.json();

let lat = data[0].lat;
let lon = data[0].lon;

map.setView([lat, lon], 15);

findParking(lat, lon);

}

async function findParking(lat, lon){

let query = `
[out:json];
node["amenity"="parking"](around:500,${lat},${lon});
out;
`;

let response = await fetch(
"https://overpass-api.de/api/interpreter",
{
method:"POST",
body:query
});

let data = await response.json();

data.elements.forEach(p => {

L.marker([p.lat, p.lon])
.addTo(map)
.bindPopup("Parking Available");

});

}