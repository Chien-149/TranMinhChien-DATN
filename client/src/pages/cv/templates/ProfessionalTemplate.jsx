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
} from 'lucide-react';

// Professional Template - Phong cách chuyên nghiệp, doanh nghiệp
export default function ProfessionalTemplate({ cv }) {
    return (
        <div className="w-full bg-white" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="bg-slate-900 text-white p-8">
                <div className="flex items-center gap-6">
                    <img
                        src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                        alt="avatar"
                        className="w-28 h-28 rounded-lg object-cover border-2 border-amber-400"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-wide">{cv.profile.fullName}</h1>
                        <p className="text-amber-400 text-lg font-medium mt-1">{cv.profile.role}</p>

                        <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-300">
                            {cv.profile.phone && (
                                <span className="flex items-center gap-2">
                                    <Phone size={14} className="text-amber-400" /> {cv.profile.phone}
                                </span>
                            )}
                            {cv.profile.email && (
                                <span className="flex items-center gap-2">
                                    <Mail size={14} className="text-amber-400" /> {cv.profile.email}
                                </span>
                            )}
                            {cv.profile.address && (
                                <span className="flex items-center gap-2">
                                    <MapPin size={14} className="text-amber-400" /> {cv.profile.address}
                                </span>
                            )}
                            {cv.profile.dob && (
                                <span className="flex items-center gap-2">
                                    <Calendar size={14} className="text-amber-400" /> {cv.profile.dob}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Objective */}
                {cv.objective && (
                    <div className="mb-8 p-4 bg-slate-50 border-l-4 border-amber-400">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                            Mục Tiêu Nghề Nghiệp
                        </h2>
                        <p className="text-gray-700">{cv.objective}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-8">
                        {/* Experience */}
                        {cv.experience?.length > 0 && (
                            <section>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-slate-900 mb-4">
                                    <Briefcase size={16} className="inline mr-2" />
                                    Kinh Nghiệm Làm Việc
                                </h2>
                                {cv.experience.map((exp) => (
                                    <div key={exp.id} className="mb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{exp.position}</h3>
                                                <p className="text-amber-600 font-medium">{exp.company}</p>
                                            </div>
                                            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded">
                                                {exp.start} - {exp.current ? 'Hiện tại' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-2">{exp.description}</p>
                                        {exp.achievements?.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {exp.achievements.map((ach, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-gray-600 flex items-center gap-2"
                                                    >
                                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                                        {ach}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Projects */}
                        {cv.projects?.length > 0 && (
                            <section>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-slate-900 mb-4">
                                    <FolderOpen size={16} className="inline mr-2" />
                                    Dự Án Nổi Bật
                                </h2>
                                <div className="space-y-4">
                                    {cv.projects.map((project) => (
                                        <div key={project.id} className="p-4 border border-gray-200 rounded">
                                            <h3 className="font-bold text-slate-900">{project.name}</h3>
                                            <p className="text-amber-600 text-sm">{project.role}</p>
                                            <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                                            {project.tech?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {project.tech.map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded"
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
                    <div className="space-y-6">
                        {/* Skills */}
                        {cv.skills?.length > 0 && (
                            <section className="p-4 bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                    <Code size={14} className="inline mr-2" />
                                    Kỹ Năng
                                </h2>
                                <div className="space-y-3">
                                    {cv.skills.map((skill) => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{skill.name}</span>
                                                <span className="text-amber-600">{skill.level}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded">
                                                <div
                                                    className="h-full bg-gradient-to-r from-slate-700 to-amber-500 rounded"
                                                    style={{ width: `${skill.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {cv.education?.length > 0 && (
                            <section className="p-4 bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                    <GraduationCap size={14} className="inline mr-2" />
                                    Học Vấn
                                </h2>
                                {cv.education.map((edu) => (
                                    <div key={edu.id} className="mb-3">
                                        <h3 className="font-semibold text-slate-900">{edu.school}</h3>
                                        <p className="text-sm text-amber-600">{edu.year}</p>
                                        <p className="text-sm text-gray-600">{edu.major}</p>
                                        {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Languages */}
                        {cv.languages?.length > 0 && (
                            <section className="p-4 bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                    <Globe size={14} className="inline mr-2" />
                                    Ngôn Ngữ
                                </h2>
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm mb-2">
                                        <span>{lang.name}</span>
                                        <span className="text-amber-600 font-medium">{lang.level}</span>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Certifications */}
                        {cv.certifications?.length > 0 && (
                            <section className="p-4 bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                    <Award size={14} className="inline mr-2" />
                                    Chứng Chỉ
                                </h2>
                                {cv.certifications.map((cert) => (
                                    <div key={cert.id} className="mb-2 flex items-start gap-2">
                                        <Award size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">{cert.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {cert.issuer} • {cert.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
