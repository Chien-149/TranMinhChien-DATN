import React from 'react';

/**
 * CVPreview
 * - hiển thị CV theo mẫu 2 cột bạn cung cấp
 * - hỗ trợ inline edit: các thẻ có contentEditable và onBlur sẽ gọi onInlineEdit(path, value)
 *
 * onInlineEdit nhận path (string hoặc array) giống handleChange ở App
 */

export default function CVPreview({ cv, onInlineEdit = () => {} }) {
    const editable = (path, text) => (
        <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onInlineEdit(path, e.target.innerText)}
            className="outline-none"
            role="textbox"
        >
            {text}
        </span>
    );

    return (
        <div className="w-full">
            <div className="grid grid-cols-3">
                {/* left column (sidebar look) */}
                <div className="col-span-1 bg-[#e6f4f9] p-6">
                    <div className="text-center">
                        {cv.profile?.avatar && (
                            <img
                                src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                                alt="avatar"
                                className="w-36 h-36 rounded-lg mx-auto object-cover border-4 border-[#11a0d1]"
                            />
                        )}
                        <h1 className="text-2xl font-bold mt-4 text-[#0b6fa4]">
                            {editable(['profile', 'fullName'], cv.profile?.fullName)}
                        </h1>
                        <p className="text-sm font-semibold text-[#0b6fa4]">
                            {editable(['profile', 'role'], cv.profile?.role)}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-md font-semibold text-[#0b6fa4]">Thông Tin Cá Nhân</h4>
                        <ul className="text-sm mt-2 space-y-1">
                            <li>📅 {editable(['profile', 'dob'], cv.profile?.dob)}</li>
                            <li>👤 {editable(['profile', 'gender'], cv.profile?.gender || '')}</li>
                            <li>📞 {editable(['profile', 'phone'], cv.profile?.phone)}</li>
                            <li>📧 {editable(['profile', 'email'], cv.profile?.email)}</li>
                            <li>📍 {editable(['profile', 'address'], cv.profile?.address)}</li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-md font-semibold text-[#0b6fa4]">Học Vấn</h4>
                        {Array.isArray(cv.education) && cv.education.length > 0 ? (
                            cv.education.map((edu, i) => (
                                <div key={i} className="mt-2">
                                    <p className="text-sm font-semibold">
                                        {editable(['education', i, 'school'], edu.school)}
                                    </p>
                                    <p className="text-xs">{editable(['education', i, 'year'], edu.year)}</p>
                                    <p className="text-sm mt-1">{editable(['education', i, 'major'], edu.major)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm mt-2 text-gray-400">Chưa có thông tin</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <h4 className="text-md font-semibold text-[#0b6fa4]">Kỹ Năng</h4>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                            {Array.isArray(cv.skills) &&
                                cv.skills.map((s, i) => (
                                    <div key={i} className="text-sm bg-white px-2 py-1 rounded">
                                        {editable(['skills', i, 'name'], typeof s === 'object' ? s.name : String(s))}
                                        {typeof s === 'object' && s.level !== undefined && (
                                            <div className="w-full bg-gray-200 rounded h-1 mt-1">
                                                <div
                                                    className="bg-[#0b6fa4] h-1 rounded"
                                                    style={{ width: `${s.level}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-md font-semibold text-[#0b6fa4]">Sở Thích</h4>
                        <p className="text-sm mt-2">{editable('hobbies', cv.hobbies)}</p>
                    </div>
                </div>

                {/* right column content */}
                <div className="col-span-2 p-6">
                    <div>
                        <h3 className="text-2xl font-bold text-[#0b6fa4]">Mục Tiêu Nghề Nghiệp</h3>
                        <p className="text-sm mt-2">{editable('objective', cv.objective)}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-2xl font-bold text-[#0b6fa4]">Project cá nhân</h3>

                        {Array.isArray(cv.projects) &&
                            cv.projects.map((pr, i) => (
                                <div key={pr._id || i} className="mt-4 border-b pb-3">
                                    <h4 className="font-semibold">{editable(['projects', i, 'name'], pr.name)}</h4>
                                    <p className="text-sm mt-1">
                                        <strong>Mô tả: </strong>
                                        {editable(['projects', i, 'description'], pr.description)}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <strong>Công nghệ: </strong>
                                        {Array.isArray(pr.tech) ? pr.tech.join(', ') : pr.tech}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <strong>Link: </strong>
                                        {editable(['projects', i, 'link'], pr.link)}
                                    </p>
                                </div>
                            ))}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-2xl font-bold text-[#0b6fa4]">Kinh nghiệm làm việc</h3>
                        <div className="mt-3">
                            {Array.isArray(cv.experience) &&
                                cv.experience.map((ex, i) => (
                                    <div key={ex._id || i} className="mb-3">
                                        <h4 className="font-semibold">
                                            {editable(['experience', i, 'position'], ex.position)} -{' '}
                                            {editable(['experience', i, 'company'], ex.company)}
                                        </h4>
                                        <p className="text-xs text-gray-600">
                                            {editable(['experience', i, 'start'], ex.start)} -{' '}
                                            {editable(['experience', i, 'end'], ex.end || 'Hiện tại')}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {editable(['experience', i, 'description'], ex.description)}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-600">
                        <hr />
                        <p className="mt-3">
                            Thông tin liên hệ: {cv.profile?.email} • {cv.profile?.phone}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
