import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  CreditCard,
  FileText,
  Users,
  Check,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
  relatedEntityId?: string | null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "ACCESS_REQUEST_RESPONDED":
    case "ACCESS_REQUEST_APPROVED":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "ACCESS_REQUEST_REJECTED":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "ACCESS_REQUEST_CREATED":
      return <UserCheck className="w-4 h-4 text-blue-500" />;
    case "APPOINTMENT_SCHEDULED":
    case "APPOINTMENT_APPROVED":
    case "APPOINTMENT_CANCELLED":
    case "APPOINTMENT_COMPLETION_REQUESTED":
      return <Calendar className="w-4 h-4 text-primary" />;
    case "PLAN_EXPIRING":
    case "PLAN_EXPIRED":
      return <CreditCard className="w-4 h-4 text-amber-500" />;
    case "EXAM_RESULT_AVAILABLE":
      return <FileText className="w-4 h-4 text-indigo-500" />;
    case "CLINIC_MEMBER_JOINED":
      return <Users className="w-4 h-4 text-emerald-500" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api("/notifications/me/unread-count");
      setUnreadCount(data.count || 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when opening
  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      try {
        const data = await api("/notifications/me");
        setNotifications(Array.isArray(data) ? data.slice(0, 20) : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  }

  async function markAsRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  async function markAllAsRead() {
    try {
      await api("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative cursor-pointer border-none bg-transparent"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">Notificações</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1"
              >
                <Check size={12} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">
                  Nenhuma notificação
                </p>
              </div>
            )}

            {!loading &&
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                  className={`px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-none ${
                    !notification.isRead ? "bg-primary/[0.02]" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${!notification.isRead ? "font-semibold text-slate-900" : "text-slate-600"}`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1 font-medium">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
