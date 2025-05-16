import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: '아이디를 입력해주세요.' },
        { status: 400 },
      )
    }

    // 백엔드 API 호출
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-userid`,
      { userId },
    )

    return NextResponse.json({
      available: response.data.available,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          available: false,
          message:
            error.response?.data?.message || '아이디 확인에 실패했습니다.',
        },
        { status: error.response?.status || 500 },
      )
    }

    return NextResponse.json(
      { available: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
