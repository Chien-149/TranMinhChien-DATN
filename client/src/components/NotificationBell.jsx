import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Eye, Star, Check, Trash2, CheckCheck } from 'lucide-react';
import { Badge, Dropdown, Empty, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
    requestGetNotifications,
    requestMarkAsRead,
    requestMarkAllAsRead,
    requestClearAllNotifications,
} from '../config/notificationRequest';
import { useStore } from '../hook/useStore';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const TYPE_CONFIG = {
    cv_viewed: {
        icon: Eye,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        ring: 'ring-blue-200',
    },
    application_status: {
        icon: Briefcase,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        ring: 'ring-indigo-200',
    },
    job_match: {
        icon: Star,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        ring: 'ring-amber-200',
    },
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const { newNotification } = useStore();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await requestGetNotifications({ limit: 30 });
            setNotifications(res.metadata?.notifications || []);
            setUnread(res.metadata?.unread || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Real-time: receive new notification from socket via Provider
    useEffect(() => {
        if (!newNotification) return;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnread((prev) => prev + 1);
    }, [newNotification]);

    const handleMarkRead = async (notifId) => {
        await requestMarkAsRead(notifId);
        setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)));
        setUnread((prev) => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await requestMarkAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnread(0);
    };

    const handleClearAll = async () => {
        await requestClearAllNotifications();
        setNotifications([]);
        setUnread(0);
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await handleMarkRead(notif._id);
        }

        // Navigate based on type
        if (notif.type === 'job_match' && notif.meta?.jobId) {
            navigate(`/jobs/${notif.meta.jobId}`);
        } else if (notif.type === 'cv_viewed' || notif.type === 'application_status') {
            navigate('/user/applications');
        } else if (notif.meta?.jobId) {
            navigate(`/jobs/${notif.meta.jobId}`);
        }

        setOpen(false); // Close dropdown after clicking
    };

    const dropdownContent = (
        <div className="w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Bell size={16} />
                    Thông báo
                    {unread > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-white/25 rounded-full text-xs font-bold">{unread}</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unread > 0 && (
                        <Tooltip title="Đánh dấu tất cả đã đọc">
                            <button
                                onClick={handleMarkAllRead}
                                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <CheckCheck size={15} />
                            </button>
                        </Tooltip>
                    )}
                    {notifications.length > 0 && (
                        <Tooltip title="Xóa tất cả">
                            <button
                                onClick={handleClearAll}
                                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <Trash2 size={15} />
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spin />
                    </div>
                ) : notifications.length === 0 ? (
                    <Empty
                        description="Không có thông báo nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-10"
                    />
                ) : (
                    notifications.map((notif) => {
                        const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.cv_viewed;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                                    !notif.isRead ? 'bg-indigo-50/40' : ''
                                }`}
                            >
                                {/* Icon */}
                                <div
                                    className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ring-1 ${cfg.ring} flex items-center justify-center`}
                                >
                                    {notif.meta?.companyLogo ? (
                                        <img
                                            src={
                                                notif.meta.companyLogo.startsWith('http')
                                                    ? notif.meta.companyLogo
                                                    : `${import.meta.env.VITE_API_URL}/uploads/logo/${notif.meta.companyLogo}`
                                            }
                                            className="w-8 h-8 rounded-xl object-cover"
                                            alt=""
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Icon size={16} className={cfg.color} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-xs font-semibold ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}
                                    >
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {dayjs(notif.createdAt).fromNow()}
                                    </p>
                                </div>

                                {/* Unread dot */}
                                {!notif.isRead && (
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return (
        <Dropdown
            overlay={dropdownContent}
            trigger={['click']}
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (v) fetchNotifications();
            }}
            placement="bottomRight"
            overlayStyle={{ padding: 0 }}
        >
            <button className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all relative">
                <Badge count={unread} size="small" offset={[-2, 2]}>
                    <Bell size={19} className="text-slate-500" />
                </Badge>
            </button>
        </Dropdown>
    );
}
