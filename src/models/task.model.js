import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,   
        required: [true, 'Title is required'],
        trim:true
   
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim:true
    },
    priority:{
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'completed'],  
        default: 'pending'
    },
    deadline: { 
        type: Date
    },
    estimatedDeadline: {
        type: Date
    },
    estimatedDuration: {
    type: Number
   
},

    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task' 
    }],
    assignedWorker:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;