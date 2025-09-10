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
