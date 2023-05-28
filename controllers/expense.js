const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
const UserServices = require('../services/userservices');
const S3services = require('../services/S3services');
const FileDownloaded = require('../models/filesdownloaded');


exports.downloadexpense = async (req,res) => {
  try{
    const expenses = await UserServices.getExpenses(req);
    console.log(expenses);
    const stringifiedExpenses = JSON.stringify(expenses);
  
    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename);
     await FileDownloaded.create({userId: req.user.id, urls: fileURL})
    res.status(200).json({fileURL,filename, success: true})

  } catch(err){
    res.status(500).json({ fileURL: '', success: false, err:err})
  }

}


exports.addExpense = async (req, res, next)=> {

  const t = await sequelize.transaction();

   try{   
   
   const amount = req.body.amount;
   const description = req.body.description;
   const category = req.body.category;

   if(amount == undefined || amount.length === 0) {
      return res.status(400).json({success: false, message: 'Parameters missing'})
  }

  const expense = await Expense.create({ amount, description, category, userId: req.user.id}, {transaction: t})
    console.log("amount",amount);
    console.log("req.user.totalExp",req.user.totalExpenses);
    const totalExpense = Number(req.user.totalExpenses) + Number(amount)
    console.log("totalExpense",totalExpense);
    await User.update({
        totalExpenses: totalExpense
    },{
        where: {id: req.user.id} , transaction: t
    })
        await t.commit();
        res.status(200).json({ expense: expense})
    
  } catch(err) {
    await t.rollback();
    console.log(`posting data is not working`);
    res.status(500).json(err);
  }
}

//{ where: {userId: req.user.id}}
exports.getExpense = async(req, res) => {
  const t = await sequelize.transaction();
  try {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
      const expenses = await Expense.findAll({ where: {userId: req.user.id} },{transaction:t})
      const user = await User.findOne({ where: {id: req.user.id} },{transaction:t});

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const nextPage = endIndex < expenses.length ? page + 1 : null;
      const prevPage = startIndex > 0 ? page - 1 : null;
      await t.commit();
      res.status(200).json({
          allExpensesDetails: expenses,
          currentPage: page,
          nextPage: nextPage,
          prevPage: prevPage,
          limit,
          allExpensesDetails: expenses.slice(startIndex, endIndex),
          balance: user.balance
      });
  } catch(error) {
      await t.rollback();
      console.log('Get expenses is failing', JSON.stringify(error))
      res.status(500).json({error: error})
  }
}

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
    const eId = req.params.id;
    console.log(req.params.id);
    try{
    if(req.params.id == 'undefined'){
       console.log('ID is missing');
      return res.status(400).json({err: 'ID is missing'})
    }
   const expense = await Expense.findOne({where: {
    id: eId,
    userId: req.user.id 
   }
  },{transaction:t});
  const totalExpenses = await Expense.sum('amount', {
    where: {userId: req.user.id}
})
const updatedTotalExpenses = totalExpenses - expense.amount
const noOfRows = await Expense.destroy({where: {id: eId, userId: req.user.id}});
await User.update({
  totalExpenses: updatedTotalExpenses
},{
  where: {id: req.user.id},
})
if(noOfRows === 0) {
  return res.status(404).json({message: `Expense doesn't belongs to user`})
}
await t.commit();
res.sendStatus(200);
  } catch(err){
    await t.rollback();
    console.log(err);
    res.status(500).json(err)
  }
}

exports.listOfFilesDownloaded = async (req, res) => {
  try{
      if(req.user.ispremiumuser) {
          const filesDownloaded = await FileDownloaded.findAll()//{where: {userId: req.user.id}});
          const urls = filesDownloaded.map(download => download.urls);
          console.log("all downloads====>>>",urls);

          res.status(200).json(urls);
      }
  }catch (err) {
      console.log(err);
  }
}
