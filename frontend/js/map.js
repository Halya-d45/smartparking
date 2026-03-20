const API = "https://backend-api-uhdp.onrender.com/api/parking";

async function loadParking(){

const res = await fetch(API);

const data = await res.json();

console.log(data);

/* later show parking on map */

}

loadParking();