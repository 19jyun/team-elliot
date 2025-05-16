import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, userId, password, phoneNumber } = body

    // 입력값 검증
    if (!name || !userId || !password) {
      return NextResponse.json(
        { message: '필수 입력값이 누락되었습니다.' },
        { status: 400 },
      )
    }

    // 백엔드 API 호출
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
      {
        name,
        userId,
        password,
        phoneNumber,
      },
    )

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || '회원가입에 실패했습니다.'
      return NextResponse.json(
        { message: errorMessage },
        { status: error.response?.status || 500 },
      )
    }

    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
