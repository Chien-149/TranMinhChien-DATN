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
    ChevronRight,
} from 'lucide-react';

// Bold Template - Phong cách mạnh mẽ, nổi bật
export default function BoldTemplate({ cv }) {
    return (
        <div className="w-full bg-zinc-900" style={{ minHeight: '297mm' }}>
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}
                />

                <div className="relative  flex items-end gap-8 p-8 pb-0 ">
                    <img
                        src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                        alt="avatar"
                        className="w-40 h-40 object-cover border-4 border-white shadow-2xl -mb-16"
                    />
                    <div className="pb-8 text-white">
                        <h1 className="text-4xl font-black uppercase tracking-tight">{cv.profile.fullName}</h1>
                        <p className="text-xl font-light mt-1 text-emerald-100">{cv.profile.role}</p>
                    </div>
                </div>
            </div>

            {/* Contact Bar */}
            <div className="bg-zinc-800 py-4 px-8 pl-56  flex flex-wrap gap-6 text-sm text-zinc-300">
                {cv.profile.phone && (
                    <span className="flex items-center gap-2">
                        <Phone size={14} className="text-emerald-400" /> {cv.profile.phone}
                    </span>
                )}
                {cv.profile.email && (
                    <span className="flex items-center gap-2">
                        <Mail size={14} className="text-emerald-400" /> {cv.profile.email}
                    </span>
                )}
                {cv.profile.address && (
                    <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-400" /> {cv.profile.address}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-8 pt-10">
                {/* Objective */}
                {cv.objective && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500">
                        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Mục Tiêu</h2>
                        <p className="text-zinc-300 leading-relaxed">{cv.objective}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-8">
                        {/* Experience */}
                        {cv.experience?.length > 0 && (
                            <section>
                                <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5 flex items-center gap-2">
                                    <Briefcase size={20} className="text-emerald-400" />
                                    Kinh Nghiệm
                                </h2>
                                {cv.experience.map((exp) => (
                                    <div key={exp.id} className="mb-6 p-4 bg-zinc-800/50 border-l-2 border-emerald-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{exp.position}</h3>
                                                <p className="text-emerald-400">{exp.company}</p>
                                            </div>
                                            <span className="text-xs text-zinc-500 bg-zinc-700 px-3 py-1">
                                                {exp.start} - {exp.current ? 'HIỆN TẠI' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 mt-3">{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Projects */}
                        {cv.projects?.length > 0 && (
                            <section>
                                <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5 flex items-center gap-2">
                                    <FolderOpen size={20} className="text-emerald-400" />
                                    Dự Án
                                </h2>
                                <div className="grid gap-4">
                                    {cv.projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="p-4 bg-zinc-800 hover:bg-zinc-700/50 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {project.name}
                                                    </h3>
                                                    <p className="text-sm text-emerald-400">{project.role}</p>
                                                </div>
                                                <ChevronRight
                                                    size={16}
                                                    className="text-zinc-600 group-hover:text-emerald-400 transition-colors"
                                                />
                                            </div>
                                            <p className="text-zinc-400 text-sm mt-2">{project.description}</p>
                                            {project.tech?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {project.tech.map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30"
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
                            <section className="p-4 bg-zinc-800">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Code size={14} className="text-emerald-400" />
                                    Kỹ Năng
                                </h2>
                                <div className="space-y-3">
                                    {cv.skills.map((skill) => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-zinc-300">{skill.name}</span>
                                                <span className="text-emerald-400 font-mono">{skill.level}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-700">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
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
                            <section className="p-4 bg-zinc-800">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <GraduationCap size={14} className="text-emerald-400" />
                                    Học Vấn
                                </h2>
                                {cv.education.map((edu) => (
                                    <div key={edu.id} className="mb-3 border-l-2 border-zinc-700 pl-3">
                                        <h3 className="font-semibold text-white">{edu.school}</h3>
                                        <p className="text-xs text-emerald-400">{edu.year}</p>
                                        <p className="text-sm text-zinc-400">{edu.major}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Languages */}
                        {cv.languages?.length > 0 && (
                            <section className="p-4 bg-zinc-800">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Globe size={14} className="text-emerald-400" />
                                    Ngôn Ngữ
                                </h2>
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-300">{lang.name}</span>
                                        <span className="text-emerald-400">{lang.level}</span>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Certifications */}
                        {cv.certifications?.length > 0 && (
                            <section className="p-4 bg-zinc-800">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Award size={14} className="text-emerald-400" />
                                    Chứng Chỉ
                                </h2>
                                {cv.certifications.map((cert) => (
                                    <div key={cert.id} className="mb-2 flex items-start gap-2">
                                        <Award size={14} className="text-yellow-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-white">{cert.name}</p>
                                            <p className="text-xs text-zinc-500">{cert.issuer}</p>
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
