//device-context.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type DeviceContextType = {
  deviceId: string | null;
  deviceName: string | null;
  selectDevice: (id: string, name: string) => void;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const selectDevice = (id: string, name: string) => {
    setDeviceId(id);
    setDeviceName(name);
    // TODO: sau này lưu last_device vào Firebase giống Flutter
  };

  return (
    <DeviceContext.Provider value={{ deviceId, deviceName, selectDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error("useDevice must be used within DeviceProvider");
  return context;
};
