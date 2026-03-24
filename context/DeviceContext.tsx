"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type DeviceContextType = {
  currentDeviceId: string | null;
  setCurrentDeviceId: (id: string) => void;
};

const DeviceContext = createContext<DeviceContextType>({
  currentDeviceId: null,
  setCurrentDeviceId: () => {},
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(
    "device_08",
  ); // mặc định ban đầu

  return (
    <DeviceContext.Provider value={{ currentDeviceId, setCurrentDeviceId }}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
