import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMyAcademy } from "@/api/teacher";

export function useAcademyAdminPermission() {
  const { data: session } = useSession();

  const { data: academy, isLoading } = useQuery({
    queryKey: ["teacher-academy"],
    queryFn: getMyAcademy,
    enabled: !!session?.user,
  });

  const hasAdminPermission = (): boolean => {
    if (!academy?.admins || !session?.user?.id) return false;

    const currentTeacherId = Number(session.user.id);
    const adminRecord = academy.admins.find(
      (admin) => admin.teacherId === currentTeacherId
    );

    return adminRecord?.role === "OWNER" || adminRecord?.role === "ADMIN";
  };

  return {
    academy,
    isLoading,
    hasAdminPermission,
  };
}
