const API = "https://backend-api-uhdp.onrender.com/api/booking";

async function bookSlot(){

const user = JSON.parse(localStorage.getItem("user"));

const slot = document.getElementById("slot").value;
const duration = document.getElementById("duration").value;

const res = await fetch(API+"/create",{

method:"POST",

headers:{'Content-Type':'application/json'},

body:JSON.stringify({

userId:user._id,
slot:slot,
duration:duration

})

});

const data = await res.json();

alert(data.message);

}