const API = "http://localhost:5000/api/auth";

async function signup(){

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API+"/signup",{

method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({name,email,password})

});

const data = await res.json();

alert(data.message);

window.location.href="login.html";

}


async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API+"/login",{

method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({email,password})

});

const data = await res.json();

if(data.user){

localStorage.setItem("user",JSON.stringify(data.user));

window.location.href="dashboard.html";

}

else{

alert(data.error);

}

}