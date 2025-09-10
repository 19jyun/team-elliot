import React, { useState, useEffect } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { usePrincipalApi } from "@/hooks/api/usePrincipalApi";
import { PrincipalEnrollment, PrincipalRefundRequest } from "@/types/api/principal";

interface ClassMapValue {
  id: number;
  className: string;
  teacherName: string;
  pendingCount: number;
  refundCount: number;
}

interface PrincipalClassListProps {
  rawData: PrincipalEnrollment[] | PrincipalRefundRequest[];
  onClassClick: (classId: number) => void;
}

const PrincipalClassList: React.FC<PrincipalClassListProps> = ({ rawData, onClassClick }) => {
  const [classes, setClasses] = useState<ClassMapValue[]>([]);

  useEffect(() => {
    if (!rawData || rawData.length === 0) return;

    const classMap = new Map<number, ClassMapValue>();

    const isEnrollmentData = (data: PrincipalEnrollment[] | PrincipalRefundRequest[]): data is PrincipalEnrollment[] => {
      return data.length > 0 && 'session' in data[0];
    };

    if (isEnrollmentData(rawData)) {
      const pendingEnrollments = rawData.filter((enrollment: PrincipalEnrollment) => enrollment.status === "PENDING");
      
      pendingEnrollments.forEach((enrollment: PrincipalEnrollment) => {
        const classId = enrollment.session?.class?.id;
        const className = enrollment.session?.class?.className;
        const teacherName = enrollment.session?.class?.teacher?.name;
        
        if (classId && className && teacherName) {
          const existing = classMap.get(classId);
          if (existing) {
            existing.pendingCount += 1;
          } else {
            classMap.set(classId, {
              id: classId,
              className,
              teacherName,
              pendingCount: 1,
              refundCount: 0,
            });
          }
        }
      });
    } else {
      // Handle PrincipalRefundRequest data
      const pendingRefunds = rawData.filter((refund: PrincipalRefundRequest) => refund.status === "PENDING");
      
      pendingRefunds.forEach((refund: PrincipalRefundRequest) => {
        const classId = refund.sessionEnrollment?.session?.class?.id;
        const className = refund.sessionEnrollment?.session?.class?.className;
        const teacherName = refund.sessionEnrollment?.session?.class?.teacher?.name;
        
        if (classId && className && teacherName) {
          const existing = classMap.get(classId);
          if (existing) {
            existing.refundCount += 1;
          } else {
            classMap.set(classId, {
              id: classId,
              className,
              teacherName,
              pendingCount: 0,
              refundCount: 1,
            });
          }
        }
      });
    }

    setClasses(Array.from(classMap.values()));
  }, [rawData]);

  return (
    <div className="space-y-4">
      {classes.map((classInfo) => (
        <Card key={classInfo.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{classInfo.className}</h3>
              <p className="text-gray-600">강사: {classInfo.teacherName}</p>
              <div className="flex gap-2 mt-2">
                {classInfo.pendingCount > 0 && (
                  <Badge variant="secondary">
                    대기 중인 수강신청: {classInfo.pendingCount}
                  </Badge>
                )}
                {classInfo.refundCount > 0 && (
                  <Badge variant="destructive">
                    대기 중인 환불요청: {classInfo.refundCount}
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={() => onClassClick(classInfo.id)}>
              상세보기
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PrincipalClassList;
