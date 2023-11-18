const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
         const saltrounds = 10;
         bcrypt.hash(password, saltrounds, async (err,hash) => {
            const newUser = new User({
                name,
                email,
                password: hash
            });
            await newUser.save();
            //await User.create( { name,email,password: hash})
            res.status(201).json({message: 'Succesfully done'})
         })
        
     } catch(err) {
         res.status(500).json(err);

     }
 }

 function generateAccessToken(id,name,ispremiumuser){
    return jwt.sign({ userId : id , name:name,ispremiumuser }, 'niveditha')
 }


exports.login = async (req,res) => {
    try {
        const { email,password } = req.body ;
        console.log(email);
        if( isstringinvalid(email) || isstringinvalid(password)){
            return res.status(400).json({err: "Bad params . something is missing"})
        }
        const user = await User.findOne({ email })
        if(user) {
            bcrypt.compare(password,user.password, (err,result) => {
                if(err){
                    throw new Error('something went wrong')
                }
                if(result === true){
                    return res.status(200).json({ success: true, message: "User Logged in Successfully",
                    token: generateAccessToken(user.id,user.name, user.ispremiumuser)})
                    // const token = generateAccessToken(user._id, user.name, user.ispremiumuser);
                    // console.log('User login Successfull')
                    // res.status(200).json({ success: true, message: 'User logged in successfully', token });
                } else {
                    return res.status(400).json({ success:false, message: "Password is incorrect"})
                }
            })
            
        } else {
            return res.status(404).json({success: false, message:"User doesn't exist"})
        }
    } catch(err) {
        res.status(500).json({message:err , success:false})

    }
}


