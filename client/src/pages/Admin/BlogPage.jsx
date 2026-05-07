import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, Image, Calendar, Eye } from 'lucide-react';
import { message, Modal } from 'antd';
import { Editor } from '@tinymce/tinymce-react';
import dayjs from 'dayjs';
import { adminAPI } from '../../api/admin.api';

const EMPTY_FORM = { title: '', content: '', image: '' };
const API_URL = import.meta.env.VITE_API_URL;

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const editorRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = () => {
        setLoading(true);
        adminAPI
            .getAllBlogs()
            .then((res) => setBlogs(res.data?.metadata || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const openCreate = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (blog) => {
        setEditId(blog._id);
        setForm({ title: blog.title, content: blog.content, image: blog.image });
        setShowModal(true);
    };

    const handleUploadImage = async (file) => {
        if (!file) return;
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await adminAPI.uploadBlogImage(fd);
            // Cloudinary returns full URL; legacy returns filename string
            const imageUrl = res.data?.metadata?.url || res.data?.metadata || '';
            setForm((prev) => ({ ...prev, image: imageUrl }));
            message.success('Upload ảnh thành công!');
        } catch {
            message.error('Upload ảnh thất bại!');
        } finally {
            setUploadingImg(false);
        }
    };

    const handleSave = async () => {
        const content = editorRef.current?.getContent() || form.content;
        if (!form.title.trim() || !content.trim() || !form.image) {
            message.error('Vui lòng nhập tiêu đề, nội dung và ảnh đại diện!');
            return;
        }
        setSaving(true);
        try {
            if (editId) {
                await adminAPI.updateBlog({ id: editId, title: form.title, content, image: form.image });
                message.success('Cập nhật bài viết thành công!');
            } else {
                await adminAPI.createBlog({ title: form.title, content, image: form.image });
                message.success('Tạo bài viết thành công!');
            }
            setShowModal(false);
            fetchBlogs();
        } catch {
            message.error('Lưu bài viết thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await adminAPI.deleteBlog(deleteTarget._id);
            message.success('Đã xóa bài viết!');
            setDeleteTarget(null);
            fetchBlogs();
        } catch {
            message.error('Xóa thất bại!');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản Lý Bài Viết</h1>
                    <p className="text-slate-500 mt-1 text-sm">{blogs.length} bài viết</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
                >
                    <Plus size={16} /> Viết bài mới
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                    <Image size={40} className="text-slate-300" />
                    <p className="font-medium">Chưa có bài viết nào</p>
                    <button
                        onClick={openCreate}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Viết bài đầu tiên
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-10">
                                    #
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-32">
                                    Ảnh
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                                    Tiêu đề
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-40">
                                    Ngày đăng
                                </th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-28">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {blogs.map((blog, i) => (
                                <motion.tr
                                    key={blog._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200/60">
                                            {blog.image ? (
                                                <img
                                                    src={
                                                        blog.image?.startsWith('http')
                                                            ? blog.image
                                                            : `${API_URL}/uploads/blogs/${blog.image}`
                                                    }
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image size={16} className="text-slate-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="font-semibold text-slate-800 line-clamp-2">{blog.title}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-sm">
                                        {dayjs(blog.createdAt).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(blog)}
                                                className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 bg-white shadow-sm"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(blog)}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 bg-white shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                title={
                    <span className="font-bold text-slate-800">{editId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</span>
                }
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                centered
                width={860}
                styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
            >
                <div className="mt-4 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                        />
                    </div>

                    {/* Cover image */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Ảnh đại diện <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="w-24 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors flex-shrink-0"
                            >
                                {form.image ? (
                                    <img
                                        src={
                                            form.image?.startsWith('http')
                                                ? form.image
                                                : `${API_URL}/uploads/blogs/${form.image}`
                                        }
                                        alt="cover"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Image size={20} className="text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleUploadImage(e.target.files[0])}
                                />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploadingImg}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    {uploadingImg ? 'Đang tải...' : form.image ? 'Đổi ảnh' : 'Chọn ảnh'}
                                </button>
                                {form.image && (
                                    <button
                                        onClick={() => setForm({ ...form, image: '' })}
                                        className="ml-2 text-slate-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TinyMCE Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <Editor
                            onInit={(_, editor) => (editorRef.current = editor)}
                            apiKey="deqky7pihf4j3mdxvg3l2lyvaauhua4ruaxtf1qwz3g473f6"
                            initialValue={form.content}
                            init={{
                                height: 380,
                                menubar: true,
                                skin: 'oxide',
                                content_css: 'default',
                                plugins: [
                                    'advlist',
                                    'autolink',
                                    'lists',
                                    'link',
                                    'image',
                                    'charmap',
                                    'anchor',
                                    'searchreplace',
                                    'visualblocks',
                                    'code',
                                    'fullscreen',
                                    'insertdatetime',
                                    'media',
                                    'table',
                                    'preview',
                                    'help',
                                    'wordcount',
                                ],
                                toolbar:
                                    'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | image media link | help',
                                content_style: 'body { font-family: Inter, sans-serif; font-size: 14px; }',
                                images_upload_handler: async (blobInfo) => {
                                    const fd = new FormData();
                                    fd.append('image', blobInfo.blob(), blobInfo.filename());
                                    const res = await adminAPI.uploadBlogImage(fd);
                                    const imageUrl = res.data?.metadata?.url || res.data?.metadata || '';
                                    return imageUrl;
                                },
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1 pb-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || uploadingImg}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={14} /> {editId ? 'Cập nhật' : 'Đăng bài'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Xác nhận xóa</span>}
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                footer={null}
                centered
                width={400}
            >
                {deleteTarget && (
                    <div className="mt-4">
                        <p className="text-sm text-slate-600">
                            Bạn chắc chắn muốn xóa bài viết <strong>"{deleteTarget.title}"</strong>? Hành động này không
                            thể hoàn tác.
                        </p>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
