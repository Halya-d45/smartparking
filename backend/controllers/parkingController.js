const Parking = require("../models/Parking");

exports.syncWithOverpass = async (req, res) => {
    const { elements } = req.body; // Array of objects from Overpass
    try {
        const synced = [];
        for (const p of elements) {
            let lot = await Parking.findOne({ overpassId: p.id.toString() });
            if (!lot) {
                // Initialize with random simulation data
                lot = new Parking({
                    overpassId: p.id.toString(),
                    name: p.tags.name || "Unnamed Parking",
                    location: p.tags['addr:street'] || "Unknown Street",
                    latitude: p.lat,
                    longitude: p.lon,
                    totalSlots: Math.floor(Math.random() * 20) + 10,
                    availableSlots: Math.floor(Math.random() * 10) + 1,
                    pricePerHour: (Math.random() * 5 + 2).toFixed(2),
                    image: `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400`
                });
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
