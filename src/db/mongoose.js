const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL //url with database name

mongoose.connect(connectionURL, {
     useNewUrlParser:true,
     useCreateIndex: true,
     findAndModify: false 
     // just to avoid the depreciation warning in the console
})