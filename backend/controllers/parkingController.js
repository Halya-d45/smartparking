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
                            pricePerHour: (Math.random() * 4 + 2).toFixed(2),
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
