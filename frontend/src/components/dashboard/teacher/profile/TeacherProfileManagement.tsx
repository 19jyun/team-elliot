'use client';

import React from 'react';

// 예시 데이터 (실제 데이터는 API 연동 예정)
const teacherData = {
  name: '홍길동',
  introduction: '안녕하세요. 수학/과학 전문 강사 홍길동입니다.',
  photoUrl: '/images/profile/default-teacher.png',
  education: [
    '서울대학교 수학과 학사',
    '서울대학교 대학원 수학교육 석사',
  ],
  experience: [
    '강남 유명 학원 5년 근무',
    '현 Team Elliot 수학/과학 강사',
  ],
  specialties: [
    '수학',
    '과학',
    '논술',
  ],
};

export function TeacherProfileManagement() {
  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 본문 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-2 font-pretendard">
        {/* 이름 */}
        <div className="text-[20px] font-semibold text-[#262626]">
          {teacherData.name}
        </div>
        {/* 프로필 사진 + 기본 정보 */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex-1">
            <div className="text-base text-[#262626] whitespace-pre-line">
              {teacherData.introduction}
            </div>
          </div>
          {teacherData.photoUrl && (
            <img
              src={teacherData.photoUrl}
              alt="프로필"
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
        </div>
        {/* 학력 정보 */}
        <div className="mt-6">
          <h3 className="font-semibold text-[#262626] mb-2">학력</h3>
          <div className="text-base text-[#262626] whitespace-pre-line">
            {teacherData.education.join('\n')}
          </div>
        </div>
        {/* 경력 정보 */}
        <div className="mt-6">
          <h3 className="font-semibold text-[#262626] mb-2">경력</h3>
          <div className="text-base text-[#262626] whitespace-pre-line">
            {teacherData.experience.join('\n')}
          </div>
        </div>
        {/* 전문 분야 */}
        <div className="mt-6">
          <h3 className="font-semibold text-[#262626] mb-2">전문 분야</h3>
          <div className="text-base text-[#262626] whitespace-pre-line">
            {teacherData.specialties.join(', ')}
          </div>
        </div>
      </div>
      {/* 하단 고정 버튼 */}
      <div className="flex-shrink-0 flex flex-col w-full bg-white px-5 pb-4 pt-2">
        <button className="flex-1 shrink gap-2.5 self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full text-base font-semibold leading-snug text-white bg-[#AC9592] hover:bg-[#8c7a74] transition-colors">
          프로필 수정
        </button>
      </div>
    </div>
  );
} 