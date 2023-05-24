function forgotpassword(e) {
    e.preventDefault(e);
    const email = document.getElementById('email').value;

    const userDetails = {
        email
    }

    axios.post('http://localhost:4000/password/forgotpassword',userDetails).then(response => {
        if(response.status == 202){
            document.body.innerHTML += '<div style="color:green;">Mail Successfuly sent <div>'
        } else {
            throw new Error('Something went wrong!!!')
        }

    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}