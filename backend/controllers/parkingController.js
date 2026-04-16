const Parking = require("../models/Parking");

exports.syncWithOverpass = async (req, res) => {
    try {
        let { elements, city } = req.body; 
        if (!elements || elements.length === 0) return res.json([]);

        // Limit results to 100 to prevent memory/timeout issues in massive cities like Delhi
        if (elements.length > 100) elements = elements.slice(0, 100);

        const bulkOps = [];
        const syncedIds = [];

        for (const p of elements) {
            const lat = p.lat || (p.center && p.center.lat);
            const lon = p.lon || (p.center && p.center.lon);
            if (!lat || !lon) continue;

            const tags = p.tags || {};
            const street = tags['addr:street'] || tags['addr:place'] || tags['addr:full'];
            const area = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:hamlet'] || city || "Unknown Area";
            
            const fallbackName = street ? `Parking at ${street}` : `Parking near ${area}`;
            const finalName = tags.name || fallbackName;
            const finalLocation = street ? `${street}, ${area}` : `Area: ${area}`;

            syncedIds.push(p.id.toString());

            // Prepare Upsert Operation
            bulkOps.push({
                updateOne: {
                    filter: { overpassId: p.id.toString() },
                    update: {
                        $setOnInsert: {
                            overpassId: p.id.toString(),
                            latitude: lat,
                            longitude: lon,
                            totalSlots: Math.floor(Math.random() * 20) + 15,
                            availableSlots: Math.floor(Math.random() * 10) + 5,
                            pricePerHour: parseFloat((Math.random() * 4 + 2).toFixed(2)),
                            image: `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400`
                        },
                        $set: {
                            name: finalName,
                            location: finalLocation
                        }
                    },
                    upsert: true
                }
            });
        }

        if (bulkOps.length > 0) {
            await Parking.bulkWrite(bulkOps);
        }

        // Return the actual updated/inserted documents
        const finalResults = await Parking.find({ overpassId: { $in: syncedIds } });
        res.json(finalResults);

    } catch (err) {
        console.error("Bulk Sync Error:", err);
        res.status(500).json({ error: "Sync failed" });
    }
};

exports.discoverNearby = async (req, res) => {
    try {
        const { lat, lon, city } = req.body;
        if (!lat || !lon) return res.status(400).json({ error: "Location required" });

        // DATABASE FIRST: Check if we already have enough records in this area
        const radius = 0.05; // Approx 5km
        const existing = await Parking.find({
            latitude: { $gte: lat - radius, $lte: lat + radius },
            longitude: { $gte: lon - radius, $lte: lon + radius }
        }).limit(20);

        // If we have data in our curated DB, USE IT!
        if (existing && existing.length >= 5) {
            console.log(`Serving ${existing.length} records from curated DB for ${city}`);
            return res.json(existing);
        }

        // FALLBACK: Query Overpass and sync if DB is dry
        const query = `[out:json];node["amenity"="parking"](around:5000,${lat},${lon});out 20;`;
        const overpassRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const overpassData = await overpassRes.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
            // Return existing DB results if Overpass is empty
            const existing = await Parking.find({
                latitude: { $gte: lat - 0.05, $lte: lat + 0.05 },
                longitude: { $gte: lon - 0.05, $lte: lon + 0.05 }
            }).limit(20);
            return res.json(existing);
        }

        // Use our existing sync logic (internal call or refactor)
        // For simplicity, we implement the bulk write here too
        const elements = overpassData.elements;
        const bulkOps = [];
        const syncedIds = [];

        for (const p of elements) {
            const pLat = p.lat || (p.center && p.center.lat);
            const pLon = p.lon || (p.center && p.center.lon);
            if (!pLat || !pLon) continue;

            const tags = p.tags || {};
            const street = tags['addr:street'] || tags['addr:suburb'] || tags['addr:neighbourhood'];
            const formalName = tags['name'];
            
            let finalName;
            if (formalName) {
                finalName = formalName.includes('Parking') ? formalName : `${formalName} Hub`;
            } else if (street) {
                finalName = `${street} Smart Hub`;
            } else {
                finalName = `Premium Hub ${p.id.toString().slice(-4)}`;
            }

            syncedIds.push(p.id.toString());
            bulkOps.push({
                updateOne: {
                    filter: { overpassId: p.id.toString() },
                    update: {
                        $setOnInsert: {
                            overpassId: p.id.toString(),
                            latitude: pLat,
                            longitude: pLon,
                            totalSlots: Math.floor(Math.random() * 30) + 20,
                            availableSlots: Math.floor(Math.random() * 15) + 5,
                            pricePerHour: parseFloat((Math.random() * 5 + 3).toFixed(2)),
                            image: `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400`
                        },
                        $set: {
                            name: finalName,
                            location: tags['addr:full'] || `${street || city || "Central Area"}, ${city || "Main St"}`
                        }
                    },
                    upsert: true
                }
            });
        }

        if (bulkOps.length > 0) await Parking.bulkWrite(bulkOps);
        const results = await Parking.find({ overpassId: { $in: syncedIds } });
        res.json(results);
    } catch (err) {
        console.error("Discover Error:", err);
        res.status(500).json({ error: "Discovery failed" });
    }
};

exports.getAllParking = async (req, res) => {
    try {
        const parking = await Parking.find();
        res.json(parking);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
};

exports.getParkingById = async (req, res) => {
    try {
        const parking = await Parking.findOne({ overpassId: req.params.id });
        if (!parking) return res.status(404).json({ error: "Parking not found" });
        res.json(parking);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
};
