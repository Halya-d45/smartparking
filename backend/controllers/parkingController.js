const Parking = require("../models/Parking");

exports.syncWithOverpass = async (req, res) => {
    const { elements } = req.body; // Array of objects from Overpass
    try {
        const synced = [];
        for (const p of elements) {
            const lat = p.lat || (p.center && p.center.lat);
            const lon = p.lon || (p.center && p.center.lon);

            if (!lat || !lon) continue;

            const tags = p.tags || {};
            const fallbackName = tags['addr:street'] || tags['addr:suburb'] || tags['addr:city'] || "Public Parking";
            const finalName = tags.name || fallbackName;
            const finalLocation = tags['addr:street'] || tags['addr:city'] || "Available Area";

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
            } else if (lot.name === "Unnamed Parking") {
                // Retroactively fix unnamed spots
                lot.name = finalName;
                lot.location = finalLocation;
                await lot.save();
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
