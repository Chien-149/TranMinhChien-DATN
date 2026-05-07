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
    Linkedin,
    Github,
    ExternalLink,
    User,
} from 'lucide-react';

// Creative Template - Phong cách sáng tạo với layout không đối xứng
export default function CreativeTemplate({ cv }) {
    return (
        <div className="w-full bg-white" style={{ minHeight: '297mm' }}>
            {/* Header with diagonal design */}
            <div className="relative h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
                        }}
                    />
                </div>

                <div className="relative z-10 flex items-center gap-6 p-8">
                    <img
                        src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                        alt="avatar"
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                    />
                    <div className="text-white">
                        <h1 className="text-3xl font-bold">{cv.profile.fullName}</h1>
                        <p className="text-xl text-white/90 mt-1">{cv.profile.role}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            {cv.profile.email && (
                                <span className="flex items-center gap-1">
                                    <Mail size={14} /> {cv.profile.email}
                                </span>
                            )}
                            {cv.profile.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone size={14} /> {cv.profile.phone}
                                </span>
                            )}
                            {cv.profile.address && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {cv.profile.address}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Objective */}
                {cv.objective && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Target size={16} className="text-white" />
                            </div>
                            Mục Tiêu Nghề Nghiệp
                        </h2>
                        <p className="text-gray-600 leading-relaxed pl-10">{cv.objective}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <div className="col-span-2 space-y-6">
                        {/* Experience */}
                        {cv.experience?.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Briefcase size={16} className="text-white" />
                                    </div>
                                    Kinh Nghiệm
                                </h2>
                                {cv.experience.map((exp) => (
                                    <div
                                        key={exp.id}
                                        className="ml-10 mb-5 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border-l-4 border-purple-400"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{exp.position}</h3>
                                                <p className="text-purple-600">{exp.company}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {exp.start} - {exp.current ? 'Hiện tại' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {cv.projects?.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <FolderOpen size={16} className="text-white" />
                                    </div>
                                    Dự Án
                                </h2>
                                <div className="ml-10 grid gap-4">
                                    {cv.projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-200 transition-colors"
                                        >
                                            <h3 className="font-bold text-gray-800">{project.name}</h3>
                                            <p className="text-sm text-purple-600">{project.role}</p>
                                            <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                                            {project.tech?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {project.tech.map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 2 - Sidebar */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {cv.skills?.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Code size={16} className="text-purple-600" />
                                    Kỹ Năng
                                </h2>
                                <div className="space-y-2">
                                    {cv.skills.map((skill) => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700">{skill.name}</span>
                                                <span className="text-purple-600">{skill.level}%</span>
                                            </div>
                                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                    style={{ width: `${skill.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {cv.education?.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <GraduationCap size={16} className="text-blue-600" />
                                    Học Vấn
                                </h2>
                                {cv.education.map((edu) => (
                                    <div key={edu.id} className="mb-3">
                                        <h3 className="font-semibold text-gray-800 text-sm">{edu.school}</h3>
                                        <p className="text-blue-600 text-xs">{edu.year}</p>
                                        <p className="text-gray-600 text-xs">{edu.major}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Languages */}
                        {cv.languages?.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Globe size={16} className="text-green-600" />
                                    Ngôn Ngữ
                                </h2>
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm mb-1">
                                        <span>{lang.name}</span>
                                        <span className="text-green-600">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {cv.certifications?.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Award size={16} className="text-amber-600" />
                                    Chứng Chỉ
                                </h2>
                                {cv.certifications.map((cert) => (
                                    <div key={cert.id} className="mb-2">
                                        <p className="font-medium text-sm text-gray-800">{cert.name}</p>
                                        <p className="text-xs text-amber-600">
                                            {cert.issuer} • {cert.date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
