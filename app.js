const path = require('path');

const express = require('express');
const bodyParser = require('body-parser'); //parse request body and make it available in req.body object

//const errorController = require('./controllers/error');

//const sequelize = require('./util/database');

const mongoose = require('mongoose');

const helmet = require('helmet'); //enhancing security , add http headers
const compression = require('compression'); // compress - reduce size of response body
const morgan = require('morgan'); //acts like security guard
const fs = require('fs');  

var cors = require('cors');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'), 
  { flags: 'a'} 
);


app.use(cors()); 
app.use(helmet()); 
app.use(compression()); 
app.use(morgan('combined', { stream: accessLogStream }));


const userRoutes = require('./routes/user');  
const expenseRoutes = require('./routes/expense');                          
//const Expense = require('./models/expense');
//const User = require('./models/user');
 const purchaseRoutes = require('./routes/purchase');
 //const Order = require('./models/orders');
 const premiumFeatureRoutes = require('./routes/premiumFeature');
 const resetPasswordRoutes = require('./routes/resetpassword');
// const forgotpassword = require('./models/forgotpassword');

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));  

app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumFeatureRoutes);
app.use('/password', resetPasswordRoutes);

mongoose.connect('mongodb+srv://nivedithamh3:niveditha@cluster0.b8gmpdh.mongodb.net/?retryWrites=true&w=majority'
).then(result => {
  console.log('connected');
})
  .then(result => {
    app.listen(4000);
  }).catch(err => {
    console.log(err);
  });