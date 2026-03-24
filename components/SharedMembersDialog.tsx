"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { auth } from "@/lib/firebase";

const BASE_URL = "http://192.168.5.108:8000";

interface Member {
  user_uid: string;
  email: string;
  role: string;
}

interface SharedMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: string;
  deviceName: string;
}

export default function SharedMembersDialog({
  open,
  onOpenChange,
  deviceId,
  deviceName,
}: SharedMembersDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !deviceId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${BASE_URL}/devices/${deviceId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setMembers(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error("Không thể tải danh sách", { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [open, deviceId]);

  const handleRevoke = async (member: Member) => {
    if (!confirm(`Thu hồi quyền của ${member.email}?`)) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BASE_URL}/devices/revoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_uid: deviceId,
          target_user_uid: member.user_uid,
          target_email: member.email,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Đã thu hồi quyền của ${member.email}`);
      setMembers((prev) => prev.filter((m) => m.user_uid !== member.user_uid));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Lỗi thu hồi quyền", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Người được chia sẻ - {deviceName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">Đang tải danh sách...</div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Chưa chia sẻ thiết bị cho ai
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {members.map((member) => (
              <div
                key={member.user_uid}
                className="flex items-center justify-between bg-muted p-4 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Quyền: {member.role}
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRevoke(member)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
