const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://halya:Halya%402005@cluster0.fwmjylp.mongodb.net/smartParking?retryWrites=true&w=majority&appName=Cluster0";

const cityData = [
  { n: "Hyderabad", l: [17.385, 78.486], a: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", "Kukatpally", "Begumpet", "Secunderabad", "Abids", "Himayatnagar"] },
  { n: "Mumbai", l: [19.076, 72.877], a: ["Andheri", "Bandra", "Colaba", "Juhu", "Worli", "Malad", "Borivali", "Chembur", "Powai", "Dadar"] },
  { n: "Delhi", l: [28.613, 77.209], a: ["Connaught Place", "Saket", "Karol Bagh", "Hauz Khas", "Dwarka", "Rohini", "Vasant Kunj", "Lajpat Nagar", "Pitampura", "Chandni Chowk"] },
  { n: "Bangalore", l: [12.971, 77.594], a: ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "HSR Layout", "MG Road", "Electronic City", "Malleshwaram", "Banashankari", "Rajajinagar"] },
  { n: "Chennai", l: [13.082, 80.270], a: ["Adyar", "Anna Nagar", "T-Nagar", "Velachery", "Mylapore", "Nungambakkam", "Besant Nagar", "Guindy", "Chromepet", "Porur"] },
  { n: "Kolkata", l: [22.572, 88.363], a: ["Salt Lake", "Park Street", "Ballygunge", "New Town", "Behala", "Garia", "Alipore", "Dum Dum", "Howrah", "Tollygunge"] },
  { n: "Pune", l: [18.520, 73.856], a: ["Kothrud", "Hadapsar", "Viman Nagar", "Baner", "Wakad", "Aundh", "Kalyani Nagar", "Hinjewadi", "Magarpatta", "Camp"] },
  { n: "Ahmedabad", l: [23.022, 72.571], a: ["Satellite", "C G Road", "Bodakdev", "Prahlad Nagar", "Maninagar", "Vastrapur", "Navrangpura", "Ellisbridge", "Bopal", "Naranpura"] },
  { n: "Jaipur", l: [26.912, 75.787], a: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park", "Bani Park", "Jagatpura", "Vidhyadhar Nagar", "Tonk Road", "Adarsh Nagar"] },
  { n: "Lucknow", l: [26.846, 80.946], a: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Alambagh", "Jankipuram", "Mahanagar", "Charbagh", "Aminabad", "Vikas Nagar"] }
];

// Add 190 more cities procedurally to reach 200
const extraCities = [
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar",
  "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad",
  "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Warangal", "Guntur",
  "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad",
  "Kochi", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar",
  "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Nellore", "Jammu", "Sangli", "Belgaum", "Mangalore",
  "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Akola",
  "Kurnool", "Rajahmundry", "Bokaro", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara",
  "Panihati", "Latur", "Dhule", "Tiruppur", "Rohtak", "Sagar", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur",
  "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", "Shahjahanpur", "Satara",
  "Bijapur", "Rampur", "Shivamogga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti", "Kakinada",
  "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Oulgaret", "Bihar Sharif", "Panipat", "Darbhanga", "Bally", "Aizawl",
  "Dewas", "Ichalkaranji", "Karnal", "Bathinda", "Jalna", "Eluru", "Barasat", "Purnia", "Satna", "Mau",
  "Sonipat", "Farrukhabad", "Sagar", "Rourkela", "Durg", "Imphal", "Ratlam", "Hapur", "Anantapur", "Arrah",
  "Karimnagar", "Etawah", "Ambernath", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", "Baranagar", "Tiruvottiyur", "Pondicherry",
  "Katni", "Sambhal", "Khandwa", "Rewa", "Raichur", "Malda", "Sikar", "Chhapra", "Vizianagaram", "Bidar",
  "Hospet", "Alandi", "Secundrabad", "Silchar", "Ambikapur", "Bulandshahr", "Pallavaram", "Gurgaon", "Nandurbar", "Hazaribagh"
];

extraCities.forEach((name, i) => {
    cityData.push({
        n: name,
        l: [12 + Math.random() * 20, 70 + Math.random() * 20],
        a: ["Sector 1", "Main Market", "Park Lane", "Old Town", "Civil Lines", "Station Road", "Mall Road", "North Block", "South View", "Green Avenue"]
    });
});

const Parking = require('./backend/models/Parking');

async function bulkDump() {
    try {
        console.log("Connecting to Atlas...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");
        
        const db = mongoose.connection.db;
        const collection = db.collection('parkings');

        console.log("Clearing old data via native driver...");
        await collection.deleteMany({});
        console.log("Database cleared.");
        
        let allEntries = [];
        let idCounter = 880000;

        cityData.forEach(city => {
            city.a.forEach(area => {
                idCounter++;
                allEntries.push({
                    name: `${city.n} Parking - ${area}`,
                    overpassId: `ovp_${idCounter}`,
                    location: `${area}, ${city.n}`,
                    latitude: city.l[0] + (Math.random() - 0.5) * 0.05,
                    longitude: city.l[1] + (Math.random() - 0.5) * 0.05,
                    totalSlots: Math.floor(Math.random() * 80) + 20,
                    availableSlots: Math.floor(Math.random() * 50),
                    pricePerHour: Math.floor(Math.random() * 40) + 10,
                    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
                });
            });
        });

        console.log(`Starting bulk insertion of ${allEntries.length} records...`);
        
        // Batch insertion using native driver to avoid buffering
        const batchSize = 100;
        for (let i = 0; i < allEntries.length; i += batchSize) {
            const batch = allEntries.slice(i, i + batchSize);
            await collection.insertMany(batch);
            console.log(`  Inserted ${i + batch.length} / ${allEntries.length} localized spots...`);
        }

        console.log("SUCCESS! 2000 parking slots created perfectly.");
        process.exit(0);
    } catch (err) {
        console.error("Bulk Dump Failed:", err);
        process.exit(1);
    }
}

bulkDump();
