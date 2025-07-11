import { useState } from "react";
import { CreateAcademyRequest } from "@/types/api/teacher";
import { Academy } from "@/types/api/teacher";

export function useAcademyForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);
  const [formData, setFormData] = useState<CreateAcademyRequest>({
    name: "",
    code: "",
    description: "",
    address: "",
    phoneNumber: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      address: "",
      phoneNumber: "",
    });
    setIsEditMode(false);
    setEditingAcademy(null);
  };

  const handleEditAcademy = (academy: Academy) => {
    setIsEditMode(true);
    setEditingAcademy(academy);
    setFormData({
      name: academy.name,
      code: academy.code,
      description: academy.description || "",
      address: academy.address || "",
      phoneNumber: academy.phoneNumber || "",
    });
    setIsExpanded(true); // 자동 확장
  };

  const handleCancel = () => {
    setIsExpanded(false);
    resetForm();
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.code.trim();
  };

  const getButtonText = () => {
    return isEditMode ? "학원 수정하기" : "학원 생성하기";
  };

  return {
    isExpanded,
    setIsExpanded,
    isEditMode,
    editingAcademy,
    formData,
    setFormData,
    resetForm,
    handleEditAcademy,
    handleCancel,
    isFormValid,
    getButtonText,
  };
}
