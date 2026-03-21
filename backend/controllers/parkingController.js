const Parking = require("../models/Parking");

exports.syncWithOverpass = async (req, res) => {
    try {
        const { elements, city } = req.body; 
        const synced = [];
        for (const p of elements) {
            const lat = p.lat || (p.center && p.center.lat);
            const lon = p.lon || (p.center && p.center.lon);

            if (!lat || !lon) continue;

            const tags = p.tags || {};
            
            // Extensive address extraction
            const street = tags['addr:street'] || tags['addr:place'] || tags['addr:full'];
            const area = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:hamlet'] || city || "Unknown Area";
            
            const fallbackName = street ? `Parking at ${street}` : `Parking near ${area}`;
            const finalName = tags.name || fallbackName;
            const finalLocation = street ? `${street}, ${area}` : `Area: ${area}`;

            let lot = await Parking.findOne({ overpassId: p.id.toString() });
            
            if (!lot) {
                lot = new Parking({
                    overpassId: p.id.toString(),
                    name: finalName,
                    location: finalLocation,
                    latitude: lat,
                    longitude: lon,
                    totalSlots: Math.floor(Math.random() * 20) + 15,
                    availableSlots: Math.floor(Math.random() * 10) + 5,
                    pricePerHour: (Math.random() * 4 + 2).toFixed(2),
                    image: `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400`
                });
                await lot.save();
            } else {
                // Proactively update name/location if they are currently generic
                if (lot.name === "Public Parking" || lot.name === "Unnamed Parking" || lot.location === "Available Area" || lot.location === "Public Parking Area") {
                    lot.name = finalName;
                    lot.location = finalLocation;
                    await lot.save();
                }
            }
            synced.push(lot);
        }
        res.json(synced);
    } catch (err) {
        console.error(err);
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
