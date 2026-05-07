import React, { useState } from 'react';
import { Input, Button, Collapse, Slider, Tag, Upload, message, Tooltip, Switch, Space } from 'antd';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    Code,
    FolderOpen,
    Award,
    Globe,
    Heart,
    Target,
    Plus,
    Trash2,
    Upload as UploadIcon,
    Linkedin,
    Github,
    GripVertical,
} from 'lucide-react';
import { requestUploadCVAvatar } from '../../../config/cvRequest';

const { TextArea } = Input;
const { Panel } = Collapse;

// Reusable Form Section Header
const SectionHeader = ({ icon: Icon, title, onAdd, addLabel = 'Thêm' }) => (
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
            <Icon size={16} className="text-sky-600" />
            <span className="font-medium">{title}</span>
        </div>
        {onAdd && (
            <Button
                type="link"
                size="small"
                icon={<Plus size={14} />}
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                }}
                className="flex items-center gap-1"
            >
                {addLabel}
            </Button>
        )}
    </div>
);

// Form Input with label
const FormInput = ({ label, icon: Icon, ...props }) => (
    <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <Input {...props} className="rounded-lg" />
    </div>
);

export default function CVForm({ cv, updateField, addItem, updateItem, removeItem, cvId, isEditMode }) {
    const [newSkill, setNewSkill] = useState('');
    const [newTech, setNewTech] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarUpload = async (info) => {
        const file = info.file.originFileObj || info.file;

        // Nếu đang ở edit mode và có cvId, upload lên server
        if (isEditMode && cvId) {
            setUploadingAvatar(true);
            try {
                const res = await requestUploadCVAvatar(cvId, file);

                // Cập nhật avatar path từ server
                if (res?.metadata?.avatar) {
                    const avatarUrl = res.metadata.avatar;
                    updateField(['profile', 'avatar'], avatarUrl);
                    message.success('Đã cập nhật ảnh đại diện');
                }
            } catch (error) {
                console.error('Upload avatar failed:', error);
                message.error('Upload ảnh thất bại!');
            } finally {
                setUploadingAvatar(false);
            }
        } else {
            // Nếu chưa lưu CV, giữ File ở frontend dùng blob URL
            const url = URL.createObjectURL(file);
            updateField(['profile', 'avatar'], url);
            updateField(['profile', 'avatarFile'], file);
            message.success('Đã chọn ảnh đại diện. Vui lòng lưu CV để hoàn tất.');
        }
    };

    // Add skill
    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        addItem('skills', { name: newSkill.trim(), level: 70 });
        setNewSkill('');
    };

    // Add tech to project
    const handleAddTech = (projectId) => {
        const tech = newTech[projectId]?.trim();
        if (!tech) return;
        const project = cv.projects.find((p) => p.id === projectId);
        if (project) {
            updateItem('projects', projectId, 'tech', [...(project.tech || []), tech]);
            setNewTech((prev) => ({ ...prev, [projectId]: '' }));
        }
    };

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <Collapse defaultActiveKey={['profile', 'objective']} ghost className="cv-form-collapse">
                {/* Profile Section */}
                <Panel header={<SectionHeader icon={User} title="Thông Tin Cá Nhân" />} key="profile">
                    <div className="space-y-3">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={
                                    cv.profile?.avatar?.startsWith('blob:') || cv.profile?.avatar?.startsWith('http')
                                        ? cv.profile.avatar
                                        : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar || 'uploads/avatars/default.png'}`
                                }
                                alt="avatar"
                                className="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                            />
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                disabled={uploadingAvatar}
                            >
                                <Button
                                    icon={<UploadIcon size={14} />}
                                    className="flex items-center gap-1"
                                    loading={uploadingAvatar}
                                >
                                    {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
                                </Button>
                            </Upload>
                        </div>

                        <FormInput
                            label="Họ và tên"
                            icon={User}
                            value={cv.profile.fullName}
                            onChange={(e) => updateField(['profile', 'fullName'], e.target.value)}
                            placeholder="Nguyễn Văn A"
                        />

                        <FormInput
                            label="Chức danh / Vị trí"
                            icon={Briefcase}
                            value={cv.profile.role}
                            onChange={(e) => updateField(['profile', 'role'], e.target.value)}
                            placeholder="Frontend Developer"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Ngày sinh"
                                icon={Calendar}
                                value={cv.profile.dob}
                                onChange={(e) => updateField(['profile', 'dob'], e.target.value)}
                                placeholder="01/01/2000"
                            />
                            <FormInput
                                label="Giới tính"
                                value={cv.profile.gender}
                                onChange={(e) => updateField(['profile', 'gender'], e.target.value)}
                                placeholder="Nam/Nữ"
                            />
                        </div>

                        <FormInput
                            label="Email"
                            icon={Mail}
                            value={cv.profile.email}
                            onChange={(e) => updateField(['profile', 'email'], e.target.value)}
                            placeholder="email@example.com"
                        />

                        <FormInput
                            label="Số điện thoại"
                            icon={Phone}
                            value={cv.profile.phone}
                            onChange={(e) => updateField(['profile', 'phone'], e.target.value)}
                            placeholder="0123 456 789"
                        />

                        <FormInput
                            label="Địa chỉ"
                            icon={MapPin}
                            value={cv.profile.address}
                            onChange={(e) => updateField(['profile', 'address'], e.target.value)}
                            placeholder="Quận/Huyện, Thành phố"
                        />

                        <FormInput
                            label="LinkedIn"
                            icon={Linkedin}
                            value={cv.profile.linkedin || ''}
                            onChange={(e) => updateField(['profile', 'linkedin'], e.target.value)}
                            placeholder="linkedin.com/in/username"
                        />

                        <FormInput
                            label="GitHub"
                            icon={Github}
                            value={cv.profile.github || ''}
                            onChange={(e) => updateField(['profile', 'github'], e.target.value)}
                            placeholder="github.com/username"
                        />
                    </div>
                </Panel>

                {/* Objective */}
                <Panel header={<SectionHeader icon={Target} title="Mục Tiêu Nghề Nghiệp" />} key="objective">
                    <TextArea
                        value={cv.objective}
                        onChange={(e) => updateField('objective', e.target.value)}
                        placeholder="Mô tả mục tiêu nghề nghiệp của bạn..."
                        rows={4}
                        className="rounded-lg"
                    />
                </Panel>

                {/* Skills */}
                <Panel header={<SectionHeader icon={Code} title="Kỹ Năng" />} key="skills">
                    <div className="space-y-3">
                        {/* Add new skill */}
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Thêm kỹ năng..."
                                onPressEnter={handleAddSkill}
                                className="rounded-lg"
                            />
                            <Button type="primary" onClick={handleAddSkill} icon={<Plus size={14} />}>
                                Thêm
                            </Button>
                        </div>

                        {/* Skill list */}
                        <div className="space-y-3">
                            {cv.skills?.map((skill) => (
                                <div key={skill.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{skill.name}</span>
                                        <Tooltip title="Xóa">
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<Trash2 size={14} />}
                                                onClick={() => removeItem('skills', skill.id)}
                                            />
                                        </Tooltip>
                                    </div>
                                    <Slider
                                        value={skill.level}
                                        onChange={(val) => updateItem('skills', skill.id, 'level', val)}
                                        tooltip={{ formatter: (val) => `${val}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* Education */}
                <Panel
                    header={
                        <SectionHeader
                            icon={GraduationCap}
                            title="Học Vấn"
                            onAdd={() =>
                                addItem('education', {
                                    school: 'Tên trường',
                                    year: '20XX - 20XX',
                                    major: 'Chuyên ngành',
                                    gpa: '',
                                })
                            }
                        />
                    }
                    key="education"
                >
                    <div className="space-y-4">
                        {cv.education?.map((edu) => (
                            <div key={edu.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-end mb-2">
                                    <Tooltip title="Xóa">
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 size={14} />}
                                            onClick={() => removeItem('education', edu.id)}
                                        />
                                    </Tooltip>
                                </div>
                                <FormInput
                                    label="Trường"
                                    value={edu.school}
                                    onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)}
                                />
                                <FormInput
                                    label="Chuyên ngành"
                                    value={edu.major}
                                    onChange={(e) => updateItem('education', edu.id, 'major', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        label="Thời gian"
                                        value={edu.year}
                                        onChange={(e) => updateItem('education', edu.id, 'year', e.target.value)}
                                    />
                                    <FormInput
                                        label="GPA"
                                        value={edu.gpa || ''}
                                        onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                                        placeholder="3.5/4.0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Experience */}
                <Panel
                    header={
                        <SectionHeader
                            icon={Briefcase}
                            title="Kinh Nghiệm"
                            onAdd={() =>
                                addItem('experience', {
                                    company: 'Tên công ty',
                                    position: 'Vị trí',
                                    start: '01/2024',
                                    end: '',
                                    current: true,
                                    description: 'Mô tả công việc...',
                                    achievements: [],
                                })
                            }
                        />
                    }
                    key="experience"
                >
                    <div className="space-y-4">
                        {cv.experience?.map((exp) => (
                            <div key={exp.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-end mb-2">
                                    <Tooltip title="Xóa">
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 size={14} />}
                                            onClick={() => removeItem('experience', exp.id)}
                                        />
                                    </Tooltip>
                                </div>
                                <FormInput
                                    label="Vị trí"
                                    value={exp.position}
                                    onChange={(e) => updateItem('experience', exp.id, 'position', e.target.value)}
                                />
                                <FormInput
                                    label="Công ty"
                                    value={exp.company}
                                    onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        label="Bắt đầu"
                                        value={exp.start}
                                        onChange={(e) => updateItem('experience', exp.id, 'start', e.target.value)}
                                    />
                                    <div>
                                        <FormInput
                                            label="Kết thúc"
                                            value={exp.end}
                                            onChange={(e) => updateItem('experience', exp.id, 'end', e.target.value)}
                                            disabled={exp.current}
                                        />
                                        <label className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Switch
                                                size="small"
                                                checked={exp.current}
                                                onChange={(checked) =>
                                                    updateItem('experience', exp.id, 'current', checked)
                                                }
                                            />
                                            Đang làm việc
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500 mb-1 block">Mô tả</label>
                                    <TextArea
                                        value={exp.description}
                                        onChange={(e) =>
                                            updateItem('experience', exp.id, 'description', e.target.value)
                                        }
                                        rows={2}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Projects */}
                <Panel
                    header={
                        <SectionHeader
                            icon={FolderOpen}
                            title="Dự Án"
                            onAdd={() =>
                                addItem('projects', {
                                    name: 'Tên dự án',
                                    role: 'Vai trò',
                                    description: 'Mô tả dự án...',
                                    tech: [],
                                    link: '',
                                    demo: '',
                                })
                            }
                        />
                    }
                    key="projects"
                >
                    <div className="space-y-4">
                        {cv.projects?.map((project) => (
                            <div key={project.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-end mb-2">
                                    <Tooltip title="Xóa">
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 size={14} />}
                                            onClick={() => removeItem('projects', project.id)}
                                        />
                                    </Tooltip>
                                </div>
                                <FormInput
                                    label="Tên dự án"
                                    value={project.name}
                                    onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)}
                                />
                                <FormInput
                                    label="Vai trò"
                                    value={project.role}
                                    onChange={(e) => updateItem('projects', project.id, 'role', e.target.value)}
                                />
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500 mb-1 block">Mô tả</label>
                                    <TextArea
                                        value={project.description}
                                        onChange={(e) =>
                                            updateItem('projects', project.id, 'description', e.target.value)
                                        }
                                        rows={2}
                                        className="rounded-lg"
                                    />
                                </div>
                                <FormInput
                                    label="Link GitHub"
                                    icon={Github}
                                    value={project.link}
                                    onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                                />
                                <FormInput
                                    label="Link Demo"
                                    icon={Globe}
                                    value={project.demo || ''}
                                    onChange={(e) => updateItem('projects', project.id, 'demo', e.target.value)}
                                />
                                {/* Tech stack */}
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500 mb-1 block">Công nghệ</label>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {project.tech?.map((tech, i) => (
                                            <Tag
                                                key={i}
                                                closable
                                                onClose={() => {
                                                    const newTech = project.tech.filter((_, idx) => idx !== i);
                                                    updateItem('projects', project.id, 'tech', newTech);
                                                }}
                                                className="rounded-full"
                                            >
                                                {tech}
                                            </Tag>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            size="small"
                                            value={newTech[project.id] || ''}
                                            onChange={(e) =>
                                                setNewTech((prev) => ({ ...prev, [project.id]: e.target.value }))
                                            }
                                            placeholder="React, Node.js..."
                                            onPressEnter={() => handleAddTech(project.id)}
                                            className="rounded-lg"
                                        />
                                        <Button size="small" onClick={() => handleAddTech(project.id)}>
                                            Thêm
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Certifications */}
                <Panel
                    header={
                        <SectionHeader
                            icon={Award}
                            title="Chứng Chỉ"
                            onAdd={() =>
                                addItem('certifications', {
                                    name: 'Tên chứng chỉ',
                                    issuer: 'Đơn vị cấp',
                                    date: '2024',
                                })
                            }
                        />
                    }
                    key="certifications"
                >
                    <div className="space-y-3">
                        {cv.certifications?.map((cert) => (
                            <div key={cert.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-end mb-2">
                                    <Tooltip title="Xóa">
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 size={14} />}
                                            onClick={() => removeItem('certifications', cert.id)}
                                        />
                                    </Tooltip>
                                </div>
                                <FormInput
                                    label="Tên chứng chỉ"
                                    value={cert.name}
                                    onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        label="Đơn vị cấp"
                                        value={cert.issuer}
                                        onChange={(e) =>
                                            updateItem('certifications', cert.id, 'issuer', e.target.value)
                                        }
                                    />
                                    <FormInput
                                        label="Năm"
                                        value={cert.date}
                                        onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Languages */}
                <Panel
                    header={
                        <SectionHeader
                            icon={Globe}
                            title="Ngôn Ngữ"
                            onAdd={() =>
                                addItem('languages', {
                                    name: 'Ngôn ngữ',
                                    level: 'Trình độ',
                                })
                            }
                        />
                    }
                    key="languages"
                >
                    <div className="space-y-3">
                        {cv.languages?.map((lang) => (
                            <div
                                key={lang.id}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex gap-3 items-center"
                            >
                                <Input
                                    value={lang.name}
                                    onChange={(e) => updateItem('languages', lang.id, 'name', e.target.value)}
                                    placeholder="Tiếng Anh"
                                    className="flex-1 rounded-lg"
                                />
                                <Input
                                    value={lang.level}
                                    onChange={(e) => updateItem('languages', lang.id, 'level', e.target.value)}
                                    placeholder="Thành thạo"
                                    className="flex-1 rounded-lg"
                                />
                                <Tooltip title="Xóa">
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<Trash2 size={14} />}
                                        onClick={() => removeItem('languages', lang.id)}
                                    />
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Hobbies */}
                <Panel header={<SectionHeader icon={Heart} title="Sở Thích" />} key="hobbies">
                    <TextArea
                        value={cv.hobbies}
                        onChange={(e) => updateField('hobbies', e.target.value)}
                        placeholder="Đọc sách, du lịch, thể thao..."
                        rows={2}
                        className="rounded-lg"
                    />
                </Panel>
            </Collapse>
        </div>
    );
}
