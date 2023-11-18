let submitbtn = document.getElementById('submit');

submitbtn.addEventListener('click', signup);

async function signup() {
   event.preventDefault();
   try{
    //const email= document.getElementById("email").value;
    // console.log(email);
    // console.log(event.target.email.value);
    //  const signupDetails ={
    //    name: event.target.name.value,
    //    email: event.target.email.value,
    //    password: event.target.password.value 

    //  }   
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const signupDetails = {
      name,
      email,
      password
    }
     console.log(signupDetails)
     const response = await axios.post("http://localhost:4000/user/signup",signupDetails)
     if(response.status === 201) {
       window.location.href = "../login.html";

     } else {
       throw new Error('Failed to login')

     }  

   }
   catch(err){
     document.body.innerHTML += `<div style="color:red;">${err} <div> `;

   }
 }