'use client'

import { useEffect, useMemo, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import Image from 'next/image'

import splashImage from '../../../assets/splash.png'
import { useSession } from '@/lib/auth/AuthProvider'

const isNativePlatform = () => {
  if (typeof window === 'undefined') return false
  try {
    return Capacitor.isNativePlatform()
  } catch (error) {
    console.warn('Capacitor platform check failed:', error)
    return false
  }
}

export function SplashController() {
  const { initializing } = useSession()
  const nativePlatform = useMemo(() => isNativePlatform(), [])
  const [showOverlay, setShowOverlay] = useState(() => !nativePlatform)

  useEffect(() => {
    if (!nativePlatform) {
      setShowOverlay(true)
      return
    }

    SplashScreen.show({ autoHide: false }).catch((error) => {
      console.warn('SplashScreen.show failed:', error)
    })
  }, [nativePlatform])

  useEffect(() => {
    if (initializing) {
      if (!nativePlatform) {
        setShowOverlay(true)
      }
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const hideSplash = async () => {
      if (nativePlatform) {
        try {
          await SplashScreen.hide()
        } catch (error) {
          console.warn('SplashScreen.hide failed:', error)
        }
      }

      timeoutId = setTimeout(() => {
        setShowOverlay(false)
      }, 120)
    }

    hideSplash()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [initializing, nativePlatform])

  if (!showOverlay && !nativePlatform) {
    return null
  }

  if (!nativePlatform && showOverlay) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <Image
          src={splashImage}
          alt="Splash"
          priority
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return null
}

