import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
      index: true, // 🔥 filtering optimization
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
// 🔥 ADD THIS (VERY IMPORTANT)
TaskSchema.index(
  {
    title: "text",
    description: "text",
  },
  {
    weights: {
      title: 5,        // 🔥 title more important
      description: 2,
    },
  }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
