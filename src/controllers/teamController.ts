import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../models/team";
import User from "../models/user";

type AuthUser = {
  userId: string;
  email: string;
};

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const owner = (req as Request & { user?: AuthUser }).user?.userId;
    const { title, description, members, startDate } = req.body as {
      title: string;
      description: string;
      members: string[];
      startDate: string | Date;
    };

    if (!owner || !mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle || !normalizedDescription) {
      return res.status(400).json({
        message: "Title, description  are required.",
      });
    }

    if (!members.every((member) => mongoose.Types.ObjectId.isValid(member))) {
      return res.status(400).json({
        message: "Invalid member IDs",
      });
    }

    // ✅ Ensure owner is always part of members
    const uniqueMembersSet = new Set([
      ...members.map((m) => m.toString()),
      owner.toString(),
    ]);

    const finalMembers = Array.from(uniqueMembersSet);

    const parsedStartDate = new Date(startDate);
    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date.",
      });
    }

    const team = new Team({
      title: normalizedTitle,
      description: normalizedDescription,
      members: finalMembers,
      owner,
      startDate: parsedStartDate,
    });

    await team.save();

    return res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // only owner and members of the team can see the team
    const owner = (req as Request & { user?: AuthUser }).user?.userId;
    const teams = await Team.find({ $or: [{ owner: owner }, { members: owner }] });

    return res.status(200).json({
      message: "Teams fetched successfully",
      teams: teams,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const owner = (req as Request & { user?: AuthUser }).user?.userId;
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    const team = await Team.findById(id);
    if (!team) {
      return res.status(400).json({
        message: "Team not found",
      });
    }
    if (team.owner?.toString() !== owner) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }
    await team.deleteOne();
    return res.status(200).json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
   
    const owner = (req as Request & { user?: AuthUser }).user?.userId;
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return res.status(400).json({
        message: "Team not found",
      });
    }
    if (!req.body) {
      return res.status(400).json({
        message: "Team data is required",
      });
    }
    if (existingTeam?.owner?.toString() !== owner) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const team = await Team.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      message: "Team updated successfully",
      team: team,
    });
  } catch (error) {
    return next(error);
  }
};

const validateMemberId = (memberId: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(memberId as string)) {
    return res.status(400).json({
      message: "Invalid member ID",
    });
  }
  return true;
};

export const addMemberToTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        message: "Invalid team ID",
      });
    }
    const getTeam = await Team.findById(id);
    if (!getTeam) {
      return res.status(400).json({
        message: "Team not found",
      });
    }

    const { memberId } = req.body;
    // validate memberId is a valid mongoose object id
    if (!validateMemberId(memberId, res)) {
      return;
    }
    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required",
      });
    }
    // the memberId should a valid user id
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    // here we need to add the teamId to which the user is being added as a member
    const team = await Team.findByIdAndUpdate(id, { $push: { members: memberId } }, { new: true });
    return res.status(200).json({
      message: "Member added to team successfully",
      team: team,
    });
  } catch (error) {
    return next(error);
  }
};

export const removeMemberFromTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, memberId } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    // validate memberId is a valid mongoose object id

    if (!validateMemberId(memberId as string, res)) {
      return;
    }
    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required",
      });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(400).json({
        message: "Team not found",
      });
    }
    team.members = team.members?.filter(
      (member) => member?.toString() !== memberId,
    );

    await team?.save();
    return res.status(200).json({
      message: "Member removed from team successfully",
      team: team,
    });
  } catch (error) {
    return next(error);
  }
};
