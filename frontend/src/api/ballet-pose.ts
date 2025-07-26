import axiosInstance from "@/lib/axios";
import {
  BalletPose,
  CreateBalletPoseRequest,
  UpdateBalletPoseRequest,
} from "@/types/api/ballet-pose";

// 발레 자세 목록 조회
export const getBalletPoses = async (
  difficulty?: string
): Promise<BalletPose[]> => {
  const params = difficulty ? `?difficulty=${difficulty}` : "";
  const response = await axiosInstance.get(`/ballet-poses${params}`);
  return response.data;
};

// 발레 자세 상세 조회
export const getBalletPose = async (id: number): Promise<BalletPose> => {
  const response = await axiosInstance.get(`/ballet-poses/${id}`);
  return response.data;
};

// 발레 자세 생성 (관리자용)
export const createBalletPose = async (
  data: CreateBalletPoseRequest
): Promise<BalletPose> => {
  const response = await axiosInstance.post("/ballet-poses", data);
  return response.data;
};

// 발레 자세 수정 (관리자용)
export const updateBalletPose = async (
  id: number,
  data: UpdateBalletPoseRequest
): Promise<BalletPose> => {
  const response = await axiosInstance.patch(`/ballet-poses/${id}`, data);
  return response.data;
};

// 발레 자세 삭제 (관리자용)
export const deleteBalletPose = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/ballet-poses/${id}`);
};
