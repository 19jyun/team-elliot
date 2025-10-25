'use client'

import React from 'react'
import Image from 'next/image'

export function EmptySessionDisplay() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Image
        src="/images/logo/team-eliot-2.png"
        alt="선택된 날짜가 없습니다"
        width={120}
        height={120}
        className="mb-4"
      />
      <p className="text-stone-500 text-sm">
        선택된 날짜가 없습니다
      </p>
    </div>
  )
}
