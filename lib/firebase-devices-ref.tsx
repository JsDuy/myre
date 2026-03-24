// src/lib/firebase-devices-ref.ts
import { ref } from "firebase/database";
import { db } from "./firebase";
export const devicesRef = ref(db, "devices");

export const userDevicesRef = (userId: string) =>
  ref(db, `users/${userId}/devices`);

export const getDeviceRef = (deviceId: string) =>
  ref(db, `devices/${deviceId}`);
