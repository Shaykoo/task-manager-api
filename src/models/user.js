const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        // required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    token: [{  // for all the tokens generated for one user
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',  // id of the user // by user _id only we are getting all the data
    foreignField:'owner' // sets the relationship
})

userSchema.methods.toJSON = function(){ //this gets automatically triggered when we use res.send(user) as express calls JSON.stringify() on object before sending it to client and JSON.stringify triggers toJSON method defined in this file i.e user model
    const user = this
    const userObject = user.toObject() //converting user instance in JS object

    delete userObject.password
    delete userObject.token
    delete userObject.avatar  // coz we halready set a handler to get the avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function (){
    const user = this // instance of user model
    const token = await jwt.sign({ _id: user._id.toString()},process.env.JWT_SECRET) //generating token

    user.token = user.token.concat({token: token}) // concatinating all the tokens from different devices, so if logged out from one the other device wont suffer
    await user.save() // saving the schema for a particular user in the database
    return token
}

userSchema.statics.findByCredentials = async (email,  password)=>{
    const user = await User.findOne({email: email}) //as we know User model is an interface to the User database in mongoDB
    
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}


//Hash the plain text password before saving
userSchema.pre('save', async function(next){ // as we are saving the user only when newly created and upddating the info so 'save' targets bothof them
    const user = this // no need of this but just to understand where this is reffereing - userSchema

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//Delete all the tasks if the user is removed 

userSchema.pre('remove', async function(next){
    const user = this

    await Task.deleteMany({ owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
