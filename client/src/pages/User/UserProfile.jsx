import { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, Mail, Phone, MapPin, Calendar, Briefcase, BookOpen, Tag, FileText } from 'lucide-react';
import { Form, Input, Select, DatePicker, Button, message, Tag as AntTag } from 'antd';
import dayjs from 'dayjs';
import { authAPI } from '../../api/auth.api';
import { useAuth } from '../../store/authStore';

const { TextArea } = Input;

const SKILLS_OPTIONS = [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Python',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Laravel',
    'Django',
    'Spring Boot',
    'Docker',
    'Kubernetes',
    'AWS',
    'Firebase',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Git',
    'Figma',
    'Photoshop',
];

const SERVER_URL = 'http://localhost:3000';

export default function UserProfile() {
    const { user, updateUser, fetchMe } = useAuth();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    // Sync form values khi user load xong (async từ authStore)
    useEffect(() => {
        if (!user) return;
        form.setFieldsValue({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || undefined,
            birthDay: user.birthDay ? dayjs(user.birthDay) : null,
            headline: user.headline || '',
            summary: user.summary || '',
            skills: user.skills || [],
            experience: user.experience || '',
            education: user.education || '',
        });
    }, [user, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload = {
                ...values,
                birthDay: values.birthDay ? values.birthDay.toISOString() : null,
            };
            const res = await authAPI.updateProfile(payload);
            updateUser(res.data?.metadata || payload);
            message.success('Cập nhật hồ sơ thành công!');
        } catch (e) {
            if (e?.errorFields) return;
            message.error('Cập nhật thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return message.error('Ảnh tối đa 5MB!');
        setUploadingAvatar(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            await authAPI.uploadAvatar(fd);
            await fetchMe();
            message.success('Cập nhật ảnh đại diện thành công!');
        } catch {
            message.error('Upload ảnh thất bại!');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const avatarSrc = user?.avatar
        ? user.avatar.startsWith('http')
            ? user.avatar
            : `${SERVER_URL}/uploads/avatars/${user.avatar}`
        : null;

    return (
        <div>
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
                    <p className="text-slate-500 text-sm mt-1">Cập nhật thông tin cá nhân và hồ sơ ứng tuyển</p>
                </div>
                <Button type="primary" icon={<Save size={15} />} size="large" loading={saving} onClick={handleSave}>
                    Lưu thay đổi
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Avatar card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center ring-4 ring-indigo-100 shadow-lg">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
                            >
                                {uploadingAvatar ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera size={14} />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg">{user?.fullName || 'Ứng viên'}</h3>
                        <p className="text-indigo-600 text-sm font-medium mt-0.5">
                            {user?.headline || 'Chưa có tiêu đề'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">{user?.email}</p>

                        {/* Quick stats */}
                        <div className="w-full mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Số dư', value: `${Number(user?.balance || 0).toLocaleString('vi-VN')} đ` },
                                { label: 'Kỹ năng', value: `${(user?.skills || []).length} kỹ năng` },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-400 mb-0.5">{stat.label}</p>
                                    <p className="font-bold text-slate-700 text-sm">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Skills tags preview */}
                        {user?.skills?.length > 0 && (
                            <div className="w-full mt-4 text-left">
                                <p className="text-xs text-slate-400 mb-2">Kỹ năng nổi bật</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.skills.slice(0, 6).map((s) => (
                                        <AntTag key={s} color="blue" className="text-xs">
                                            {s}
                                        </AntTag>
                                    ))}
                                    {user.skills.length > 6 && (
                                        <AntTag className="text-xs">+{user.skills.length - 6}</AntTag>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <User size={16} className="text-indigo-600" />
                            </div>
                            <h2 className="font-bold text-slate-800">Thông tin cơ bản</h2>
                        </div>

                        <Form form={form} layout="vertical" requiredMark={false}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Form.Item
                                    name="fullName"
                                    label={<span className="font-semibold text-slate-700 text-sm">Họ và tên</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                >
                                    <Input
                                        size="large"
                                        prefix={<User size={14} className="text-slate-400" />}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label={<span className="font-semibold text-slate-700 text-sm">Email</span>}
                                >
                                    <Input
                                        size="large"
                                        prefix={<Mail size={14} className="text-slate-400" />}
                                        placeholder="example@email.com"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="phone"
                                    label={<span className="font-semibold text-slate-700 text-sm">Số điện thoại</span>}
                                >
                                    <Input
                                        size="large"
                                        prefix={<Phone size={14} className="text-slate-400" />}
                                        placeholder="0900 000 000"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="gender"
                                    label={<span className="font-semibold text-slate-700 text-sm">Giới tính</span>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Chọn giới tính"
                                        options={[
                                            { value: 'male', label: 'Nam' },
                                            { value: 'female', label: 'Nữ' },
                                            { value: 'other', label: 'Khác' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="birthDay"
                                    label={<span className="font-semibold text-slate-700 text-sm">Ngày sinh</span>}
                                >
                                    <DatePicker
                                        className="w-full"
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        suffixIcon={<Calendar size={14} className="text-slate-400" />}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="address"
                                    label={<span className="font-semibold text-slate-700 text-sm">Địa chỉ</span>}
                                >
                                    <Input
                                        size="large"
                                        prefix={<MapPin size={14} className="text-slate-400" />}
                                        placeholder="TP. Hồ Chí Minh"
                                    />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>

                    {/* Career info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Briefcase size={16} className="text-indigo-600" />
                            </div>
                            <h2 className="font-bold text-slate-800">Thông tin nghề nghiệp</h2>
                        </div>

                        <Form form={form} layout="vertical" requiredMark={false}>
                            <Form.Item
                                name="headline"
                                label={<span className="font-semibold text-slate-700 text-sm">Tiêu đề (Headline)</span>}
                            >
                                <Input
                                    size="large"
                                    prefix={<Tag size={14} className="text-slate-400" />}
                                    placeholder="VD: Senior React Developer | 3+ năm kinh nghiệm"
                                />
                            </Form.Item>

                            <Form.Item
                                name="summary"
                                label={
                                    <span className="font-semibold text-slate-700 text-sm">Giới thiệu bản thân</span>
                                }
                            >
                                <TextArea
                                    rows={4}
                                    size="large"
                                    placeholder="Mô tả ngắn về bản thân, mục tiêu nghề nghiệp..."
                                />
                            </Form.Item>

                            <Form.Item
                                name="skills"
                                label={
                                    <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
                                        <Tag size={14} /> Kỹ năng
                                    </span>
                                }
                            >
                                <Select
                                    mode="tags"
                                    size="large"
                                    placeholder="Chọn hoặc nhập kỹ năng..."
                                    options={SKILLS_OPTIONS.map((s) => ({ value: s, label: s }))}
                                    tokenSeparators={[',']}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Form.Item
                                    name="experience"
                                    label={
                                        <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
                                            <Briefcase size={14} /> Kinh nghiệm
                                        </span>
                                    }
                                >
                                    <TextArea rows={3} size="large" placeholder="Mô tả kinh nghiệm làm việc..." />
                                </Form.Item>
                                <Form.Item
                                    name="education"
                                    label={
                                        <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
                                            <BookOpen size={14} /> Học vấn
                                        </span>
                                    }
                                >
                                    <TextArea
                                        rows={3}
                                        size="large"
                                        placeholder="VD: Đại học Bách Khoa – Kỹ thuật Phần mềm"
                                    />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>

                    {/* Save button bottom */}
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            size="large"
                            loading={saving}
                            onClick={handleSave}
                            icon={<Save size={15} />}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
