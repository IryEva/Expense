const Razorpay = require('razorpay');
const Order = require('../models/orders');
const userController = require('../models/user');
require('dotenv').config();

const jwt = require('jsonwebtoken');
function generateAccessToken(id,name,ispremiumuser){
    return jwt.sign({ userId : id , name:name,ispremiumuser }, 'niveditha')
 }

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const amount = 2500;

        const orderPromise = new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        }); 

        const order = await orderPromise;
        const user = req.user;
        const createdOrder = new Order({
            orderid: order._id,
            status: 'PENDING',
            userId: user._id
        });
        await createdOrder.save();

        return res.status(201).json({ order: createdOrder, key_id: rzp.key_id });
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
};

const updateTransactionStatus = async (req, res ) => {
    try {
        const userId = req.user.id;
        const { payment_id, order_id} = req.body;
        console.log(req.body.order_id);
        const order  = await Order.findOne({orderid : order_id})
        const promise1 =  order.updateOne({ paymentid: payment_id, status: 'SUCCESSFULL'}) 
        const promise2 =  req.user.updateOne({ ispremiumuser: true }) 
       
        Promise.all([promise1, promise2]).then(()=> {
            return res.status(202).json({sucess: true, message: "Transaction Successful",
             token: generateAccessToken(userId,undefined,true) });
        }).catch((error ) => {
            throw new Error(error)
        })          
    } catch (err) {
        console.log(err);
        res.status(403).json({ errpr: err, message: 'Something went wrong' })
    }
}

module.exports = {
    purchasepremium,
    updateTransactionStatus
}
