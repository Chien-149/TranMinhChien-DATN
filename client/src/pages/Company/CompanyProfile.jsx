import { useState, useEffect, useRef } from 'react';
import { Save, Camera, Building2, Globe, Mail, Phone, MapPin, Users, Calendar } from 'lucide-react';
import { message } from 'antd';
import { companyAPI } from '../../api/company.api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CompanyProfile() {
    const [company, setCompany] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const logoRef = useRef(null);

    useEffect(() => {
        companyAPI
            .getMyCompany()
            .then((res) => {
                const c = res.data?.data;
                setCompany(c);
                setForm({
                    companyName: c?.companyName || '',
                    companyEmail: c?.companyEmail || '',
                    companyPhone: c?.companyPhone || '',
                    companyAddress: c?.companyAddress || '',
                    companyWebsite: c?.companyWebsite || '',
                    companyDescription: c?.companyDescription || '',
                    companySize: c?.companySize || '',
                    foundedYear: c?.foundedYear || '',
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await companyAPI.updateCompany(form);
            message.success('Cập nhật thông tin công ty thành công!');
        } catch {
            message.error('Cập nhật thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const previewUrl = URL.createObjectURL(file);
            setCompany((prev) => ({ ...prev, companyLogo: previewUrl }));

            await companyAPI.uploadLogo(formData);
            message.success('Cập nhật logo thành công!');
        } catch {
            message.error('Upload logo thất bại!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const fields = [
        { key: 'companyName', label: 'Tên công ty', icon: Building2, required: true },
        { key: 'companyEmail', label: 'Email', icon: Mail },
        { key: 'companyPhone', label: 'Số điện thoại', icon: Phone },
        { key: 'companyAddress', label: 'Địa chỉ', icon: MapPin },
        { key: 'companyWebsite', label: 'Website', icon: Globe },
        { key: 'companySize', label: 'Quy mô', icon: Users, placeholder: 'VD: 10-50 nhân viên' },
        { key: 'foundedYear', label: 'Năm thành lập', icon: Calendar, type: 'number' },
    ];

    return (
        <div className="space-y-6 ">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Thông tin công ty</h1>
                <p className="text-slate-500 mt-1 text-sm">Cập nhật thông tin hiển thị với ứng viên</p>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-5">Logo công ty</h2>
                <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {company?.companyLogo ? (
                            <img
                                src={
                                    company.companyLogo.startsWith('data:') ||
                                    company.companyLogo.startsWith('http') ||
                                    company.companyLogo.startsWith('blob:')
                                        ? company.companyLogo
                                        : `${API_URL}/uploads/logo/${company.companyLogo}`
                                }
                                alt="logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Building2 size={28} className="text-slate-300" />
                        )}
                        <button
                            onClick={() => logoRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                            <Camera size={18} className="text-white" />
                        </button>
                    </div>
                    <input
                        ref={logoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                    />
                    <div>
                        <button
                            onClick={() => logoRef.current?.click()}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Thay đổi logo
                        </button>
                        <p className="text-xs text-slate-400 mt-1.5">PNG, JPG tối đa 2MB</p>
                    </div>
                </div>
            </div>

            {/* Info fields */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <h2 className="font-bold text-slate-800">Thông tin cơ bản</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {fields.map(({ key, label, icon: Icon, required, placeholder, type }) => (
                        <div
                            key={key}
                            className={key === 'companyName' || key === 'companyAddress' ? 'sm:col-span-2' : ''}
                        >
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={type || 'text'}
                                    value={form[key] || ''}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả công ty</label>
                    <textarea
                        rows={5}
                        value={form.companyDescription || ''}
                        onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                        placeholder="Mô tả về công ty, văn hoá, môi trường làm việc..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={15} />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}
