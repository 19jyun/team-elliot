import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { message: '전화번호를 입력해주세요.' },
        { status: 400 },
      )
    }

    // 백엔드 API 호출
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/sms/send-verification`,
      { phoneNumber },
    )

    return NextResponse.json({
      message: '인증번호가 발송되었습니다.',
    })
  } catch (error) {
    console.error('SMS 발송 에러:', error)
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message:
            error.response?.data?.message || '인증번호 발송에 실패했습니다.',
        },
        { status: error.response?.status || 500 },
      )
    }
    return NextResponse.json(
      { message: '인증번호 발송에 실패했습니다.' },
      { status: 500 },
    )
  }
}
