const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

const getUserLeaderBoard = async (req,res) => {
    try{
        const users =await  User.findAll()
        const expenses = await Expense.findAll();
        const aggreExp = {}
        console.log(aggreExp);
        expenses.forEach((expense) => {
            //parseInt(expense.amount);
            if(aggreExp[expense.userId]){
                aggreExp[expense.userId] += parseInt(expense.amount);
            }else {
                aggreExp[expense.userId] = parseInt(expense.amount);
            }
            
        })
        var userLeaderBoardDetails = [];
        users.forEach((user) => {
            userLeaderBoardDetails.push({ name:user.name, total_cost: aggreExp[user.id]})
        })
        console.log(userLeaderBoardDetails);
        userLeaderBoardDetails.sort((a,b) => b.total_cost - a.total_cost);
        res.status(200).json(userLeaderBoardDetails);
    }catch(err){
        console.log(err);
        res.status(500).json(err)
    }
}

module.exports = {
    getUserLeaderBoard
}