import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cv_builder_data_v2';

export const defaultCVData = {
    profile: {
        fullName: 'Nguyễn Minh Khang',
        role: 'Senior Frontend Engineer',
        dob: '15/08/1995',
        gender: 'Nam',
        phone: '0905123456',
        email: 'khang.dev95@gmail.com',
        address: 'Thảo Điền, Quận 2, TP. Hồ Chí Minh',
        avatar: 'https://i.pravatar.cc/300?img=12',
        summary:
            'Senior Frontend Engineer với hơn 6 năm kinh nghiệm phát triển ứng dụng web hiệu năng cao. Thành thạo React, Next.js, TypeScript và tối ưu UI/UX. Có kinh nghiệm dẫn dắt team, review code và xây dựng kiến trúc frontend.',
        linkedin: 'https://linkedin.com/in/minhkhang',
        github: 'https://github.com/minhkhangdev',
        website: 'https://minhkhang.dev',
    },

    education: [
        {
            id: Date.now(),
            school: 'Đại Học Công Nghệ Thông Tin – ĐHQG TP.HCM',
            year: '2013 - 2017',
            major: 'Khoa học máy tính',
            gpa: '3.6/4.0',
        },
    ],

    skills: [
        { id: 1, name: 'ReactJS', level: 95 },
        { id: 2, name: 'NextJS', level: 90 },
        { id: 3, name: 'TypeScript', level: 92 },
        { id: 4, name: 'TailwindCSS', level: 90 },
        { id: 5, name: 'Node.js', level: 85 },
        { id: 6, name: 'System Design', level: 80 },
        { id: 7, name: 'Clean Architecture', level: 75 },
    ],

    experience: [
        {
            id: Date.now(),
            company: 'TechMaster Solutions',
            position: 'Senior Frontend Engineer',
            start: '03/2020',
            end: 'Hiện tại',
            current: true,
            description:
                'Dẫn dắt team Frontend, thiết kế kiến trúc React/Next.js, tối ưu hiệu suất cho hệ thống phục vụ hơn 2 triệu người dùng.',
            achievements: [
                'Giảm 45% thời gian tải trang trên toàn hệ thống',
                'Xây dựng thư viện UI nội bộ sử dụng lại cho 4 dự án',
                'Mentor 6 lập trình viên junior và intern',
            ],
        },
        {
            id: Date.now() + 5,
            company: 'GlobalSoft',
            position: 'Frontend Developer',
            start: '01/2018',
            end: '02/2020',
            current: false,
            description: 'Tham gia phát triển hệ thống CRM, xây dựng dashboard lớn và các chức năng realtime.',
            achievements: [
                'Tối ưu hiệu năng rendering giúp tăng FPS từ 30 lên 60',
                'Xây dựng 20+ components reusable cho toàn bộ hệ thống',
            ],
        },
    ],

    projects: [
        {
            id: Date.now() + 1,
            name: 'Nền tảng E-commerce đa nhà bán',
            role: 'Technical Lead Frontend',
            description:
                'Xây dựng hệ thống thương mại điện tử có hơn 50k sản phẩm, realtime notifications, micro-frontend.',
            tech: ['Next.js', 'TypeScript', 'Node.js', 'Redis', 'Docker'],
            link: 'https://github.com/minhkhangdev/ecommerce-platform',
            demo: 'https://ecommerce-demo.vercel.app/',
        },
        {
            id: Date.now() + 10,
            name: 'Website quản lý booking du lịch',
            role: 'Senior Frontend Developer',
            description: 'Xây dựng hệ thống đặt tour, thanh toán online, quản trị viên và dashboard thống kê.',
            tech: ['React', 'Redux Toolkit', 'Express', 'MongoDB'],
            link: '',
            demo: '',
        },
    ],

    certifications: [
        {
            id: Date.now() + 2,
            name: 'Meta Front-End Developer Professional Certificate',
            issuer: 'Meta',
            date: '2024',
        },
        {
            id: Date.now() + 3,
            name: 'Advanced React & TypeScript',
            issuer: 'Udemy',
            date: '2023',
        },
    ],

    languages: [
        { id: 1, name: 'Tiếng Việt', level: 'Bản ngữ' },
        { id: 2, name: 'Tiếng Anh', level: 'Thành thạo (IELTS 7.0)' },
    ],

    hobbies: 'Đọc sách công nghệ, chạy bộ, chụp ảnh, du lịch',
    objective:
        'Mong muốn trở thành Frontend Architect, tham gia các dự án ở quy mô lớn và tối ưu trải nghiệm người dùng.',
    references: [
        {
            id: Date.now() + 20,
            name: 'Trần Hải Nam',
            role: 'CTO – TechMaster Solutions',
            phone: '0909111122',
            email: 'hai.nam@techmaster.com',
        },
    ],
};

