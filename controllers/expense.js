const Expense = require('../models/expense');
const User = require('../models/user');

exports.addExpense = async (req, res, next)=> {

   try{   
   
   const amount = req.body.amount;
   const description = req.body.description;
   const category = req.body.category;

   if(amount == undefined || amount.length === 0) {
      return res.status(400).json({success: false, message: 'Parameters missing'})
  }

  await Expense.create({ amount, description, category, userId: req.user.id}).then(expense => {
    console.log("amount",amount);
    console.log("req.user.totalExp",req.user.totalExpenses);
    const totalExpense = Number(req.user.totalExpenses) + Number(amount)
    console.log("totalExpense",totalExpense);
    User.update({
        totalExpenses: totalExpense
    },{
        where: {id: req.user.id} 
    }).then(async() => {
        res.status(200).json({newExpense: expense})
    })
    .catch(async(err) => {
        return res.status(500).json({success: false, error: err})
    })
  }).catch(async(err) => {
     return res.status(500).json({success: false, error: err})
  })
  } catch(err) {
    console.log(`posting data is not working`);
    res.status(500).json(err);
  }
}

//{ where: {userId: req.user.id}}
exports.getExpense = async (req, res, next) => {
    try{
      const expenses = await Expense.findAll({where:{userId:req.user.id}});
     console.log(expenses);
     return res.status(200).json({expenses,success:true})
    } catch(err){
     console.log('Get expense is failing', JSON.stringify(err));
     return res.status(500).json({error: err, success: false})
    }
   
}

exports.deleteExpense = async (req, res) => {
    const eId = req.params.id;
    console.log(req.params.id);
    try{
    if(req.params.id == 'undefined'){
       console.log('ID is missing');
      return res.status(400).json({err: 'ID is missing'})
    }
    await Expense.destroy({where: {id: eId}});
    res.sendStatus(200);
    } catch(err){
       console.log(err);
       res.status(500).json(err)
    }
}