import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type:String,
        required: true,

    },
    teamId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Team',
        required: true,
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    status:{
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
    dueDate:{
        type: Date,
    },
    priority:{
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    
})


const Task = mongoose.model("Task", TaskSchema);

export default Task;