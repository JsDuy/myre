"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "./AuthProvider";

interface Device {
  id: string; // deviceUid
  name: string;
  code?: string;
  role: "owner" | "viewer";
  owner?: string;
  // thêm field khác nếu cần (status, lastSeen...)
}

interface DeviceContextType {
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  loading: boolean;
  error: string | null;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDevices([]);
      setSelectedDevice(null);
      setLoading(false);
      return;
    }

    const devicesRef = ref(db, `users/${user.uid}/devices`);

    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setDevices([]);
          setLoading(false);
          return;
        }

        const deviceList: Device[] = Object.entries(data).map(
          ([id, val]: [string, any]) => ({
            id,
            name: val.name || "Thiết bị không tên",
            code: val.code,
            role: val.role || "owner",
            owner: val.owner,
          }),
        );

        setDevices(deviceList);

        // Auto chọn device đầu tiên nếu chưa có selected
        if (!selectedDevice && deviceList.length > 0) {
          setSelectedDevice(deviceList[0]);
        }

        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      off(devicesRef);
      unsubscribe();
    };
  }, [user]);

  return (
    <DeviceContext.Provider
      value={{ devices, selectedDevice, setSelectedDevice, loading, error }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error("useDevice phải dùng trong DeviceProvider");
  return context;
};
