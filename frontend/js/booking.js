const PARKING_API = `${CONFIG.API_BASE}/parking`;
const BOOKING_API = `${CONFIG.API_BASE}/booking`;

const urlParams = new URLSearchParams(window.location.search);
const lotId = urlParams.get('id');

let selectedSlot = null;

async function loadDetails() {
    if (!lotId) return;

    try {
        const res = await fetch(`${PARKING_API}/${lotId}`);
        const lot = await res.json();

        document.getElementById("lotName").innerText = lot.name;
        document.getElementById("lotLocation").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${lot.location}`;
        document.getElementById("lotPrice").innerText = `$${lot.pricePerHour}/hr`;
        document.getElementById("lotImage").src = lot.image;

        renderSlots(lot);
    } catch (err) {
        console.error(err);
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
            alert("Booking Confirmed!");
            window.location.href = "bookings.html";
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

loadDetails();