const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({  // Constructor model
    description:{
        type: String,
        required: true,
        trim: true
    },
    completed:{
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,  // says owner type is an Object ID
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})
// creating a model for tasks

const Task = mongoose.model('task', taskSchema)

module.exports = Task