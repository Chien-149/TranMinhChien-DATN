import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Eye, ArrowUp, Zap } from 'lucide-react';
import {
    message,
    Modal,
    AutoComplete,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Tag,
    Button,
    Table,
    Space,
    Tooltip,
    Popconfirm,
    Form,
} from 'antd';
import dayjs from 'dayjs';
import { companyAPI } from '../../api/company.api';
import axiosInstance from '../../api/axios';

const { TextArea } = Input;

const EMPTY_FORM = {
    title: '',
    description: '',
    location: '',
    salaryMin: null,
    salaryMax: null,
    type: 'full-time',
    experience: '',
    deadline: null,
    requirements: '',
};

const JOB_TYPES = [
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'remote', label: 'Remote' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'contract', label: 'Hợp đồng' },
    { value: 'freelance', label: 'Freelance' },
];

export default function CompanyJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Boost Job State
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [boostJobTarget, setBoostJobTarget] = useState(null);
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [boosting, setBoosting] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = () => {
        setLoading(true);
        companyAPI
            .getMyJobs()
            .then((res) => setJobs(res.data?.data?.jobs || res.data?.metadata || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const fetchLocations = () => {
        if (locations.length > 0) return;
        setLoadingLocations(true);
        axiosInstance
            .get('/api/jobs/locations')
            .then((res) => setLocations(res.data?.data || []))
            .catch(console.error)
            .finally(() => setLoadingLocations(false));
    };

    const openCreate = () => {
        setEditId(null);
        form.setFieldsValue({ ...EMPTY_FORM, deadline: null });
        setShowModal(true);
        fetchLocations();
    };

    const openEdit = (job) => {
        setEditId(job._id);
        form.setFieldsValue({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            salaryMin: job.salaryMin || null,
            salaryMax: job.salaryMax || null,
            type: job.type || 'full-time',
            experience: job.experience || '',
            deadline: job.deadline ? dayjs(job.deadline) : null,
            requirements: job.requirements || '',
        });
        setShowModal(true);
        fetchLocations();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload = {
                ...values,
                salaryMin: Number(values.salaryMin) || 0,
                salaryMax: Number(values.salaryMax) || 0,
                deadline: values.deadline ? values.deadline.toISOString() : null,
            };
            if (editId) {
                await companyAPI.updateJob(editId, payload);
                message.success('Cập nhật tin thành công!');
            } else {
                await companyAPI.createJob(payload);
                message.success('Đăng tin thành công!');
            }
            setShowModal(false);
            fetchJobs();
        } catch (e) {
            if (e?.errorFields) return; // antd validation
            message.error('Lưu thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await companyAPI.deleteJob(id);
            message.success('Đã xóa tin tuyển dụng!');
            fetchJobs();
        } catch {
            message.error('Xóa thất bại!');
        }
    };

    const handleToggle = async (id) => {
        try {
            await companyAPI.toggleJobStatus(id);
            fetchJobs();
        } catch {
            message.error('Thất bại!');
        }
    };

    const openBoostModal = (job) => {
        setBoostJobTarget(job);
        setSelectedPackage(null);
        setShowBoostModal(true);
        companyAPI
            .getPackages()
            .then((res) => setPackages(res.data?.metadata || []))
            .catch(console.error);
    };

    const handleBoostJob = async () => {
        if (!selectedPackage) return message.warning('Vui lòng chọn gói đẩy top!');
        setBoosting(true);
        try {
            await companyAPI.boostJob({ jobId: boostJobTarget._id, packageId: selectedPackage._id });
            message.success(`Đã đẩy top tin "${boostJobTarget.title}"!`);
            setShowBoostModal(false);
            fetchJobs();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không đủ số dư hoặc lỗi hệ thống!');
        } finally {
            setBoosting(false);
        }
    };

    // Antd Table columns
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_, __, i) => <span className="text-slate-400 text-xs">{i + 1}</span>,
        },
        {
            title: 'Vị trí',
            dataIndex: 'title',
            key: 'title',
            render: (title, job) => (
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{title}</p>
                        {job.isBoosted && (
                            <Tag color="gold" icon={<Zap size={12} className="mr-1" />}>
                                Bổ sung
                            </Tag>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Eye size={10} /> {job.views || 0} lượt xem
                    </p>
                    {job.isBoosted && job.boostExpiry && (
                        <p className="text-[10px] text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-1.5 py-0.5 rounded">
                            Lên top đến: {dayjs(job.boostExpiry).format('DD/MM/YYYY HH:mm')}
                        </p>
                    )}
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const found = JOB_TYPES.find((t) => t.value === type);
                return <Tag color="blue">{found?.label || type || '—'}</Tag>;
            },
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            key: 'location',
            render: (loc) => <span className="text-slate-500 text-xs">{loc || '—'}</span>,
        },
        {
            title: 'Mức lương',
            key: 'salary',
            render: (_, job) => {
                if (job.salaryNegotiable) return <Tag color="orange">Thỏa thuận</Tag>;
                if (job.salaryMin && job.salaryMax) {
                    return (
                        <span className="text-slate-600 text-xs whitespace-nowrap">
                            {Number(job.salaryMin).toLocaleString('vi-VN')} –{' '}
                            {Number(job.salaryMax).toLocaleString('vi-VN')} đ
                        </span>
                    );
                }
                return <span className="text-slate-400">—</span>;
            },
        },
        {
            title: 'Hạn nộp',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (d) => <span className="text-slate-500 text-xs">{d ? dayjs(d).format('DD/MM/YYYY') : '—'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'active') return <Tag color="success">Hiển thị</Tag>;
                if (status === 'pending') return <Tag color="warning">Chờ duyệt</Tag>;
                return <Tag>Ẩn</Tag>;
            },
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            render: (_, job) => (
                <Space size="small">
                    {!job.isBoosted && job.status === 'active' && (
                        <Tooltip title="Đẩy Top">
                            <Button
                                type="text"
                                icon={<ArrowUp size={16} className="text-amber-500" />}
                                onClick={() => openBoostModal(job)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title={job.status === 'active' ? 'Ẩn tin' : 'Hiện tin'}>
                        <Button
                            type="text"
                            icon={
                                job.status === 'active' ? (
                                    <ToggleRight size={18} className="text-emerald-500" />
                                ) : (
                                    <ToggleLeft size={18} className="text-slate-400" />
                                )
                            }
                            onClick={() => handleToggle(job._id)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<Pencil size={14} className="text-indigo-500" />}
                            onClick={() => openEdit(job)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa tin tuyển dụng"
                        description={`Xóa "${job.title}"? Không thể hoàn tác.`}
                        onConfirm={() => handleDelete(job._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" icon={<Trash2 size={14} className="text-red-400" />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý tin tuyển dụng</h1>
                    <p className="text-slate-500 mt-1 text-sm">{jobs.length} tin đã đăng</p>
                </div>
                <Button type="primary" icon={<Plus size={15} />} onClick={openCreate} size="large">
                    Đăng tin mới
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={jobs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `${total} tin` }}
                    locale={{ emptyText: 'Chưa có tin tuyển dụng nào' }}
                />
            </div>

            {/* Create / Edit Modal */}
            <Modal
                title={
                    <span className="font-bold text-slate-800 text-base">
                        {editId ? '✏️ Chỉnh sửa tin tuyển dụng' : '📝 Đăng tin tuyển dụng mới'}
                    </span>
                }
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                centered
                width={700}
                styles={{ body: { maxHeight: '78vh', overflowY: 'auto', paddingTop: 8 } }}
                destroyOnClose
            >
                <Form form={form} layout="vertical" requiredMark={false}>
                    {/* Title */}
                    <Form.Item
                        name="title"
                        label={
                            <span className="font-semibold text-slate-700">
                                Tiêu đề <span className="text-red-500">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="VD: Lập trình viên React Senior..." size="large" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Job type */}
                        <Form.Item
                            name="type"
                            label={<span className="font-semibold text-slate-700">Loại công việc</span>}
                        >
                            <Select size="large" options={JOB_TYPES} />
                        </Form.Item>

                        {/* Location */}
                        <Form.Item
                            name="location"
                            label={<span className="font-semibold text-slate-700">Địa điểm</span>}
                        >
                            <AutoComplete
                                size="large"
                                placeholder="Nhập hoặc chọn địa điểm..."
                                loading={loadingLocations}
                                filterOption={(input, option) =>
                                    (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={locations.map((l) => ({ value: l }))}
                            >
                                <Input size="large" />
                            </AutoComplete>
                        </Form.Item>
                    </div>

                    {/* Salary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="salaryMin"
                            label={<span className="font-semibold text-slate-700">Lương tối thiểu (VNĐ)</span>}
                        >
                            <InputNumber
                                className="w-full"
                                style={{ width: '100%' }}
                                size="large"
                                min={0}
                                step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(v) => v.replace(/,/g, '')}
                                placeholder="5,000,000"
                            />
                        </Form.Item>
                        <Form.Item
                            name="salaryMax"
                            label={<span className="font-semibold text-slate-700">Lương tối đa (VNĐ)</span>}
                        >
                            <InputNumber
                                className="w-full"
                                size="large"
                                style={{ width: '100%' }}
                                min={0}
                                step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(v) => v.replace(/,/g, '')}
                                placeholder="15,000,000"
                            />
                        </Form.Item>
                    </div>

                    {/* Experience & Deadline */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="experience"
                            label={<span className="font-semibold text-slate-700">Kinh nghiệm</span>}
                        >
                            <Input size="large" placeholder="VD: 1-2 năm" />
                        </Form.Item>
                        <Form.Item
                            name="deadline"
                            label={<span className="font-semibold text-slate-700">Hạn nộp hồ sơ</span>}
                        >
                            <DatePicker
                                className="w-full"
                                size="large"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày..."
                                disabledDate={(d) => d && d < dayjs().startOf('day')}
                            />
                        </Form.Item>
                    </div>

                    {/* Description */}
                    <Form.Item
                        name="description"
                        label={<span className="font-semibold text-slate-700">Mô tả công việc</span>}
                    >
                        <TextArea rows={4} placeholder="Mô tả chi tiết về công việc, trách nhiệm..." size="large" />
                    </Form.Item>

                    {/* Requirements */}
                    <Form.Item
                        name="requirements"
                        label={<span className="font-semibold text-slate-700">Yêu cầu ứng viên</span>}
                    >
                        <TextArea rows={3} placeholder="Yêu cầu về kỹ năng, bằng cấp, kinh nghiệm..." size="large" />
                    </Form.Item>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button className="flex-1" size="large" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button className="flex-1" type="primary" size="large" loading={saving} onClick={handleSave}>
                            {editId ? 'Cập nhật' : 'Đăng tin'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Boost Modal */}
            <Modal
                title={
                    <span className="font-bold text-amber-600 flex items-center gap-2">
                        <Zap size={20} /> Đẩy tin lên Top
                    </span>
                }
                open={showBoostModal}
                onCancel={() => setShowBoostModal(false)}
                footer={null}
                centered
                width={500}
            >
                <div className="mb-4 text-slate-600 text-sm">
                    Chọn gói để đẩy tin{' '}
                    <strong className="text-slate-800 font-semibold">"{boostJobTarget?.title}"</strong> lên vị trí ưu
                    tiên.
                </div>

                <div className="space-y-3 mb-6">
                    {packages.map((pkg) => (
                        <button
                            key={pkg._id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                selectedPackage?._id === pkg._id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-slate-200 bg-white hover:border-amber-200'
                            }`}
                        >
                            <div>
                                <p className="font-bold text-slate-800 text-base">{pkg.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{pkg.description}</p>
                                <Tag color="blue" className="mt-2">
                                    Hiệu lực: {pkg.durationDays} ngày
                                </Tag>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-amber-600 text-lg">
                                    {Number(pkg.price).toLocaleString('vi-VN')} đ
                                </p>
                            </div>
                        </button>
                    ))}
                    {packages.length === 0 && (
                        <div className="text-center text-slate-500 py-6 text-sm">Chưa có gói đẩy top nào.</div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button size="large" className="flex-1 rounded-xl" onClick={() => setShowBoostModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 border-none"
                        loading={boosting}
                        onClick={handleBoostJob}
                        disabled={!selectedPackage}
                    >
                        Thanh toán & Đẩy ngay
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
