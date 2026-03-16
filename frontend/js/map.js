const API = "http://localhost:5000/api/parking";

async function loadParking(){

const res = await fetch(API);

const data = await res.json();

console.log(data);

/* later show parking on map */

}

loadParking();