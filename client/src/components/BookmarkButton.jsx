import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { requestToggleFavourite, requestGetMyFavourites } from '../config/bookmarkAndFollowRequest';
import { useAuth } from '../store/authStore';
import { message, Tooltip } from 'antd';

/**
 * Bookmark button for saving/unsaving a job.
 * Props: jobId, defaultSaved (bool), size ('sm'|'md'|'lg'), onToggle(cb)
 */
export default function BookmarkButton({ jobId, defaultSaved = false, size = 'md', onToggle }) {
    const { user } = useAuth();
    const [saved, setSaved] = useState(defaultSaved);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSaved(defaultSaved);
    }, [defaultSaved]);

    const handleToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!user) {
            message.info('Vui lòng đăng nhập để lưu việc làm');
            return;
        }
        setLoading(true);
        try {
            await requestToggleFavourite(jobId);
            const next = !saved;
            setSaved(next);
            message.success(next ? 'Đã lưu việc làm' : 'Đã bỏ lưu việc làm');
            onToggle?.(next);
        } catch {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const iconSize = { sm: 14, md: 16, lg: 20 }[size];
    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
    }[size];

    return (
        <Tooltip title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`${sizeClasses} rounded-xl border transition-all duration-200 ${
                    saved
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                }`}
            >
                {saved ? <BookmarkCheck size={iconSize} /> : <Bookmark size={iconSize} />}
            </button>
        </Tooltip>
    );
}
