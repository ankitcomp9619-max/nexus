import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
     name:{
        type: String,
        required: [true, 'Name is required'],
        unique: true    
     },
        task:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task is required']
        },
        status:{
        type: String,
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'  
        },
        creadtedAt: {
        type: Date,
        default: Date.now
        }
    });

    const workflow = mongoose.model("Workflow",taskSchema);
    module.exports = workflow;