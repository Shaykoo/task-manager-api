const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(userRouter) // for registering the Router functionaliy in this app
app.use(taskRouter)


app.listen(port,()=>{
    console.log(`Server is up and running at ${port}`)
})

