const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const currentBooking = {
    bookingId: urlParams.get('bookingId') || '6312cd76fa9d2f0012a6a589',
    parkingLot: urlParams.get('parkingLot') || 'LK-107',
    slotNumber: urlParams.get('slotNumber') || 'A2',
    date: urlParams.get('date') || new Date().toISOString().slice(0, 10),
    durationHours: Number(urlParams.get('duration')) || 2,
    ratePerHour: Number(urlParams.get('ratePerHour')) || 75,
    totalAmount: Number(urlParams.get('totalAmount')) || (Number(urlParams.get('duration')) || 2) * (Number(urlParams.get('ratePerHour')) || 75)
};

const totalAmount = currentBooking.totalAmount;

const parkLotEl = document.getElementById('parkingLotId');
const slotEl = document.getElementById('slotNumber');
const dateEl = document.getElementById('bookingDate');
const durEl = document.getElementById('durationValue');
const totalEl = document.getElementById('totalAmount');
const paymentAmountEl = document.getElementById('paymentAmount');

parkLotEl.textContent = currentBooking.parkingLot;
slotEl.textContent = currentBooking.slotNumber;
dateEl.textContent = currentBooking.date;
durEl.textContent = `${currentBooking.durationHours}h`;
totalEl.textContent = `₹ ${totalAmount.toFixed(2)}`;
paymentAmountEl.textContent = totalAmount.toFixed(2);

const methodTabs = document.querySelectorAll('.method-tab');
const methodContents = {
    UPI: document.getElementById('upiContent'),
    Card: document.getElementById('cardContent'),
    NetBanking: document.getElementById('netbankingContent'),
};

methodTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        methodTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        Object.values(methodContents).forEach((content) => content.classList.add('hidden'));
        methodContents[tab.dataset.method].classList.remove('hidden');
    });
});

const statusEl = document.getElementById('paymentStatus');
const payNowBtn = document.getElementById('payNowBtn');
const receiptSection = document.getElementById('receiptSection');
const receiptContent = document.getElementById('receiptContent');
const paymentHistory = document.getElementById('paymentHistory');

const showStatus = (text, type) => {
    statusEl.textContent = text;
    statusEl.className = `status-text ${type}`;
};

const loadPaymentHistory = async () => {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/payment/payments/${user._id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.payments) {
            paymentHistory.innerHTML = data.payments.map((p) => {
                const statusClass = p.paymentStatus === 'Success' ? 'status-success' : p.paymentStatus === 'Failed' ? 'status-failed' : 'status-pending';
                return `<div class="history-item"><div><strong>Txn:</strong> ${p.transactionId.slice(0, 8)}</div><div>${p.parkingLot}/${p.slotNumber}</div><div>₹ ${p.amount.toFixed(2)}</div><div class="${statusClass}">${p.paymentStatus}</div></div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Payment history error', error);
    }
};

const maskCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    const last4 = digits.slice(-4);
    return `**** **** **** ${last4}`;
};

const verifyPaymentStatus = async (transactionId, success) => {
    try {
        const res = await fetch(`${CONFIG.API_BASE}/payment/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ transactionId, success })
        });
        return await res.json();
    } catch (error) {
        console.error('verifyPayment failed', error);
        return null;
    }
};

const makePayment = async () => {
    const method = document.querySelector('.method-tab.active').dataset.method;
    let valid = true;
    let details = {
        bookingId: currentBooking.bookingId,
        parkingLot: currentBooking.parkingLot,
        slotNumber: currentBooking.slotNumber,
        amount: totalAmount,
        paymentMethod: method
    };

    if (method === 'UPI') {
        const upi = document.getElementById('upiId').value.trim();
        if (!upi.match(/^\w+@\w+$/)) {
            valid = false;
            showStatus('Enter valid UPI ID', 'status-failed');
        }
        details.upiId = upi;
    } else if (method === 'Card') {
        const cardNum = document.getElementById('cardNumber').value.trim();
        const expiry = document.getElementById('cardExpiry').value.trim();
        const cvv = document.getElementById('cardCVV').value.trim();

        if (!cardNum.replace(/\s/g, '').match(/^\d{16}$/)) {
            valid = false;
            showStatus('Invalid card number', 'status-failed');
        }
        if (!expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) {
            valid = false;
            showStatus('Invalid expiry date', 'status-failed');
        }
        if (!cvv.match(/^\d{3}$/)) {
            valid = false;
            showStatus('Invalid CVV', 'status-failed');
        }
        details.cardNumber = maskCardNumber(cardNum);
        details.cardExpiry = expiry;
    } else if (method === 'NetBanking') {
        const bank = document.getElementById('netbankingBank').value;
        if (!bank) {
            valid = false;
            showStatus('Select bank for net banking', 'status-failed');
        }
        details.bank = bank;
    }

    if (!valid) return;

    payNowBtn.disabled = true;
    payNowBtn.textContent = 'Processing...';
    showStatus('Processing payment…', 'status-pending');

    try {
        const res = await fetch(`${CONFIG.API_BASE}/payment/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(details)
        });
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.error || 'Payment failed');
        }

        const success = Math.random() > 0.2;
        const verifyResult = await verifyPaymentStatus(result.payment.transactionId, success);

        if (verifyResult && verifyResult.payment?.paymentStatus === 'Success') {
            showStatus('Payment Successful', 'status-success');
            displayReceipt(verifyResult.payment);

            if (currentBooking.bookingId) {
                await fetch(`${CONFIG.API_BASE}/booking/update-payment-status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        bookingId: currentBooking.bookingId,
                        isPaid: true,
                        paymentStatus: 'Confirmed'
                    })
                });
            }
        } else {
            showStatus('Payment Failed', 'status-failed');
        }

        await loadPaymentHistory();
    } catch (error) {
        console.error(error);
        showStatus('Payment request failed', 'status-failed');
    } finally {
        payNowBtn.disabled = false;
        payNowBtn.innerHTML = `Pay ₹ <span>${totalAmount}</span>`;
    }
};

const displayReceipt = (payment) => {
    receiptSection.classList.remove('hidden');
    receiptContent.innerHTML = `
        <div class="receipt-item"><strong>Receipt ID:</strong> ${payment.transactionId}</div>
        <div class="receipt-item"><strong>Date:</strong> ${new Date(payment.timestamp).toLocaleString()}</div>
        <div class="receipt-item"><strong>Parking Lot:</strong> ${payment.parkingLot}</div>
        <div class="receipt-item"><strong>Slot:</strong> ${payment.slotNumber}</div>
        <div class="receipt-item"><strong>Amount:</strong> ₹ ${payment.amount}</div>
        <div class="receipt-item"><strong>Payment Method:</strong> ${payment.paymentMethod}</div>
        <div class="receipt-item"><strong>Status:</strong> ${payment.paymentStatus}</div>
    `;
};

const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
downloadReceiptBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
    <html><head><title>Receipt</title><style>
        body{font-family:Arial,sans-serif;background:#0a0a0f;color:#f8fafc;}
        .rec{max-width:680px;margin:40px auto;background:#111827;padding:20px;border-radius:12px;}
        h2{color:#38bdf8;}
        p{margin:.6rem 0;}
    </style></head><body><div class="rec">
    <h2>Smart Parking Receipt</h2>${receiptContent.innerHTML}
    <p style="margin-top:20px;">Thank you for your payment.</p>
    </div></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
});

payNowBtn.addEventListener('click', makePayment);
loadPaymentHistory();