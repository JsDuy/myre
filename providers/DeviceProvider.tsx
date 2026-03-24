"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "./AuthProvider";
import { useRef } from "react";

interface Device {
  id: string;
  name: string;
  code?: string;
  role: "owner" | "viewer";
  owner?: string;
}

type State = {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Device[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SELECT_DEVICE"; payload: Device | null }
  | {
      type: "SELECT_DEVICE_BY_ID";
      payload: { id: string; name: string; devices: Device[] };
    };

const initialState: State = {
  devices: [],
  selectedDevice: null,
  loading: true,
  error: null,
};

function deviceReducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, devices: action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SELECT_DEVICE":
      return { ...state, selectedDevice: action.payload };
    case "SELECT_DEVICE_BY_ID": {
      const device = action.payload.devices.find(
        (d) => d.id === action.payload.id,
      );
      return {
        ...state,
        selectedDevice: device || {
          id: action.payload.id,
          name: action.payload.name,
          role: "viewer",
        },
      };
    }
    default:
      return state;
  }
}

interface DeviceContextType extends State {
  selectDevice: (id: string, name: string) => void;
  setSelectedDevice: (device: Device | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(deviceReducer, initialState);
  const selectedDeviceRef = useRef(state.selectedDevice); // Thêm ref

  // Cập nhật ref mỗi khi selectedDevice thay đổi
  useEffect(() => {
    selectedDeviceRef.current = state.selectedDevice;
  }, [state.selectedDevice]);

  const selectDevice = (id: string, name: string) => {
    dispatch({
      type: "SELECT_DEVICE_BY_ID",
      payload: { id, name, devices: state.devices },
    });
  };

  const setSelectedDevice = (device: Device | null) => {
    dispatch({ type: "SELECT_DEVICE", payload: device });
  };

  useEffect(() => {
    if (!user) {
      dispatch({ type: "FETCH_SUCCESS", payload: [] });
      dispatch({ type: "SELECT_DEVICE", payload: null });
      return;
    }

    const devicesRef = ref(db, `users/${user.uid}/devices`);

    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          dispatch({ type: "FETCH_SUCCESS", payload: [] });
          return;
        }

        const deviceList: Device[] = Object.entries(data).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([id, val]: [string, any]) => ({
            id,
            name: val.name || "Thiết bị không tên",
            code: val.code,
            role: val.role || "owner",
            owner: val.owner,
          }),
        );

        dispatch({ type: "FETCH_SUCCESS", payload: deviceList });

        // ✅ Dùng ref để lấy selectedDevice hiện tại
        const currentSelected = selectedDeviceRef.current;
        if (
          currentSelected &&
          deviceList.some((d) => d.id === currentSelected.id)
        ) {
          dispatch({ type: "SELECT_DEVICE", payload: currentSelected });
        } else if (deviceList.length > 0) {
          dispatch({ type: "SELECT_DEVICE", payload: deviceList[0] });
        } else {
          dispatch({ type: "SELECT_DEVICE", payload: null });
        }
      },
      (err) => {
        dispatch({ type: "FETCH_ERROR", payload: err.message });
      },
    );

    return () => {
      off(devicesRef);
      unsubscribe();
    };
  }, [user]); // ✅ Không cần thêm state.selectedDevice

  return (
    <DeviceContext.Provider
      value={{
        devices: state.devices,
        selectedDevice: state.selectedDevice,
        loading: state.loading,
        error: state.error,
        selectDevice,
        setSelectedDevice,
      }}
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
