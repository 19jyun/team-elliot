'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function StatusBarHandler() {
  useEffect(() => {
    const initializeStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // 상태표시줄이 웹뷰 위에 오버레이되도록 설정
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // 상태표시줄 스타일을 라이트 모드로 설정
          await StatusBar.setStyle({ style: Style.Light });
          
          // 배경색을 흰색으로 설정
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          
          console.log('StatusBar initialized successfully');
        } catch (error) {
          console.error('StatusBar initialization failed:', error);
        }
      }
    };

    initializeStatusBar();
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
