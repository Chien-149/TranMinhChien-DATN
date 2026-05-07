import { useState, useEffect } from 'react';
import { Bell, BellOff, Building2, Users } from 'lucide-react';
import { requestToggleFollow, requestCheckFollow, requestGetFollowerCount } from '../config/bookmarkAndFollowRequest';
import { useAuth } from '../store/authStore';
import { message, Tooltip } from 'antd';

/**
 * Reusable follow/unfollow button for a company.
 * Props: companyId, companyName, size ('sm' | 'md' | 'lg')
 */
export default function FollowCompanyButton({ companyId, companyName = 'công ty', size = 'md', showCount = false }) {
    const { user } = useAuth();
    const [following, setFollowing] = useState(false);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!companyId) return;
        if (user) {
            requestCheckFollow(companyId)
                .then((res) => setFollowing(res.metadata?.following || false))
                .catch(() => {});
        }
        if (showCount) {
            requestGetFollowerCount(companyId)
                .then((res) => setCount(res.metadata?.count || 0))
                .catch(() => {});
        }
    }, [companyId, user, showCount]);

    const handleToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!user) {
            message.info('Vui lòng đăng nhập để theo dõi công ty');
            return;
        }
        setLoading(true);
        try {
            const res = await requestToggleFollow(companyId);
            const isNowFollowing = res.metadata?.following;
            setFollowing(isNowFollowing);
            setCount((prev) => (isNowFollowing ? prev + 1 : Math.max(0, prev - 1)));
            message.success(isNowFollowing ? `Đã theo dõi ${companyName}` : 'Đã bỏ theo dõi');
        } catch {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-5 py-2.5 text-base gap-2',
    };

    const iconSize = { sm: 13, md: 15, lg: 17 }[size];

    return (
        <Tooltip title={following ? 'Bỏ theo dõi' : 'Theo dõi để nhận thông báo job mới'}>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center font-medium rounded-xl border transition-all duration-200 ${sizeClasses[size]} ${
                    following
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
                {following ? <Bell size={iconSize} /> : <BellOff size={iconSize} />}
                <span>{following ? 'Đang theo dõi' : 'Theo dõi'}</span>
                {showCount && count > 0 && (
                    <span className="ml-1 flex items-center gap-0.5 text-xs opacity-60">
                        <Users size={11} />
                        {count}
                    </span>
                )}
            </button>
        </Tooltip>
    );
}
