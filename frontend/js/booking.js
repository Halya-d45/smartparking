const PARKING_API = `${CONFIG.API_BASE}/parking`;
const BOOKING_API = `${CONFIG.API_BASE}/booking`;

const urlParams = new URLSearchParams(window.location.search);
const lotId = urlParams.get('id');

let selectedSlot = null;
let basePrice = 0;

async function loadDetails() {
    if (!lotId) return;

    try {
        const res = await fetch(`${PARKING_API}/${lotId}`);
        const lot = await res.json();

        document.getElementById("lotName").innerText = lot.name;
        document.getElementById("lotLocation").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${lot.location}`;
        
        basePrice = lot.pricePerHour || 0;
        updatePriceDisplay();
        
        document.getElementById("lotImage").src = lot.image;

        renderSlots(lot);
    } catch (err) {
        console.error(err);
    }
}

function updatePriceDisplay() {
    const durationEl = document.getElementById("duration");
    if (!durationEl) return;
    const duration = durationEl.value;
    const totalPrice = basePrice * parseInt(duration);
    document.getElementById("lotPrice").innerText = `$${totalPrice.toFixed(2)}`;
    
    const priceLabel = document.getElementById("priceLabel");
    if (priceLabel) {
        priceLabel.innerText = duration == 1 ? "1 Hour Fee" : `Total Fee (${duration} Hours)`;
    }
}

function renderSlots(lot) {
    const grid = document.getElementById("slotGrid");
    grid.innerHTML = "";

    // Simulate slots based on total/available counts
    const total = lot.totalSlots || 20;
    const available = lot.availableSlots;
    
    // For demo: mark some random slots as booked if available < total
    const bookedCount = total - available;
    const bookedIndices = new Set();
    while(bookedIndices.size < bookedCount) {
        bookedIndices.add(Math.floor(Math.random() * total));
    }

    for (let i = 1; i <= total; i++) {
        const isBooked = bookedIndices.has(i-1);
        const slot = document.createElement("div");
        slot.className = `slot ${isBooked ? 'booked' : 'available'}`;
        slot.innerText = `P-${i}`;
        
        if (!isBooked) {
            slot.onclick = () => select(slot, `P-${i}`);
        }
        grid.appendChild(slot);
    }
}

function select(el, id) {
    document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
    el.classList.add("selected");
    selectedSlot = id;
    document.getElementById("confirmBtn").disabled = false;
}

async function confirmBooking() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login to book");
        window.location.href = "login.html";
        return;
    }

    const duration = document.getElementById("duration").value;

    const bookingData = {
        userId: user.id,
        parkingId: lotId,
        slot: selectedSlot,
        duration: parseInt(duration)
    };

    try {
        const res = await fetch(`${BOOKING_API}/create`, {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await res.json();
        if (res.ok) {
            alert("Booking Confirmed! Access your hub details now.");
            window.location.href = "bookings.html";
        } else {
            if (data.error === "Token is not valid" || res.status === 401) {
                alert("Your session has securely expired. Please log in again to continue.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
            } else {
                alert("Error: " + data.error);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

loadDetails();

document.addEventListener("DOMContentLoaded", () => {
    const durationSelectEl = document.getElementById("duration");
    if (durationSelectEl) {
        durationSelectEl.addEventListener("change", updatePriceDisplay);
    }
});