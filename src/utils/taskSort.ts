import { SortOrder } from "mongoose";

export const buildTaskSort = (
  sortBy?: string,
  sortOrder?: "asc" | "desc",
): Record<string, SortOrder | { $meta: any }> => {
  if (sortBy === "relevance") {
    return { score: { $meta: "textScore" } };
  }

  return {
    [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1,
  };
};