import { NextFunction, Request, Response } from "express";
import Team from "../models/team";
import mongoose from "mongoose";

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, members, owner, startDate } = req.body as {
      title: string;
      description: string;
      members: string[];
      owner: string;
      startDate: Date;
    };
    if (!title || !description || !members || !startDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (!members.every((member) => mongoose.Types.ObjectId.isValid(member))) {
      return res.status(400).json({
        message: "Invalid member IDs",
      });
    }
    const team = new Team({
      title,
      description,
      members,
      owner,
      startDate,
    });
    await team.save();
    return res.status(201).json({
      message: "Team created successfully",
      team: team,
      owner: owner,
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
    const teams = await Team.find();
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
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    const team = await Team.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Team deleted successfully",
      team: team,
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
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    if (!req.body) {
      return res.status(400).json({
        message: "Team data is required",
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
  if(!mongoose.Types.ObjectId.isValid(memberId as string)){
    return res.status(400).json({
      message: "Invalid member ID",
    });
  }
  return true;
}

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

    const { memberId } = req.body;
    // validate memberId is a valid mongoose object id
    if(!validateMemberId(memberId, res)){
      return;
    }
    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required",
      });
    }
    const team = await Team.findById(id);
    team?.members?.push(memberId);
    await team?.save();
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
) =>{

  try {
    const { id, memberId } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    // validate memberId is a valid mongoose object id
    
    if(!validateMemberId(memberId as string, res)){
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
      (member) => member?.toString() !== memberId
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