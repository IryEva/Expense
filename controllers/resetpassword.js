const bcrypt = require('bcrypt');

const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');

const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');
const validator = require('validator');

require('dotenv').config();

const forgotpassword = async (req, res) => {
    try {

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;
        const transEmailApi = new Sib.TransactionalEmailsApi();
        
        const { email } =  req.body;
        const user = await User.findOne({ email });
        if(user){  
            const id = uuid.v4();
            await Forgotpassword.create({ id , userId: user._id, isActive: true });

            if (!validator.isEmail(email.toLowerCase())) {
                    return res.status(400).json({ error: 'Invalid email address' });
            }
             
            const sender = {email:'nivedithamh3@gmail.com'};
            const receiver = [{ email }];

            const msg = {
                sender,
                to: receiver,
                subject: 'Password reset request for your account',
                textContent: 'We received a request to reset the password for your account. Please click on the link to reset the password',
                htmlContent: `<p>Hello,</p>
                <p>We received a request to reset the password for your account. Please follow the link below to reset your password:</p>
                <p><a href="http://localhost:4000/password/resetpassword/${id}">Reset Password</a></p><p>If you did not request this password reset, please ignore this email and contact us immediately.</p><p>Thank you,
                </p><p>Expensify</p>`
            }
 
            const response = await transEmailApi.sendTransacEmail(msg)
           
            return res.status(202).json({message: 'Link to reset password sent to your mail ', success: true });
        }else {
            throw new Error(`User doesn't exist`)
        }
    } catch(err){
        console.error(err)
        return res.json({ message: err, success: false });
    }
}

const resetpassword = async(req, res) => {
    try{
        const id =  req.params._id;
        console.log(id);
        //console.log(req.user.id);
        const forgotpasswordrequest = await Forgotpassword.findOne({ id , isActive: true})
        console.log(forgotpasswordrequest);
        if(forgotpasswordrequest && forgotpasswordrequest.userId){
            await forgotpasswordrequest.updateOne({ isActive: false});
            return res.status(200).send(`<html>
                <script>
                    function formsubmitted(e){
                        e.preventDefault();
                        console.log('called')
                    }
                </script>

                <form action="/password/updatepassword/${id}" method="get">
                    <label for="newpassword">Enter New password</label>
                    <input name="newpassword" type="password" required></input>
                    <button>reset password</button>
                </form>
                </html>`
            )
            //res.end()
    }else {
         return res.status(404).json({ error: 'Reset request not found or inactive', success: false });
    }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, success: false });
    }
    
}

const updatepassword =async (req, res) => {

    try {
        const { newpassword } = req.query;
        const  resetpasswordid = req.params._id;
        console.log(newpassword);
        //console.log(resetpasswordid);
        const resetpasswordrequest = await Forgotpassword.findOne({ id: resetpasswordid, isActive: true });
            if (resetpasswordrequest && resetpasswordrequest.userId) {
                const user = await User.findById(resetpasswordrequest.userId);
                
                if (user) {
                    const saltRounds = 10;
                    const hash = await bcrypt.hash(newpassword, saltRounds);
                    
                    await user.updateOne({ password: hash });
                    return res.status(201).json({ message: 'Successfully updated the new password', success: true });
                } else {
                    return res.status(404).json({ error: 'No user exists', success: false });
                }
            }
        
    } catch(error){
        console.log(error);
        return res.status(403).json({ error, success: false } )
    }
}

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}