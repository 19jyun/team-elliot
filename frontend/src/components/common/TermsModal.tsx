'use client';

import React, { useState, useEffect } from 'react';
import { SlideUpModal } from './SlideUpModal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp?: boolean;
  onAgree?: (agreed: boolean) => void;
}

export function TermsModal({ isOpen, onClose, isSignUp = false, onAgree }: TermsModalProps) {
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
      title="이용약관"
      contentClassName="py-6"
    >
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: '70vh' }}>
        <div className="text-sm text-stone-700 leading-relaxed space-y-6">
        <section>
          {/* // 수정됨: PDF 제1조  */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제1조 (목적)</h2>
          <p>
            본 이용약관은 &quot;발레 동아리 관리 플랫폼&quot;(이하 &quot;사이트&quot;)의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다. 
          </p>
        </section>

        <section>
          {/* // 수정됨: PDF 제2조  */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제2조 (용어의 정의)</h2>
          <p className="mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다: </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>&quot;회원&quot;이라 함은 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.</li>
            <li>&quot;이용계약&quot;이라 함은 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.</li>
            <li>&quot;회원 아이디(ID)&quot;라 함은 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.</li>
            <li>&quot;비밀번호&quot;라 함은 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.</li>
            <li>&quot;운영자&quot;라 함은 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.</li>
            <li>&quot;해지&quot;라 함은 회원이 이용계약을 해약하는 것을 말합니다.</li>
          </ol>
        </section>

        <section>
          {/* // 수정됨: PDF 제3조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제3조 (약관 외 준칙)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>운영자는 필요한 경우 별도로 운영정책을 공지 안내할 수 있으며, 본 약관과 운영정책이 중첩될 경우 운영정책이 우선 적용됩니다.</li>
            <li>본 약관에 명시되지 않은 사항은 전기통신기본법, 전기통신사업법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 기타 관련 법령의 규정에 따릅니다.</li>
          </ol>
        </section>

        <section>
          {/* // 수정됨: PDF 제4조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제4조 (이용계약 체결)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 운영자의 이용승낙으로 성립합니다.</li>
            <li>회원으로 등록하여 서비스를 이용하려는 자는 사이트 가입신청 시 본 약관을 읽고 &quot;동의합니다&quot;를 선택하는 것으로 본 약관에 대한 동의 의사 표시를 합니다.</li>
            {/* // 수정됨: 요구사항 5번(신분확인X)에 따라 신분확인 절차 내용은 제외함 */}
          </ol>
        </section>

        <section>
          {/* // 수정됨: 서비스 성격 및 요구사항 2번(앱 기능) 반영 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제5조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>회사는 다음과 같은 서비스를 제공합니다:
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>발레 동아리 관리 및 회원간 커뮤니케이션 서비스</li>
                <li>수업 및 일정 공지 서비스</li>
                <li>푸시 알림을 통한 주요 정보 알림 서비스</li>
                <li>기기 캘린더 연동을 통한 일정 관리 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
            </li>
            <li>회사는 서비스의 내용을 변경할 경우 그 사유와 변경내용을 서비스 내에 공지합니다.</li>
          </ol>
        </section>

        <section>
          {/* // 수정됨: PDF 제9조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제6조 (서비스의 중단)</h2>
          <p className="mb-2">
            회사는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>긴급한 시스템 점검, 증설, 교체, 고장 혹은 오동작을 일으키는 경우</li>
            <li>국가비상사태, 정전, 천재지변 등의 불가항력적인 사유가 있는 경우</li>
            <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지한 경우</li>
            <li>서비스 이용의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
          </ol>
        </section>

        <section>
          {/* // 수정됨: PDF 제8조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제7조 (회원의 의무)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>회원은 본 약관에서 규정하는 사항과 운영자가 정한 제반 규정, 공지사항 및 운영정책 등 사이트가 공지하는 사항 및 관계 법령을 준수하여야 합니다.</li>
            <li>회원은 사이트의 명시적 동의가 없는 한 서비스의 이용 권한, 기타 이용계약상 지위를 타인에게 양도, 증여할 수 없으며, 이를 담보로 제공할 수 없습니다.</li>
            <li>회원은 아이디 및 비밀번호 관리에 상당한 주의를 기울여야 하며, 운영자나 사이트의 동의 없이 제3자에게 아이디를 제공하여 이용하게 할 수 없습니다.</li>
            <li>회원은 운영자와 사이트 및 제3자의 지적 재산권을 침해해서는 안 됩니다.</li>
          </ol>
        </section>

        <section>
          {/* // 수정됨: PDF 제10조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제8조 (서비스 이용 해지 및 자격 상실)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>회원이 사이트와의 이용계약을 해지하고자 하는 경우에는 회원 본인이 온라인을 통하여 등록해지 신청을 하여야 합니다.</li>
            <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>회원 가입 시 혹은 가입 후 정보 변경 시 허위 내용을 등록하는 행위</li>
                <li>타인의 사이트 이용을 방해하거나 정보를 도용하는 행위</li>
                <li>사이트의 운영진, 직원 또는 관계자를 사칭하는 행위</li>
                <li>다른 회원의 ID를 부정하게 사용하는 행위</li>
                <li>기타 관련 법령에 위배되는 행위</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
           {/* // 수정됨: PDF 제16조 */}
          <h2 className="text-base font-semibold mb-3 text-stone-900">제9조 (면책조항)</h2>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>운영자는 천재지변 또는 이에 준하는 불가항력, 또는 서비스 기반(타 통신업자)의 장애로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
            <li>운영자는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
            <li>운영자는 회원이 서비스를 이용하여 기대하는 이익을 얻지 못하였거나 서비스 자료에 대한 취사선택 또는 이용으로 발생하는 손해 등에 대해서는 책임이 면제됩니다.</li>
            <li>운영자는 회원이 저장, 게시 또는 전송한 자료와 관련하여 일체의 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3 text-stone-900">제10조 (분쟁 해결)</h2>
          <p>
            서비스 이용과 관련하여 회사와 회원 사이에 분쟁이 발생한 경우, 회사와 회원은 분쟁의 해결을 위해 
            성실히 협의합니다. 협의가 이루어지지 않을 경우 관할 법원은 민사소송법에 따릅니다.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-200">
          <p className="text-xs text-neutral-500">
            {/* // 수정됨: PDF 부칙 */}
            본 약관은 2025년 5월 12일부터 시행됩니다.
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
                위 이용약관에 동의합니다
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