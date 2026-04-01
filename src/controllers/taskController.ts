import { NextFunction, Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import Task from "../models/task";
import Team from "../models/team";
import User from "../models/user";

type AuthUser = {
  userId: string;
  email: string;
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
    const { title, description, teamId, assignedTo, dueDate, priority } =
      req.body as {
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

    // ✅ Check if current user is owner or member (single DB-backed logic)
    const isAuthorized = await Team.exists({
      _id: teamId,
      $or: [{ owner: currentUserId }, { members: currentUserId }],
    });

    if (!isAuthorized) {
      return res.status(403).json({
        message: "Only team owner or members can create tasks.",
      });
    }

    // ✅ Validate assigned user (ONLY team members allowed)
    if (assignedTo) {
      const isValidAssignee = await Team.exists({
        _id: teamId,
        members: assignedTo,
      });

      if (!isValidAssignee) {
        return res.status(400).json({
          message: "Task can only be assigned to team members.",
        });
      }
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

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = getAuthUserId(req);
    const { taskId } = req.params;

    const { title, description, assignedTo, dueDate, priority,status } =
      req.body as {
        title?: string;
        description?: string;
        assignedTo?: string;
        dueDate?: string;
        priority?: "low" | "medium" | "high";
        status?: "pending" | "in_progress" | "completed"; 
      };

    // 🔐 Validate user
    if (!isValidObjectId(currentUserId)) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // 🔐 Validate taskId
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    // 🔍 Fetch task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // 🔍 Fetch team
    const team = await Team.findById(task.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // 🔐 Authorization (owner OR member)
    const isAuthorized = await Team.exists({
      _id: task.teamId,
      $or: [{ owner: currentUserId }, { members: currentUserId }],
    });

    if (!isAuthorized) {
      return res.status(403).json({
        message: "Only team owner or members can update tasks.",
      });
    }

    // ✅ Validate title
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        message: "Title cannot be empty.",
      });
    }

    // ✅ Validate assigned user (if provided)
    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
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

      const isMember = await Team.exists({
        _id: task.teamId,
        members: assignedTo,
      });

      if (!isMember) {
        return res.status(400).json({
          message: "User is not part of the team.",
        });
      }

      task.assignedTo = user._id;
    }

    // ✅ Validate due date
    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date.",
        });
      }
      task.dueDate = parsedDueDate;
    }

    // ✏️ Update fields (only if provided)
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) task.priority = priority;

    task.status = status ?? task.status; // allow status update if provided
    task.updatedAt = new Date();

    await task.save();

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};

// get all tasks for a team

export const getAllTasksForATeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

// get a task by id

export const getTaskByid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = (req as Request & { user?: AuthUser }).user?.userId;
    const { taskId } = req.params;
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
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

export const assignTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = getAuthUserId(req);
    const { taskId } = req.params;
    const { assignedTo } = req.body as { assignedTo: string };

    // 🔐 Validation
    if (!isValidObjectId(currentUserId)) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!isValidObjectId(taskId) || !isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: "Invalid IDs provided." });
    }

    // 🔍 Fetch task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // 🔍 Fetch team
    const team = await Team.findById(task.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // 🛑 Only owner can assign
    const isOwner = await Team.exists({
      _id: task.teamId,
      owner: currentUserId,
    });

    if (!isOwner) {
      return res.status(403).json({
        message: "Only team owner can assign tasks.",
      });
    }

    // ✅ Validate user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({
        message: "Assigned user not found.",
      });
    }

    // ✅ Validate user is team member
    const isMember = await Team.exists({
      _id: task.teamId,
      members: assignedTo,
    });

    if (!isMember) {
      return res.status(400).json({
        message: "User is not part of the team.",
      });
    }

    // ✏️ Update
    task.assignedTo = user._id;
    // task.status = "in_progress";

    // optional activity log

    await task.save();

    return res.status(200).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = getAuthUserId(req);
    const { taskId } = req.params;

    if (!isValidObjectId(currentUserId)) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const team = await Team.findById(task.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const isOwner = team.owner?.toString() === currentUserId;
    const isAssignedUser = task.assignedTo?.toString() === currentUserId;

    if (!isOwner && !isAssignedUser) {
      return res.status(403).json({
        message: "Only assigned user or owner can complete the task.",
      });
    }

    if (task.status === "completed") {
      return res.status(400).json({
        message: "Task already completed.",
      });
    }

    if (!task.assignedTo) {
      return res.status(400).json({
        message: "Task must be assigned before completion.",
      });
    }

    // ✅ Update
    task.status = "completed";

    await task.save();

    return res.status(200).json({
      message: "Task completed successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};

// ✅ Extract userId safely
export const getAuthUserId = (req: Request): string | undefined => {
  return (req as Request & { user?: AuthUser }).user?.userId;
};

export const searchTasksGlobal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = getAuthUserId(req);
    const { search, page = 1, limit = 10 } = req.query as {
      search?: string;
      page?: number;
      limit?: number;
    };

    // 🔐 Validate user
    if (!isValidObjectId(currentUserId)) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // 🔍 Validate search
    if (!search?.trim()) {
      return res.status(400).json({
        message: "Search query is required.",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 🧠 Get all teams user belongs to (ONE query)
    const teams = await Team.find({
      $or: [{ owner: currentUserId }, { members: currentUserId }],
    }).select("_id");

    const teamIds = teams.map((t) => t._id);

    // 🚀 Search across ALL user's tasks
    const [tasks, total] = await Promise.all([
      Task.find(
        {
          teamId: { $in: teamIds },
          $text: { $search: search },
        },
        {
          score: { $meta: "textScore" },
        },
      )
        .sort({ score: { $meta: "textScore" } }) // 🔥 relevance
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Task.countDocuments({
        teamId: { $in: teamIds },
        $text: { $search: search },
      }),
    ]);

    return res.status(200).json({
      message: "Search results fetched",
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      tasks,
    });
  } catch (error) {
    return next(error);
  }
};