export type PoseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface BalletPose {
  id: number;
  name: string;
  imageUrl?: string;
  description: string;
  difficulty: PoseDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface BalletPoseResponse {
  data: BalletPose[];
}

export interface CreateBalletPoseRequest {
  name: string;
  imageUrl?: string;
  description: string;
  difficulty: PoseDifficulty;
}

export interface UpdateBalletPoseRequest {
  name?: string;
  imageUrl?: string;
  description?: string;
  difficulty?: PoseDifficulty;
}
