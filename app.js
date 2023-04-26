const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');   

//const errorController = require('./controllers/error');

const sequelize = require('./util/database');


var cors = require('cors');

const app = express();

app.use(cors());   
 
const userRoutes = require('./routes/user');  
const expenseRoutes = require('./routes/expense');                          
const Expense = require('./models/expense');
const User = require('./models/user');

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));  

app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

//app.use(errorController.get404);

sequelize 
  .sync() 
  .then(result => {
    //console.log(result);
    app.listen(4000);
})
.catch(err => {
    console.log(err); 
});

