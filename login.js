async function signup(e) {
    try{
        e.preventDefault();
        console.log(e.target.email.value);

        const loginDetails ={
            
            email: e.target.email.value,
            password: e.target.password.value

        }
        console.log(loginDetails)
        const reponse = await axios.post("http://localhost:3000/user/login",signupDetails)
          if(Response.status === 201) {
            window.location.href = "../Signup/sign.html"

          } else {
            throw new Error('Failed to login')

          }

    }
    catch(err){
        console.log(JSON.stringify(err))
        document.body.innerHTML += `<div style="color:red;">${err.message} <div> `

    }
}