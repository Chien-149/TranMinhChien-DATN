import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import CreativeTemplate from './CreativeTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import ElegantTemplate from './ElegantTemplate';
import BoldTemplate from './BoldTemplate';
import SimpleTemplate from './SimpleTemplate';

// Template registry - dễ dàng thêm template mới
export const templates = {
    modern: {
        id: 'modern',
        name: 'Mẫu CV 1',
        description: 'Thiết kế hiện đại với sidebar màu gradient',
        thumbnail: '/templates/modern.png',
        component: ModernTemplate,
        primaryColor: '#0ea5e9',
    },
    classic: {
        id: 'classic',
        name: 'Mẫu CV 2',
        description: 'Phong cách truyền thống, chuyên nghiệp',
        thumbnail: '/templates/classic.png',
        component: ClassicTemplate,
        primaryColor: '#1e40af',
    },
    minimal: {
        id: 'minimal',
        name: 'Mẫu CV 3',
        description: 'Đơn giản, tập trung vào nội dung',
        thumbnail: '/templates/minimal.png',
        component: MinimalTemplate,
        primaryColor: '#374151',
    },
    creative: {
        id: 'creative',
        name: 'Mẫu CV 4',
        description: 'Sáng tạo với gradient màu sắc nổi bật',
        thumbnail: '/templates/creative.png',
        component: CreativeTemplate,
        primaryColor: '#a855f7',
    },
    professional: {
        id: 'professional',
        name: 'Mẫu CV 5',
        description: 'Phong cách doanh nghiệp, nghiêm túc',
        thumbnail: '/templates/professional.png',
        component: ProfessionalTemplate,
        primaryColor: '#1e293b',
    },
    elegant: {
        id: 'elegant',
        name: 'Mẫu CV 6',
        description: 'Thanh lịch, sang trọng',
        thumbnail: '/templates/elegant.png',
        component: ElegantTemplate,
        primaryColor: '#f43f5e',
    },
    bold: {
        id: 'bold',
        name: 'Mẫu CV 7',
        description: 'Mạnh mẽ với dark theme',
        thumbnail: '/templates/bold.png',
        component: BoldTemplate,
        primaryColor: '#10b981',
    },
    simple: {
        id: 'simple',
        name: 'Mẫu CV 8',
        description: 'Tối giản, dễ đọc',
        thumbnail: '/templates/simple.png',
        component: SimpleTemplate,
        primaryColor: '#6b7280',
    },
};

export const getTemplate = (templateId) => {
    return templates[templateId] || templates.modern;
};

export const getTemplateList = () => {
    return Object.values(templates);
};

export default templates;
