const User = require('../models/users');

function isstringinvalid(string) {
    if(string == undefined || string.length=== 0){
        return true;
    }else {
        return false;
    }
}

const signup = async (re,res) => {
    try{
        const { name, email , password } = req.body;
        console.log('email',email)
        if(isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password)){
            return res.status(400).json({err: "Bad params . something is missing"})
        }
        await User.create( { name,email,password})
           res.status(201).json({message: 'Succesfully done'})
    } catch(err) {
        res.status(500).json(err);

    }
}