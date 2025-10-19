"use client";

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

export interface DeviceInfo {
  isNative: boolean;
  platform: "ios" | "android" | "web";
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  safeAreaTop: number;
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isNative: false,
    platform: "web",
    hasNotch: false,
    hasDynamicIsland: false,
    safeAreaTop: 0,
  });

  useEffect(() => {
    const getDeviceInfo = async () => {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        try {
          const device = await Device.getInfo();
          const platform = device.platform as "ios" | "android";

          // iOS의 경우 Dynamic Island 감지
          const hasDynamicIsland =
            platform === "ios" &&
            (device.model?.includes("iPhone 14") ||
              device.model?.includes("iPhone 15") ||
              device.model?.includes("iPhone 16") ||
              device.model?.includes("iPhone 17"));

          // Notch가 있는 디바이스 감지
          const hasNotch =
            platform === "ios" &&
            (device.model?.includes("iPhone X") ||
              device.model?.includes("iPhone 11") ||
              device.model?.includes("iPhone 12") ||
              device.model?.includes("iPhone 13") ||
              hasDynamicIsland);

          // Safe area top 값 계산
          const safeAreaTop = hasDynamicIsland ? 59 : hasNotch ? 44 : 20;

          setDeviceInfo({
            isNative: true,
            platform,
            hasNotch,
            hasDynamicIsland,
            safeAreaTop,
          });
        } catch (error) {
          console.error("Device info error:", error);
          setDeviceInfo({
            isNative: true,
            platform: "ios", // 기본값
            hasNotch: true,
            hasDynamicIsland: false,
            safeAreaTop: 44,
          });
        }
      } else {
        setDeviceInfo({
          isNative: false,
          platform: "web",
          hasNotch: false,
          hasDynamicIsland: false,
          safeAreaTop: 0,
        });
      }
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
}
