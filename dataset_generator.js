const fs = require('fs');

const cities = [
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867, areas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", "Kukatpally", "Begumpet", "Secunderabad", "Abids", "Himayatnagar"] },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, areas: ["Andheri", "Bandra", "Colaba", "Juhu", "Worli", "Malad", "Borivali", "Chembur", "Powai", "Dadar"] },
    { name: "Delhi", lat: 28.6139, lon: 77.2090, areas: ["Connaught Place", "Saket", "Karol Bagh", "Hauz Khas", "Dwarka", "Rohini", "Vasant Kunj", "Lajpat Nagar", "Pitampura", "Chandni Chowk"] },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946, areas: ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "HSR Layout", "MG Road", "Electronic City", "Malleshwaram", "Banashankari", "Rajajinagar"] },
    { name: "Chennai", lat: 13.0827, lon: 80.2707, areas: ["Adyar", "Anna Nagar", "T-Nagar", "Velachery", "Mylapore", "Nungambakkam", "Besant Nagar", "Guindy", "Chromepet", "Porur"] },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639, areas: ["Salt Lake", "Park Street", "Ballygunge", "New Town", "Behala", "Garia", "Alipore", "Dum Dum", "Howrah", "Tollygunge"] },
    { name: "Pune", lat: 18.5204, lon: 73.8567, areas: ["Kothrud", "Hadapsar", "Viman Nagar", "Baner", "Wakad", "Aundh", "Kalyani Nagar", "Hinjewadi", "Magarpatta", "Camp"] },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, areas: ["Satellite", "C G Road", "Bodakdev", "Prahlad Nagar", "Maninagar", "Vastrapur", "Navrangpura", "Ellisbridge", "Bopal", "Naranpura"] },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873, areas: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park", "Bani Park", "Jagatpura", "Vidhyadhar Nagar", "Tonk Road", "Adarsh Nagar"] },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462, areas: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Alambagh", "Jankipuram", "Mahanagar", "Charbagh", "Aminabad", "Vikas Nagar"] }
];

const dataset = [];
let idCounter = 9000000;

cities.forEach(city => {
    city.areas.forEach((area, index) => {
        idCounter++;
        dataset.push({
            name: `${city.name} Parking - ${area}`,
            overpassId: `ovp_${idCounter}`,
            location: `${area}, ${city.name}`,
            latitude: parseFloat((city.lat + (Math.random() - 0.5) * 0.1).toFixed(6)),
            longitude: parseFloat((city.lon + (Math.random() - 0.5) * 0.1).toFixed(6)),
            totalSlots: Math.floor(Math.random() * 81) + 20,
            availableSlots: Math.floor(Math.random() * 50),
            pricePerHour: Math.floor(Math.random() * 41) + 10,
            image: "https://source.unsplash.com/400x300/?parking"
        });
    });
});

fs.writeFileSync('parking_dataset.json', JSON.stringify(dataset, null, 2));
console.log('Generated parking_dataset.json');
