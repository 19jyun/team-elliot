import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { message: '전화번호와 인증번호를 모두 입력해주세요.' },
        { status: 400 },
      )
    }

    // 백엔드 API 호출
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/sms/verify-code`,
      { phoneNumber, code },
    )

    return NextResponse.json({
      message: '인증이 완료되었습니다.',
      verified: true,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || '인증에 실패했습니다.' },
        { status: error.response?.status || 500 },
      )
    }
    return NextResponse.json(
      { message: '인증에 실패했습니다.' },
      { status: 500 },
    )
  }
}
