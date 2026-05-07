import React, { useEffect, useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CVPreview from './CVPreview';

const STORAGE_KEY = 'cv_builder_data_v1';

const defaultData = {
    profile: {
        fullName: 'Trần Trọng Luân',
        role: 'INTERN ReactJS',
        dob: '01/01/2003',
        gender: 'Nam',
        phone: '0899804328',
        email: 'tluan113@gmail.com',
        address: 'Quan Hoa, Cầu Giấy, Hà Nội',
        avatar: 'https://i.pravatar.cc/300',
        summary:
            'Lập trình viên Frontend với kinh nghiệm xây dựng website bằng React, Tailwind. Đam mê UI/UX và tối ưu hiệu suất.',
    },
    education: {
        school: 'Cao Đẳng Nghề Bách Khoa',
        year: '2021 - 2024',
        major: 'Quản Trị Mạng',
    },
    skills: ['ReactJS', 'NextJS', 'JavaScript', 'TailwindCSS'],
    experience: [
        {
            id: Date.now(),
            company: 'Công ty ABC',
            position: 'Frontend Developer',
            start: '2022',
            end: '2024',
            description: 'Phát triển giao diện web, tối ưu SEO và phối hợp với backend team.',
        },
    ],
    projects: [
        {
            id: Date.now() + 1,
            name: 'Website bán Laptop',
            role: 'Frontend Developer',
            description: 'Xây dựng website bán hàng, giỏ hàng, thanh toán, dashboard quản trị.',
            tech: ['React', 'Node.js', 'MySQL'],
            link: 'https://github.com/tluan010103/laptop-project',
        },
    ],
    hobbies: 'Nghe nhạc, xem phim, piano',
    objective: 'Mong muốn trở thành lập trình viên Full-Stack JS, học hỏi nhanh và phát triển chuyên môn.',
};

export default function Template1() {
    const [cv, setCv] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : defaultData;
        } catch {
            return defaultData;
        }
    });

    const previewRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
    }, [cv]);

    // Generic updater for root-level fields
    const handleChange = (path, value) => {
        // path: array of keys or string with dot
        const keys = Array.isArray(path) ? path : String(path).split('.');
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            let o = next;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!o[keys[i]]) o[keys[i]] = {};
                o = o[keys[i]];
            }
            o[keys[keys.length - 1]] = value;
            return next;
        });
    };

    // Skills
    const addSkill = (skill) => {
        if (!skill) return;
        setCv((p) => ({ ...p, skills: [...p.skills, skill] }));
    };
    const removeSkill = (index) => {
        setCv((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== index) }));
    };

    // Experience
    const addExperience = () => {
        const item = {
            id: Date.now(),
            company: 'Công ty mới',
            position: 'Vị trí',
            start: '2024',
            end: '',
            description: 'Mô tả công việc...',
        };
        setCv((p) => ({ ...p, experience: [...p.experience, item] }));
    };
    const updateExperience = (id, field, value) => {
        setCv((p) => ({
            ...p,
            experience: p.experience.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
        }));
    };
    const removeExperience = (id) => {
        setCv((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) }));
    };

    // Projects
    const addProject = () => {
        const item = {
            id: Date.now(),
            name: 'Dự án mới',
            role: 'Vai trò',
            description: 'Mô tả dự án',
            tech: [],
            link: '',
        };
        setCv((p) => ({ ...p, projects: [...p.projects, item] }));
    };
    const updateProject = (id, field, value) => {
        setCv((p) => ({
            ...p,
            projects: p.projects.map((pr) => (pr.id === id ? { ...pr, [field]: value } : pr)),
        }));
    };
    const removeProject = (id) => {
        setCv((p) => ({ ...p, projects: p.projects.filter((pr) => pr.id !== id) }));
    };

    // Export to PDF
    const exportPDF = async () => {
        if (!previewRef.current) return;
        const element = previewRef.current;
        const originalWidth = element.offsetWidth;
        const originalHeight = element.offsetHeight;

        // A4 size in mm: 210 x 297. We'll scale to fit width.
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = 210;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If content longer than one page
        if (pdfHeight <= 297) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } else {
            // Split into multiple pages
            let remainingHeight = canvas.height;
            const pageHeightPx = (canvas.width * 297) / 210;
            let position = 0;
            while (remainingHeight > 0) {
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(pageHeightPx, remainingHeight);
                const ctx = pageCanvas.getContext('2d');
                ctx.drawImage(
                    canvas,
                    0,
                    position,
                    canvas.width,
                    pageCanvas.height,
                    0,
                    0,
                    canvas.width,
                    pageCanvas.height,
                );
                const pageData = pageCanvas.toDataURL('image/png');
                const h = (pageCanvas.height * pdfWidth) / pageCanvas.width;
                pdf.addImage(pageData, 'PNG', 0, 0, pdfWidth, h);
                remainingHeight -= pageCanvas.height;
                position += pageCanvas.height;
                if (remainingHeight > 0) pdf.addPage();
            }
        }

        pdf.save('cv.pdf');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-[1200px] mx-auto bg-white shadow-md grid grid-cols-3">
                {/* Left form */}
                <div className="col-span-1 p-6 border-r space-y-4">
                    <h2 className="text-xl font-bold text-[#0b6fa4]">Chỉnh sửa CV</h2>

                    {/* Personal */}
                    <div>
                        <h3 className="font-semibold">Thông tin cá nhân</h3>
                        <input
                            className="w-full border p-2 mt-2 rounded"
                            value={cv.profile.fullName}
                            onChange={(e) => handleChange(['profile', 'fullName'], e.target.value)}
                            placeholder="Họ và tên"
                        />
                        <input
                            className="w-full border p-2 mt-2 rounded"
                            value={cv.profile.role}
                            onChange={(e) => handleChange(['profile', 'role'], e.target.value)}
                            placeholder="Chức danh"
                        />
                        <input
                            className="w-full border p-2 mt-2 rounded"
                            value={cv.profile.email}
                            onChange={(e) => handleChange(['profile', 'email'], e.target.value)}
                            placeholder="Email"
                        />
                        <input
                            className="w-full border p-2 mt-2 rounded"
                            value={cv.profile.phone}
                            onChange={(e) => handleChange(['profile', 'phone'], e.target.value)}
                            placeholder="Số điện thoại"
                        />
                        <input
                            className="w-full border p-2 mt-2 rounded"
                            value={cv.profile.address}
                            onChange={(e) => handleChange(['profile', 'address'], e.target.value)}
                            placeholder="Địa chỉ"
                        />
                    </div>

                    {/* Objective */}
                    <div>
                        <h3 className="font-semibold">Mục tiêu nghề nghiệp</h3>
                        <textarea
                            className="w-full border p-2 mt-2 rounded min-h-[80px]"
                            value={cv.objective}
                            onChange={(e) => handleChange('objective', e.target.value)}
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 className="font-semibold">Kỹ năng</h3>
                        <div className="flex gap-2 mt-2">
                            <SkillInput onAdd={(s) => addSkill(s)} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {cv.skills.map((s, i) => (
                                <div key={i} className="bg-[#eaf6fb] px-3 py-1 rounded flex items-center gap-2">
                                    <span className="text-sm">{s}</span>
                                    <button onClick={() => removeSkill(i)} className="text-xs text-red-500" title="Xóa">
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Kinh nghiệm</h3>
                            <button
                                onClick={addExperience}
                                className="flex items-center gap-1 text-sm text-blue-600"
                                title="Thêm kinh nghiệm"
                            >
                                <FiPlus /> Thêm
                            </button>
                        </div>
                        <div className="mt-2 space-y-3 max-h-[220px] overflow-auto pr-2">
                            {cv.experience.map((ex) => (
                                <div key={ex.id} className="border rounded p-2">
                                    <input
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={ex.position}
                                        onChange={(e) => updateExperience(ex.id, 'position', e.target.value)}
                                        placeholder="Vị trí"
                                    />
                                    <input
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={ex.company}
                                        onChange={(e) => updateExperience(ex.id, 'company', e.target.value)}
                                        placeholder="Công ty"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            className="w-1/2 border p-1 rounded text-sm"
                                            value={ex.start}
                                            onChange={(e) => updateExperience(ex.id, 'start', e.target.value)}
                                        />
                                        <input
                                            className="w-1/2 border p-1 rounded text-sm"
                                            value={ex.end}
                                            onChange={(e) => updateExperience(ex.id, 'end', e.target.value)}
                                        />
                                    </div>
                                    <textarea
                                        className="w-full border p-1 rounded text-sm mt-1"
                                        value={ex.description}
                                        onChange={(e) => updateExperience(ex.id, 'description', e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeExperience(ex.id)}
                                        className="text-sm text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <FiTrash2 /> Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Dự án</h3>
                            <button onClick={addProject} className="flex items-center gap-1 text-sm text-blue-600">
                                <FiPlus /> Thêm
                            </button>
                        </div>
                        <div className="mt-2 space-y-3 max-h-[220px] overflow-auto pr-2">
                            {cv.projects.map((pr) => (
                                <div key={pr.id} className="border rounded p-2">
                                    <input
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={pr.name}
                                        onChange={(e) => updateProject(pr.id, 'name', e.target.value)}
                                        placeholder="Tên dự án"
                                    />
                                    <input
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={pr.role}
                                        onChange={(e) => updateProject(pr.id, 'role', e.target.value)}
                                        placeholder="Vai trò"
                                    />
                                    <textarea
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={pr.description}
                                        onChange={(e) => updateProject(pr.id, 'description', e.target.value)}
                                        placeholder="Mô tả"
                                    />
                                    <input
                                        className="w-full border p-1 rounded text-sm mb-1"
                                        value={pr.link}
                                        onChange={(e) => updateProject(pr.id, 'link', e.target.value)}
                                        placeholder="Link (Github/website)"
                                    />
                                    <button
                                        onClick={() => removeProject(pr.id)}
                                        className="text-sm text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <FiTrash2 /> Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <button
                            onClick={() => localStorage.removeItem(STORAGE_KEY) || setCv(defaultData)}
                            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                        >
                            Reset
                        </button>
                        <button
                            onClick={exportPDF}
                            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FiDownload /> Xuất PDF
                        </button>
                    </div>
                </div>

                {/* Right preview */}
                <div className="col-span-2 p-6">
                    <div ref={previewRef}>
                        <CVPreview cv={cv} onInlineEdit={(path, value) => handleChange(path, value)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* SkillInput component (inline in same file for simplicity) */
function SkillInput({ onAdd }) {
    const [val, setVal] = useState('');
    const handleAdd = () => {
        if (!val.trim()) return;
        onAdd(val.trim());
        setVal('');
    };
    return (
        <div className="flex gap-2 w-full">
            <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="flex-1 border p-2 rounded"
                placeholder="Thêm kỹ năng..."
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="bg-blue-600 text-white px-3 rounded">
                Thêm
            </button>
        </div>
    );
}