export function useCVData() {
    const [cv, setCv] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Merge with default to handle new fields
                return { ...defaultCVData, ...parsed };
            }
            return defaultCVData;
        } catch {
            return defaultCVData;
        }
    });

    const [selectedTemplate, setSelectedTemplate] = useState(() => {
        return localStorage.getItem('cv_selected_template') || 'modern';
    });

    // Auto save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
    }, [cv]);

    useEffect(() => {
        localStorage.setItem('cv_selected_template', selectedTemplate);
    }, [selectedTemplate]);

    // Generic update function with path support
    const updateField = useCallback((path, value) => {
        const keys = Array.isArray(path) ? path : String(path).split('.');
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            let obj = next;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return next;
        });
    }, []);

    // Array operations
    const addItem = useCallback((arrayPath, newItem) => {
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = Array.isArray(arrayPath) ? arrayPath : [arrayPath];
            let arr = next;
            for (const key of keys) {
                arr = arr[key];
            }
            if (Array.isArray(arr)) {
                arr.push({ ...newItem, id: Date.now() });
            }
            return next;
        });
    }, []);

    const updateItem = useCallback((arrayPath, id, field, value) => {
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = Array.isArray(arrayPath) ? arrayPath : [arrayPath];
            let arr = next;
            for (const key of keys) {
                arr = arr[key];
            }
            if (Array.isArray(arr)) {
                const item = arr.find((i) => i.id === id);
                if (item) item[field] = value;
            }
            return next;
        });
    }, []);

    const removeItem = useCallback((arrayPath, id) => {
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = Array.isArray(arrayPath) ? arrayPath : [arrayPath];
            let parent = next;
            for (let i = 0; i < keys.length - 1; i++) {
                parent = parent[keys[i]];
            }
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(parent[lastKey])) {
                parent[lastKey] = parent[lastKey].filter((i) => i.id !== id);
            }
            return next;
        });
    }, []);

    const reorderItems = useCallback((arrayPath, fromIndex, toIndex) => {
        setCv((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = Array.isArray(arrayPath) ? arrayPath : [arrayPath];
            let arr = next;
            for (const key of keys) {
                arr = arr[key];
            }
            if (Array.isArray(arr)) {
                const [removed] = arr.splice(fromIndex, 1);
                arr.splice(toIndex, 0, removed);
            }
            return next;
        });
    }, []);

    const resetCV = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setCv(defaultCVData);
    }, []);

    const importCV = useCallback((data) => {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            setCv({ ...defaultCVData, ...parsed });
        } catch (e) {
            console.error('Import failed:', e);
        }
    }, []);

    const exportCV = useCallback(() => {
        return JSON.stringify(cv, null, 2);
    }, [cv]);

    return {
        cv,
        setCv,
        selectedTemplate,
        setSelectedTemplate,
        updateField,
        addItem,
        updateItem,
        removeItem,
        reorderItems,
        resetCV,
        importCV,
        exportCV,
    };
}

export default useCVData;
