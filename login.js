async function login() {
  event.preventDefault()
    try{
        
        console.log(event.target.email.value);

        const loginDetails ={
            
            email: event.target.email.value,
            password: event.target.password.value

        }
        console.log(loginDetails)
        const response = await axios.post("http://localhost:4000/user/login",loginDetails)
          if(response.status === 200) {
            alert(response.data.message)
            localStorage.setItem('token',response.data.token)
            window.location.href = "../ExpTracker/expense.html"

          } else {
            throw new Error(response.data.message)

          }

    }
    catch(err){
        console.log(JSON.stringify(err))
        document.body.innerHTML += `<div style="color:red;">${err.message} <div> `

    }
}