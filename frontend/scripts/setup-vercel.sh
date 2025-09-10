#!/bin/bash

# Vercel 프로젝트 설정 스크립트
# 이 스크립트는 Vercel 프로젝트를 설정하고 필요한 정보를 출력합니다.

echo "🚀 Vercel 프로젝트 설정을 시작합니다..."

# Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI가 설치되지 않았습니다."
    echo "다음 명령어로 설치하세요: npm i -g vercel"
    exit 1
fi

# Vercel 로그인 확인
if ! vercel whoami &> /dev/null; then
    echo "🔐 Vercel에 로그인하세요:"
    vercel login
fi

echo "📁 현재 디렉토리: $(pwd)"
echo "📦 프로젝트 설정을 시작합니다..."

# Vercel 프로젝트 초기화
vercel --yes

echo ""
echo "✅ Vercel 프로젝트 설정이 완료되었습니다!"
echo ""
echo "📋 다음 정보를 GitHub Secrets에 추가하세요:"
echo ""
echo "1. Vercel 토큰 생성:"
echo "   - https://vercel.com/account/tokens 방문"
echo "   - 'Create Token' 클릭"
echo "   - 토큰을 복사하여 GitHub Secrets의 VERCEL_TOKEN에 추가"
echo ""
echo "2. 프로젝트 정보 확인:"
echo "   - Vercel 대시보드에서 프로젝트 선택"
echo "   - Settings > General에서 다음 정보 확인:"
echo "     - Organization ID (VERCEL_ORG_ID)"
echo "     - Project ID (VERCEL_PROJECT_ID)"
echo ""
echo "3. GitHub Secrets 설정:"
echo "   - GitHub 저장소 > Settings > Secrets and variables > Actions"
echo "   - 다음 시크릿들을 추가:"
echo "     - VERCEL_TOKEN"
echo "     - VERCEL_ORG_ID"
echo "     - VERCEL_PROJECT_ID"
echo ""
echo "🎉 설정이 완료되면 main 브랜치에 푸시하여 자동 배포를 테스트하세요!"
