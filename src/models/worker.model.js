import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true
    },
    status:{
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },
    capacity:{
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    currenttasks:{
        type: Number,
        default: 0
    }
});
const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;