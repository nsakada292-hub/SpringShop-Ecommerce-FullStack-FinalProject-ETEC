import { useState, useCallback, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatDateTime } from '@/shared/utils/cn'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

const staticNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Order',
    message: 'Order #1024 placed by John Doe — $189.00',
    time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: '"Vintage Leather Bag" has only 3 units remaining',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 3,
    title: 'New Review',
    message: 'Sarah left a 5-star review on "Cotton T-Shirt"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: 4,
    title: 'New Order',
    message: 'Order #1023 placed by Alice M. — $74.50',
    time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
  },
]

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(staticNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-brand-aqua hover:text-brand-sky transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'px-4 py-3 border-b border-surface-200 dark:border-surface-700/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-700/30 transition-colors',
                  !n.read && 'bg-brand-aqua/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 w-2 h-2 rounded-full shrink-0',
                      !n.read ? 'bg-brand-aqua' : 'bg-transparent'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-surface-500 mt-1">{formatDateTime(n.time)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-surface-200 dark:border-surface-700 text-center">
            <p className="text-xs text-surface-500 dark:text-surface-400">No more notifications</p>
          </div>
        </div>
      )}
    </div>
  )
}
