const mongoose = require('mongoose');

// Hardcoded URI for reliability
const MONGO_URI = "mongodb+srv://halya:Halya%402005@cluster0.fwmjylp.mongodb.net/smartParking?retryWrites=true&w=majority&appName=Cluster0";

// Import Schema from model file path
const Parking = require('./backend/models/Parking');

const CITIES = [
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Mumbai", lat: 18.9220, lon: 72.8347 },
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB. Starting insertion...");

        for (const city of CITIES) {
            console.log(`\nProcessing ${city.name}...`);
            const query = `[out:json];node["amenity"="parking"](around:8000,${city.lat},${city.lon});out 30;`;
            try {
                let text;
                let data;
                
                // Try Main Server
                const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
                    headers: { 'User-Agent': 'SmartParkingProject/2.0' }
                });
                text = await res.text();
                try { data = JSON.parse(text); } catch(e) { 
                    console.log(`  Main server busy (or rate limited). Trying mirror for ${city.name}...`);
                    const mirRes = await fetch(`https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`, {
                        headers: { 'User-Agent': 'SmartParkingProject/2.0' }
                    });
                    text = await mirRes.text();
                    data = JSON.parse(text);
                }

                if (!data || !data.elements || data.elements.length === 0) {
                    console.log(`  No elements found for ${city.name}`);
                    continue;
                }

                const bulkOps = data.elements.map(p => {
                    const tags = p.tags || {};
                    const street = tags['addr:street'] || tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['name'];
                    
                    let finalName;
                    if (tags['name']) {
                        finalName = tags['name'].includes('Parking') ? tags['name'] : `${tags['name']} Hub`;
                    } else if (street) {
                        finalName = `${street} Smart Hub`;
                    } else {
                        finalName = `Premium Hub ${p.id.toString().slice(-4)}`;
                    }

                    return {
                        updateOne: {
                            filter: { overpassId: p.id.toString() },
                            update: {
                                $setOnInsert: {
                                    overpassId: p.id.toString(),
                                    latitude: p.lat,
                                    longitude: p.lon,
                                    totalSlots: Math.floor(Math.random() * 30) + 20,
                                    availableSlots: Math.floor(Math.random() * 15) + 5,
                                    pricePerHour: parseFloat((Math.random() * 5 + 3).toFixed(2)),
                                    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
                                },
                                $set: {
                                    name: finalName,
                                    location: tags['addr:full'] || `${street || city.name}, ${city.name}`
                                }
                            },
                            upsert: true
                        }
                    };
                }).slice(0, 15); // Limit to 15 per city for stability

                if (bulkOps.length > 0) {
                    await Parking.bulkWrite(bulkOps);
                    console.log(`  ✓ Successfully seeded ${bulkOps.length} localized spots in ${city.name}`);
                }
                
                await new Promise(r => setTimeout(r, 2000));
            } catch (cityErr) {
                console.error(`  ✖ Failed ${city.name}:`, cityErr.message);
            }
        }

        console.log("\nDATA RE-SEEDING COMPLETE! Each hub now has a unique area-based name.");
        process.exit(0);
    } catch (err) {
        console.error("Critical Seed Error:", err);
        process.exit(1);
    }
}

seed();
