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

// Simple Template - Phong cách đơn giản, dễ đọc
export default function SimpleTemplate({ cv }) {
    return (
        <div className="w-full bg-white p-8" style={{ minHeight: '297mm' }}>
            {/* Header - Simple and Clean */}
            <div className="flex items-start gap-6 pb-6 border-b-2 border-gray-800">
                <img
                    src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                    alt="avatar"
                    className="w-24 h-24 rounded object-cover"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{cv.profile.fullName}</h1>
                    <p className="text-lg text-gray-600 mt-1">{cv.profile.role}</p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-gray-600">
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
                        {cv.profile.dob && (
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> {cv.profile.dob}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Objective */}
            {cv.objective && (
                <div className="py-5 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900 mb-2">MỤC TIÊU NGHỀ NGHIỆP</h2>
                    <p className="text-gray-700 leading-relaxed">{cv.objective}</p>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-3 gap-6 pt-5">
                {/* Main Content */}
                <div className="col-span-2">
                    {/* Experience */}
                    {cv.experience?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">
                                KINH NGHIỆM LÀM VIỆC
                            </h2>
                            {cv.experience.map((exp) => (
                                <div key={exp.id} className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                            <p className="text-gray-600">{exp.company}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {exp.start} - {exp.current ? 'Hiện tại' : exp.end}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{exp.description}</p>
                                    {exp.achievements?.length > 0 && (
                                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                            {exp.achievements.map((ach, i) => (
                                                <li key={i}>{ach}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Projects */}
                    {cv.projects?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">DỰ ÁN</h2>
                            {cv.projects.map((project) => (
                                <div key={project.id} className="mb-4">
                                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                    <p className="text-gray-600 text-sm">{project.role}</p>
                                    <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                                    {project.tech?.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            <strong>Công nghệ:</strong> {project.tech.join(', ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Education */}
                    {cv.education?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">HỌC VẤN</h2>
                            {cv.education.map((edu) => (
                                <div key={edu.id} className="mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">{edu.school}</h3>
                                    <p className="text-sm text-gray-500">{edu.year}</p>
                                    <p className="text-sm text-gray-600">{edu.major}</p>
                                    {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Skills */}
                    {cv.skills?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">KỸ NĂNG</h2>
                            <div className="space-y-2">
                                {cv.skills.map((skill) => (
                                    <div key={skill.id} className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700 flex-1">{skill.name}</span>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded">
                                            <div
                                                className="h-full bg-gray-800 rounded"
                                                style={{ width: `${skill.level}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {cv.languages?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">NGÔN NGỮ</h2>
                            {cv.languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">{lang.name}</span>
                                    <span className="text-gray-500">{lang.level}</span>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Certifications */}
                    {cv.certifications?.length > 0 && (
                        <section className="mb-6">
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">CHỨNG CHỈ</h2>
                            {cv.certifications.map((cert) => (
                                <div key={cert.id} className="mb-2">
                                    <p className="text-sm font-medium text-gray-800">{cert.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {cert.issuer} • {cert.date}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Hobbies */}
                    {cv.hobbies && (
                        <section>
                            <h2 className="font-bold text-gray-900 pb-2 border-b border-gray-300 mb-3">SỞ THÍCH</h2>
                            <p className="text-sm text-gray-600">{cv.hobbies}</p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
