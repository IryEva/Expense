const Expense = require("../models/expense");
const User = require("../models/user");
const S3services = require("../services/S3services");
const FileDownloaded = require("../models/filesdownloaded");


exports.addExpense = async (req, res, next) => {
  //const t = await sequelize.transaction();

  try {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;  

    if (amount == undefined || amount.length === 0) {  
      return res
        .status(400)
        .json({ success: false, message: "Parameters missing" });
    }

    const expense = new Expense({
      amount,
      description,
      category,
      userId: req.user.id,
    });
    await expense.save();
    console.log("amount", amount);
    console.log("req.user.totalExp", req.user.totalExpenses); 
    const totalExpense = Number(req.user.totalExpenses) + Number(amount);
    console.log("totalExpense", totalExpense,req.user.id);
    await User.findByIdAndUpdate(
      req.user.id,{totalExpenses: totalExpense } 
    );
    //User.findById()
    //await t.commit();
    res.status(200).json({ expense: expense });
  } catch (err) {
    //await t.rollback();
    console.log(`posting data is not working`);
    res.status(500).json(err);
  }
};

//{ where: {userId: req.user.id}}
exports.getExpense = async (req, res) => {
  //const t = await sequelize.transaction();
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const expenses = await Expense.find({ userId: req.user.id });
    const user = await User.findById(req.user.id);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const nextPage = endIndex < expenses.length ? page + 1 : null;
    const prevPage = startIndex > 0 ? page - 1 : null;
    //await t.commit();
    res.status(200).json({
      allExpensesDetails: expenses,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
      limit,
      allExpensesDetails: expenses.slice(startIndex, endIndex),
      balance: user.balance,
    });
  } catch (error) {
    //await t.rollback();
    console.log("Get expenses is failing", JSON.stringify(error));
    res.status(500).json({ error: error });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    console.log("cccccccccccc",req.params);
    if (!req.params.id) {
      console.log("ID is missing");
      return res.status(400).json({ err: "ID is missing" });
    }
    const expenseId = req.params.id;
    console.log("oooooooooo",expenseId); 
    const expense = await Expense.findByIdAndDelete(
       expenseId,
     // userId: req.user.id,
    );
    if (!expense) {
      return res
        .status(404)
        .json({ message: `Expense doesn't belong to the user` });
    }
    const updatedTotalExpenses = req.user.totalExpenses - expense.amount;
    await User.findByIdAndUpdate(
       req.user.id ,
      { totalExpenses: updatedTotalExpenses } 
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};


exports.downloadexpense = async (req, res) => {
  try {
    //console.log(req.user.select('expenses'));
    const userExpenses = await Expense.find({userId:req.user._id});
    console.log(userExpenses);
    const stringifiedExpenses = JSON.stringify(userExpenses); //to convert from object to string

    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`; //current date and time
    console.log(stringifiedExpenses,filename);
    const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename);  
    const download = await FileDownloaded.create({ userId: req.user.id, urls: fileURL });
    console.log(download);
    res.status(200).json({ fileURL, filename, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ fileURL: "", success: false, err: err });
  }
};       


exports.listOfFilesDownloaded = async (req, res) => {
  try {
    if (req.user.ispremiumuser) {
      const filesDownloaded = await FileDownloaded.find(); //{where: {userId: req.user.id}});
      const urls = filesDownloaded.map((download) => download.urls);
      console.log("all downloads====>>>", urls);

      res.status(200).json(urls);
    }
  } catch (err) {
    console.log(err);
  }
};
