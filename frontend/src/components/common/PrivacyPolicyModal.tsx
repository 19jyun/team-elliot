'use client';

import React, { useState, useEffect } from 'react';
import { SlideUpModal } from './SlideUpModal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp?: boolean;
  onAgree?: (agreed: boolean) => void;
}

export function PrivacyPolicyModal({ isOpen, onClose, isSignUp = false, onAgree }: PrivacyPolicyModalProps) {
  const [agreed, setAgreed] = useState(false);

  // 모달이 열릴 때 agreed 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
    }
  }, [isOpen]);

  const handleAgree = () => {
    if (onAgree) {
      onAgree(agreed);
    } else {
      onClose();
    }
  };
  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="개인정보처리방침"
      contentClassName="py-6"
    >
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: '70vh' }}>
        <div className="text-sm text-stone-700 leading-relaxed space-y-6">
        <section>
          <p className="mb-4">
            {/* // 수정됨: PDF 내용 반영 */}
            팀 엘리엇(이하 &quot;회사&quot;)는 개인정보 보호법 제30조에 따라 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립, 공개합니다.
          </p>
        </section>

        <section>
          {/* // 수정됨: PDF 제5조 및 요구사항 3번(실수집 정보) 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">1. 개인정보의 수집 항목 및 수집 방법</h2>
          
          <h3 className="text-sm font-semibold mb-2 text-stone-800">가. 수집하는 개인정보의 항목</h3>
          <div className="space-y-3 mb-4">
            <div>
              <p className="font-medium mb-1">① 홈페이지 회원 가입 및 관리</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                {/* // 수정됨: PDF  및 요구사항 3번(이름, 전화번호, ID, PW) 반영. 생년월일, 주소, 성별 등은 제외. */}
                <li>필수항목: 성명, 전화번호, 아이디, 비밀번호, 이메일주소</li>
                {/* // 추가됨: 요구사항 3번 (강사/원장 스펙) */}
                <li>선택항목(강사/원장): 프로필 사진, 스펙(학력, 자격증, 경험 등)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">② 재화 또는 서비스 제공</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                 {/* // 수정됨: 요구사항 4번(계좌이체) 반영. 실제 결제 정보 수집 X  */}
                <li>서비스 이용 과정에서 이용자 식별 정보</li>
              </ul>
            </div>
            <div>
              {/* // 추가됨: 요구사항 1, 2번 (네이티브 앱) 반영 */}
              <p className="font-medium mb-1">③ 서비스 이용 과정에서 자동으로 생성되는 정보</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>IP 주소, 쿠키, 접속 로그, 서비스 이용 기록</li>
                <li>기기 정보(기기 모델명, OS 버전)</li>
                <li>푸시 알림 토큰 (iOS APNs, Android Firebase)</li>
              </ul>
            </div>
          </div>

          <h3 className="text-sm font-semibold mb-2 text-stone-800">나. 개인정보 수집 방법</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
            <li>서비스 이용 과정에서 자동 수집 도구를 통한 수집</li>
            <li>고객센터를 통한 상담 과정에서 수집</li>
          </ul>
        </section>

        <section>
          {/* // 수정됨: PDF 제1조 및 요구사항 2번(앱 기능) 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">2. 개인정보의 수집 및 이용 목적</h2>
          <div className="space-y-3">
            <div>
              {/* // 수정됨: PDF 제1조 1항 */}
              <p className="font-medium mb-1">가. 홈페이지 회원 가입 및 관리</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                <li>회원자격 유지·관리, 서비스 부정 이용 방지</li>
                <li>만 14세 미만 아동의 개인정보 처리 시 법정대리인의 동의 여부 확인</li>
                <li>각종 고지·통지</li>
              </ul>
            </div>
            <div>
              {/* // 수정됨: PDF 제1조 2항 및 요구사항 2번(앱 기능) */}
              <p className="font-medium mb-1">나. 재화 또는 서비스 제공</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>서비스 제공, 콘텐츠 제공, 맞춤서비스 제공</li>
                {/* // 추가됨: 요구사항 2번 */}
                <li>푸시 알림을 통한 공지 및 알림 전송</li>
                <li>기기 캘린더 동기화를 통한 일정 관리</li>
                {/* // 수정됨: 요구사항 4번(결제) 반영. 요금 결제/정산은 직접적 목적 아님 */}
              </ul>
            </div>
            <div>
              {/* // 수정됨: PDF 제1조 3항 */}
              <p className="font-medium mb-1">다. 고충 처리</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리 결과 통보</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          {/* // 수정됨: PDF 제2조 및 요구사항 4번(결제) 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="mb-2">
            회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1 mb-3">
            {/* // 수정됨: PDF */}
            <li>홈페이지 회원 가입 및 관리: 사업자/단체 홈페이지 탈퇴 시까지</li>
            <li>재화 또는 서비스 제공: 재화·서비스 공급완료 시까지</li>
          </ul>
          <p className="mb-2">
            다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지 보유합니다.
          </p>
           <ul className="list-disc list-inside pl-4 space-y-1 mb-3">
            <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우: 해당 수사·조사 종료 시까지</li>
            <li>홈페이지 이용에 따른 채권·채무관계 잔존 시: 해당 채권·채무 관계 정산 시까지</li>
          </ul>
          
          <p className="mb-2">
            또한, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
          </p>
          <div className="space-y-2 pl-4">
            <div>
              {/* // 수정됨: PDF 및 요구사항 4번(결제) 반영 */}
              <p className="font-medium">가. 전자상거래 등에서의 소비자보호에 관한 법률</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                {/* // 삭제됨: 요구사항 4(결제)에 따라 대금결제 기록은 제외 */}
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </div>
            <div>
              {/* // 수정됨: PDF */}
              <p className="font-medium">나. 통신비밀보호법</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>웹사이트 로그 기록 자료: 3개월</li>
              </ul>
            </div>
            {/* // 삭제됨: 요구사항 4(결제)에 따라 전자금융거래법 제외 */}
          </div>
        </section>

        <section>
          {/* // 수정됨: PDF 제6조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">4. 개인정보의 파기 절차 및 방법</h2>
          <div className="space-y-2">
            <div>
              <p className="font-medium mb-1">가. 파기 절차</p>
              <p className="pl-4">
                회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">나. 파기 방법</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                {/* // 수정됨: PDF */}
                <li>전자적 파일 형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                <li>종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          {/* // 수정됨: PDF 제3조 내용 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">5. 개인정보의 제3자 제공</h2>
          <p className="mb-2">
            회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제 18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </p>
          <p className="mb-2">
            회사는 원활한 서비스 제공을 위해 다음의 경우 정보주체의 동의를 얻어 필요 최소한의 범위로만 개인정보를 제3자에게 제공할 수 있습니다.
          </p>
          {/* // 추가됨: PDF 제3조 ②항 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs">
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><b>개인정보를 제공받는 자:</b> 발레 강사</li>
              <li><b>제공받는 자의 이용목적:</b> 수강신청 현황 및 출결 확인</li>
              <li><b>제공하는 개인정보 항목:</b> 성명, 성별, 전화번호, 이메일주소</li>
              <li><b>제공받는 자의 보유·이용기간:</b> 수업 진행 계약에 따른 거래기간동안</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3 text-stone-900">6. 개인정보 처리의 위탁</h2>
          <p className="mb-2">
            회사는 서비스 향상을 위해서 아래와 같이 개인정보를 위탁하고 있으며, 
            관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
          </p>
          {/* // 추가됨: 요구사항 1, 2번 (푸시 알림) */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs">
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><b>수탁업체:</b> Apple (APNs), Google (Firebase Cloud Messaging)</li>
              <li><b>위탁업무 내용:</b> 네이티브 앱 푸시 알림 전송</li>
              <li><b>보유 및 이용기간:</b> 회원 탈퇴 또는 푸시 알림 수신 거부 시까지</li>
            </ul>
          </div>
        </section>

        <section>
          {/* // 수정됨: PDF 제4조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">7. 이용자 및 법정대리인의 권리와 행사 방법</h2>
          <p className="mb-2">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p className="mt-2 pl-4">
            {/* // 수정됨: PDF */}
            위 권리 행사는 서비스 내 &apos;설정&apos; 메뉴를 통해 직접 수행하실 수 있으며, 
            개인정보 보호책임자에게 서면, 전화, 이메일, 모사전송(FAX) 등으로 연락하시면 지체 없이 조치하겠습니다.
          </p>
           <p className="mt-2 pl-4">
            권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.
          </p>
        </section>

        <section>
          {/* // 수정됨: PDF 제8조 및 요구사항 1, 2번(앱 기능) */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">8. 개인정보 자동 수집 장치 및 접근 권한</h2>
          
          <h3 className="text-sm font-semibold mb-2 text-stone-800">가. 쿠키(Cookie)의 사용</h3>
          <p className="mb-2">
            회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
          </p>
          <div className="space-y-2 pl-4">
            <div>
              <p className="font-medium">① 쿠키란?</p>
              <p className="text-xs">
                웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일로서 
                이용자의 컴퓨터에 저장됩니다.
              </p>
            </div>
            <div>
              <p className="font-medium">② 쿠키의 사용 목적</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-xs">
                <li>이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 보안접속 여부 등을 파악하여 이용자에게 최적화된 정보 제공</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">③ 쿠키의 설치/운영 및 거부</p>
              <p className="text-xs">
                이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다.
                웹브라우저 설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 
                모든 쿠키의 저장을 거부할 수 있습니다. 다만, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.
              </p>
            </div>
          </div>

          {/* // 추가됨: 요구사항 1, 2번 (네이티브 앱 기능) */}
          <h3 className="text-sm font-semibold mt-4 mb-2 text-stone-800">나. 앱 접근 권한</h3>
          <p className="mb-2">
            회사는 네이티브 앱 서비스 제공을 위해 이용자의 기기 접근 권한을 요구할 수 있습니다.
          </p>
          <div className="space-y-2 pl-4">
            <div>
              <p className="font-medium">① 알림 (선택)</p>
              <p className="text-xs">
                서비스 공지사항, 동아리 소식 등 푸시 알림 메시지 전송을 위해 사용됩니다.
              </p>
            </div>
            <div>
              <p className="font-medium">② 캘린더 (선택)</p>
              <p className="text-xs">
                서비스 내의 일정을 이용자의 기기 로컬 캘린더에 추가하거나 동기화하기 위해 사용됩니다.
              </p>
            </div>
            <p className="text-xs mt-2">
              이용자는 기기 설정 메뉴에서 앱 접근 권한 동의를 거부할 수 있으며, 
              선택 권한을 거부하더라도 해당 기능 외의 기본 서비스 이용은 가능합니다.
            </p>
          </div>
        </section>

        <section>
          {/* // 수정됨: PDF 제7조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">9. 개인정보의 안전성 확보 조치</h2>
          <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 하고 있습니다:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><b>관리적 조치:</b> 내부관리계획 수립 및 시행, 정기적 직원 교육 등</li>
            <li><b>기술적 조치:</b> 개인정보처리시스템 등의 접근 권한 관리, 접근통제시스템 설치, 고유 식별 정보 등의 암호화, 보안프로그램 설치</li>
            <li><b>물리적 조치:</b> 전산실, 자료보관실 등의 접근통제</li>
          </ul>
        </section>

        <section>
          {/* // 수정됨: PDF 제9조, 제11조 정보 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">10. 개인정보 보호책임자 및 열람청구</h2>
          <p className="mb-3">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
            개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 
            개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
            <div>
              <p className="font-medium text-sm">개인정보 보호책임자</p>
              <ul className="text-xs space-y-1 pl-4 mt-1">
                {/* // 수정됨: PDF */}
                <li>성명: 윤정훈</li>
                <li>직책: 개발 책임</li>
                <li>연락처: 010-9482-7112</li>
              </ul>
            </div>
            <div>
              {/* // 추가됨: PDF */}
              <p className="font-medium text-sm">개인정보 열람청구 접수·처리 부서</p>
              <ul className="text-xs space-y-1 pl-4 mt-1">
                <li>부서명: 개발 책임 윤정훈</li>
                <li>이메일: junghunibini@gmail.com</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-600">
            기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
          </p>
          {/* // 수정됨: PDF */}
          <ul className="text-xs space-y-1 pl-4 mt-2 text-neutral-600">
            <li>개인정보 분쟁조정위원회 (www.kopico.go.kr / 1833-6972)</li>
            <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
            <li>대검찰청 (www.spo.go.kr / 국번없이 1301)</li>
            <li>경찰청 (ecrm.police.go.kr/minwon/main / 국번없이 182)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3 text-stone-900">11. 개인정보처리방침의 변경</h2>
          <p>
            본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 시에는 
            변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-200">
          <p className="text-xs text-neutral-500">
            {/* // 수정됨: PDF 제13조 */}
            본 개인정보처리방침은 2025년 5월 12일부터 시행됩니다.
          </p>
        </section>

        {/* 회원가입 시 동의 체크박스 */}
        {isSignUp && (
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200">
            <label className="flex gap-3 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-stone-700"
              />
              <span className="text-sm font-medium text-stone-700">
                위 개인정보처리방침에 동의합니다
              </span>
            </label>
            <button
              onClick={handleAgree}
              disabled={!agreed}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-stone-700 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              확인
            </button>
          </div>
        )}
        </div>
      </div>
    </SlideUpModal>
  );
}