import { isValidObjectId, Types } from "mongoose";

export const buildTaskFilters = ({
  teamIds,
  search,
  status,
  priority,
  assignedTo,
  dueFrom,
  dueTo,
}: {
  teamIds:  Types.ObjectId[]; 
  search: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueFrom?: string;
  dueTo?: string;
}) => {
  const filters: any = {
    teamId: { $in: teamIds },
    isDeleted: false,
    $text: { $search: search },
  };

  if (status) filters.status = status;
  if (priority) filters.priority = priority;

  if (assignedTo && isValidObjectId(assignedTo)) {
    filters.assignedTo = assignedTo;
  }

  if (dueFrom || dueTo) {
    filters.dueDate = {};
    if (dueFrom) filters.dueDate.$gte = new Date(dueFrom);
    if (dueTo) filters.dueDate.$lte = new Date(dueTo);
  }

  return filters;
};