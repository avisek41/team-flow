import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/task";
import Team from "../models/team";
import User from "../models/user";


type AuthUser = {
    userId: string;
    email: string;
  };


export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
    const { title, description, teamId, assignedTo, dueDate, priority } = req.body as {
      title: string;
      description?: string;
      teamId: string;
      assignedTo?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    };

    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    }

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        message: "Valid team ID is required.",
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        message: "Team not found.",
      });
    }

    const isOwner = team.owner?.toString() === currentUserId;
    const isMember =
      team.members?.some((member) => member?.toString() === currentUserId) ?? false;

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Only team owner or members can create tasks.",
      });
    }

    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          message: "Invalid assigned user ID.",
        });
      }

      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({
          message: "Assigned user not found.",
        });
      }
    }

    let parsedDueDate: Date | undefined;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date.",
        });
      }
    }

   

    const task = new Task({
      title: title.trim(),
      description: description?.trim() ?? "",
      teamId,
      assignedTo: assignedTo || undefined,
      dueDate: parsedDueDate,
      priority: priority ?? "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await task.save();
    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};


// get all tasks for a team

export const getAllTasksForATeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
        const { teamId } = req.params;
        if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Unauthorized user.",
            });
        }
        const tasks = await Task.find({ teamId: teamId });
        return res.status(200).json({
            message: "Tasks fetched successfully",
            tasks: tasks,
        });
    } catch (error) {
        return next(error);
    }
}


// get a task by id

export const getTaskByid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
    const {taskId} = req.params;
    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId as string)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }
    const task = await Task.findById(taskId as string);
    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }
    return res.status(200).json({
      message: "Task fetched successfully",
      task: task,
    });
  } catch (error) {
    return next(error);
    
  }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }
    
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }
    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return next(error);
    
  }
}