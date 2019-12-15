const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')
const { sendWelcomeEmails,sendCancelationEmail } = require('../emails/account')

//signup route
router.post('/users', async (req, res)=>{
    const user = new User(req.body)
  
     try{
         await user.save()  // saved in the database
         sendWelcomeEmails(user.email, user.name)
         const token = await user.generateAuthToken()
         res.status(201).send({user,token}) // only work when the above statement gets fulfilled
     }
     catch(e){
         res.status(400).send(e)
     }
 })

 //login route
 router.post('/users/login', async(req, res)=>{
     try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
     }
     catch(e){
        res.status(404).send()
     }
 })

 //logout route
 //in logout we dont submit anything to the body, everthing is already there in auth as the user is logged in and in auth we are returning the user as well as the current auth token 

 router.post('/users/logout', auth, async (req, res)=>{ 
    try{
        req.user.token = req.user.token.filter((token)=>{
            return token.token !== req.token   //here we ae putting the tokens in the token array which is not same as the current token - for logging out
            //removing current auth token leads to logout as the user is not authenticated anymore
        })
        await req.user.save()
     }
     catch(e){
        res.status(500).send()
     }
 })

 //logging out all the devices 
 router.post('/users/logoutAll', auth, async(req, res)=>{
     try{
          req.user.token = []
          await req.user.status(200).save()
          res.send() // send out 200 status
     }
     catch(e){
        req.status(500).send()
     }
 })
 
 router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user) //coz we are getting user from the auth
 })
  
 router.patch('/users/me', auth, async (req, res)=>{

     const updates = Object.keys(req.body) // makes the object properties into strings and put it in the array
     const allowedUpdates = ['name', 'age', 'email', 'password'] 
     const isValidOperation = updates.every((update)=>{ //to prevent if we try to update a proprtty that doesn't exixt
         return allowedUpdates.includes(update)
     })  
 
     if(!isValidOperation){
         return res.status(400).send({error:'Invalid updates!!'})
     }

     try{
         updates.forEach((update)=>{
            req.user[update] = req.body[update] // updating the user
         })
         await req.user.save()
         res.send(req.user)
     }
     catch(e){
         res.status(400).send()
     }
 })
 
 router.delete('/users/me', auth, async (req, res)=> {

     try{
          await req.user.remove() // remove() is a mongoose method
          sendCancelationEmail(req.user.email, req.user.name)
          await req.user.tasks.remove()
          res.send(req.user)
     }
     catch(e){
         res.status(400).send()
     }
 })

 const upload = multer({   // one of multer instance // option object imp to define what type of file we want as a validation
    // dest: 'avatars',
    limits:{ // for file size
        fileSize: 1000000
    },
    fileFilter(req, file, cb){  //for file type
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // using match for regular expression
          return cb(new Error('Please upload only jpg, jpeg or png'))
        }
        cb(undefined, true)
    }
})

// for creating and updating an avatar(profile pic)
 router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res)=>{
    //sharp is a npm library for auto-cropping and images formating
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer() // png() makes all the images into png format

     req.user.avatar = buffer
     await req.user.save()
     res.send()
 }, (error, req, res, next)=>{
     res.status(400).send({ error: error.message})
 })
 
 //for deleteing the avatar
 router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined  // this is how you delete
    await req.user.save()
    res.send()  // to send back a 200 request
 })

 // for getting the avatar
//  router.get('/users/:id/avatar', auth, async (req, res)=> {
//      try{
//         const avatar = await req.user.avatar.findById(req.param.id)
//      }
//      catch(e){
//          res.status(404).send()
//      }
//  })
 
// for getting the avatar
 router.get('/users/:id/avatar', async (req, res)=>{
     try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-type', 'image/png')  // converting binary into jpg to see the image when request is fulfilled
        res.send(user.avatar)
    }
     catch(e){
         res.status(404).send()
     }
 })

 module.exports = router