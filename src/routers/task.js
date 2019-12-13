const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

// Tasks operations andd routes
router.post('/tasks', auth, async (req, res)=>{
    // const task = new Task(req.body)
   const task = new Task({
       ...req.body,      // copies all the info in the body to this object ,... expands the array into individual elements
       owner: req.user._id //this is coming from auth
   })

    try{
        await task.save() 
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send()
    }
})


//Here we have 3 options of getting data 
//-Get all the tasks
//-Get the tasks where completed== 'true'
//-Get the tasks where completed== 'false'
router.get('/tasks', auth, async (req, res)=>{

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1  //-1 for descending and 1 for ascending
        // and we are sorting with createdAt which is part[0]
    }

    try{
        await req.user.populate({
            path: 'tasks',  // populating the tasks array in user model which is coming from auth
            match: match ,  //can reduce by using short-hand property
            options: {
                limit: parseInt(req.query.limit),//limit andskip are query properties
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()         
        res.send(req.user.tasks)//as user has tasks as virtual field in the model 
    }
    catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id:_id, owner: req.user._id }) //fetched by the user only who created it
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body) // makes the object properties into strings and put it in the array
    const allowedUpdates = ['description', 'completed'] 
    const isValidOperation = updates.every((update)=>{ //to prevent if we try to update a proprtty that doesn't exixt
        return allowedUpdates.includes(update)
    })  

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!!'})
    }
    try{
        const task = await Task.findOne({_id, owner: req.user._id})  //found the task to update
        
        if(!task){ 
            res.status(404).send()
        }

        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()
        
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res)=> {
    const _id = req.params.id

    try{
         const task = await Task.findOneAndDelete({_id, owner: req.user._id})

         if(!task){
             res.status(404).send()
         }
         res.status(201).send('The Task is deleted successfully')
    }
    catch(e){
        res.status(400).send()
    }
})

module.exports = router