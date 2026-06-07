"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Clock, ShoppingBag, Calendar, UserPlus, CreditCard } from 'lucide-react';
import { useNotificationStore } from '../lib/useNotifications';

const typeConfig = {
  order: { icon: ShoppingBag, color: 'text-blue-400' },
  reservation: { icon: Calendar, color: 'text-amber-400' },
  staff: { icon: UserPlus, color: 'text-green-400' },
  payment: { icon: CreditCard, color: 'text-purple-400' },
  info: { icon: Bell, color: 'text-gray-400' },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/5"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline font-semibold">
                        Mark all read
                      </button>
                      <button onClick={clearAll} className="text-[10px] text-gray-500 hover:text-gray-400">
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">No notifications yet</p>
                    <p className="text-[10px] mt-1">Order updates and alerts will appear here.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const cfg = typeConfig[notif.type] || typeConfig.info;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => { markAsRead(notif.id); }}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{notif.message}</p>
                          <p className="text-[9px] text-gray-600 mt-0.5">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
