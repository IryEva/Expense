const User = require('../models/user');

 function isstringinvalid(string) {
     if(string == undefined || string.length=== 0){
         return true;
     }else {
         return false;
     }
 }


 exports.signup = async (req,res) => {      
     try{
         const { name, email , password } = req.body;
         console.log('****',email)
         if(isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password)){
             return res.status(400).json({err: "Bad params . something is missing"})
         }
         await User.create( { name,email,password})
            res.status(201).json({message: 'Succesfully done'})
     } catch(err) {
         res.status(500).json(err);

     }
 }

exports.login = async (req,res) => {
    try {
        const { email,password } = req.body ;
        console.log(email);
        if( isstringinvalid(email) || isstringinvalid(password)){
            return res.status(400).json({err: "Bad params . something is missing"})
        }
        const user = await User.findAll({where : { email }})
        if(user.length > 0) {
            if(user[0].password === password ){
                res.status(200).json({ success: true, message: "User Logged in Successfully"})
            } else {
                return res.status(400).json({ success:false, message: "Password is incorrect"})
            } 
        } else {
            return res.status(404).json({success: false, message:"User doesn't exist"})
        }
    } catch(err) {
        res.status(500).json({message:err , success:false})

    }
}

// module.exports = {
//     signup,
//     login

// }