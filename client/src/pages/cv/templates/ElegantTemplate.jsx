import React from 'react';
import {
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
    User,
    Linkedin,
    Github,
} from 'lucide-react';

// Elegant Template - Phong cách thanh lịch, sang trọng
export default function ElegantTemplate({ cv }) {
    return (
        <div className="w-full bg-white" style={{ minHeight: '297mm' }}>
            {/* Elegant Header */}
            <div className="text-center py-10 bg-gradient-to-b from-stone-100 to-white border-b border-stone-200">
                <img
                    src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-xl"
                />
                <h1 className="text-3xl font-light text-stone-800 mt-4 tracking-wide">{cv.profile.fullName}</h1>
                <p className="text-lg text-rose-600 font-medium mt-1">{cv.profile.role}</p>

                {/* Contact Info - Elegant Line */}
                <div className="flex justify-center items-center gap-2 mt-4 text-sm text-stone-500">
                    {cv.profile.email && <span>{cv.profile.email}</span>}
                    {cv.profile.email && cv.profile.phone && <span className="text-rose-300">•</span>}
                    {cv.profile.phone && <span>{cv.profile.phone}</span>}
                    {cv.profile.phone && cv.profile.address && <span className="text-rose-300">•</span>}
                    {cv.profile.address && <span>{cv.profile.address}</span>}
                </div>
            </div>

            <div className="px-12 py-8">
                {/* Objective */}
                {cv.objective && (
                    <div className="text-center mb-10">
                        <div className="inline-block">
                            <div className="flex items-center gap-2 justify-center mb-3">
                                <div className="w-12 h-px bg-rose-300" />
                                <h2 className="text-xs font-bold text-rose-600 uppercase tracking-[0.3em]">
                                    Giới Thiệu
                                </h2>
                                <div className="w-12 h-px bg-rose-300" />
                            </div>
                            <p className="text-gray-600 max-w-2xl italic">{cv.objective}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-5 gap-10">
                    {/* Main Content */}
                    <div className="col-span-3 space-y-8">
                        {/* Experience */}
                        {cv.experience?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-5">
                                    <Briefcase size={18} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Kinh Nghiệm Làm Việc
                                    </h2>
                                    <div className="flex-1 h-px bg-stone-200" />
                                </div>
                                {cv.experience.map((exp) => (
                                    <div
                                        key={exp.id}
                                        className="mb-6 relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-rose-400 before:rounded-full"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-stone-800">{exp.position}</h3>
                                                <p className="text-rose-600 text-sm">{exp.company}</p>
                                            </div>
                                            <span className="text-xs text-stone-400 italic">
                                                {exp.start} — {exp.current ? 'Hiện tại' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-stone-600 text-sm mt-2 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Projects */}
                        {cv.projects?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-5">
                                    <FolderOpen size={18} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Dự Án
                                    </h2>
                                    <div className="flex-1 h-px bg-stone-200" />
                                </div>
                                <div className="grid gap-4">
                                    {cv.projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="p-4 border border-stone-100 rounded-lg bg-stone-50/50"
                                        >
                                            <h3 className="font-semibold text-stone-800">{project.name}</h3>
                                            <p className="text-rose-600 text-sm">{project.role}</p>
                                            <p className="text-stone-600 text-sm mt-2">{project.description}</p>
                                            {project.tech?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {project.tech.map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-white border border-rose-200 text-rose-600 text-xs rounded-full"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-2 space-y-8">
                        {/* Education */}
                        {cv.education?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap size={16} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Học Vấn
                                    </h2>
                                </div>
                                {cv.education.map((edu) => (
                                    <div key={edu.id} className="mb-3">
                                        <h3 className="font-medium text-stone-800">{edu.school}</h3>
                                        <p className="text-xs text-rose-500">{edu.year}</p>
                                        <p className="text-sm text-stone-600">{edu.major}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Skills */}
                        {cv.skills?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Code size={16} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Kỹ Năng
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cv.skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="px-3 py-1.5 bg-gradient-to-r from-rose-50 to-stone-50 border border-rose-100 text-stone-700 text-sm rounded-full"
                                        >
                                            {skill.name}
                                            <span className="ml-1 text-rose-400 text-xs">({skill.level}%)</span>
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Languages */}
                        {cv.languages?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe size={16} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Ngôn Ngữ
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {cv.languages.map((lang) => (
                                        <div key={lang.id} className="flex items-center justify-between">
                                            <span className="text-stone-700">{lang.name}</span>
                                            <span className="text-sm text-rose-500 italic">{lang.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications */}
                        {cv.certifications?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Award size={16} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Chứng Chỉ
                                    </h2>
                                </div>
                                {cv.certifications.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="mb-2 p-2 bg-gradient-to-r from-amber-50 to-transparent rounded"
                                    >
                                        <p className="font-medium text-stone-800 text-sm">{cert.name}</p>
                                        <p className="text-xs text-stone-500">
                                            {cert.issuer} • {cert.date}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Hobbies */}
                        {cv.hobbies && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart size={16} className="text-rose-500" />
                                    <h2 className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em]">
                                        Sở Thích
                                    </h2>
                                </div>
                                <p className="text-sm text-stone-600 italic">{cv.hobbies}</p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
