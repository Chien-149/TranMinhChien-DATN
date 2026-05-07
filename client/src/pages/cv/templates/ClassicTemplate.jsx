import React from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    FolderOpen,
    Award,
    Globe,
    Linkedin,
    Github,
} from 'lucide-react';

const SectionTitle = ({ title }) => (
    <div className="mb-3 border-b-2 border-blue-800 pb-1">
        <h3 className="font-bold text-blue-900 uppercase tracking-wide text-sm">{title}</h3>
    </div>
);

export default function ClassicTemplate({ cv }) {
    return (
        <div className="w-full bg-white shadow-xl p-8" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-blue-800 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-blue-900 tracking-wide">{cv.profile.fullName}</h1>
                <p className="text-blue-700 font-medium mt-1 text-lg">{cv.profile.role}</p>

                {/* Contact Row */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <Phone size={14} className="text-blue-800" />
                        {cv.profile.phone}
                    </span>
                    <span className="flex items-center gap-1">
                        <Mail size={14} className="text-blue-800" />
                        {cv.profile.email}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-blue-800" />
                        {cv.profile.address}
                    </span>
                    {cv.profile.linkedin && (
                        <span className="flex items-center gap-1">
                            <Linkedin size={14} className="text-blue-800" />
                            {cv.profile.linkedin}
                        </span>
                    )}
                    {cv.profile.github && (
                        <span className="flex items-center gap-1">
                            <Github size={14} className="text-blue-800" />
                            {cv.profile.github}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="col-span-1 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <SectionTitle title="Thông Tin" />
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-blue-800" />
                                <span className="text-gray-700">{cv.profile.dob}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-700">{cv.profile.gender}</span>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <SectionTitle title="Học Vấn" />
                        {cv.education?.map((edu) => (
                            <div key={edu.id} className="mb-3">
                                <p className="font-semibold text-gray-800 text-sm">{edu.school}</p>
                                <p className="text-xs text-blue-700">{edu.year}</p>
                                <p className="text-xs text-gray-600">{edu.major}</p>
                                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Skills */}
                    <div>
                        <SectionTitle title="Kỹ Năng" />
                        <div className="space-y-2">
                            {cv.skills?.map((skill) => (
                                <div key={skill.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700">{skill.name}</span>
                                        <span className="text-gray-500">{skill.level}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-blue-800 rounded"
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    {cv.languages?.length > 0 && (
                        <div>
                            <SectionTitle title="Ngôn Ngữ" />
                            <div className="space-y-1">
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{lang.name}</span>
                                        <span className="text-gray-500 text-xs">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {cv.certifications?.length > 0 && (
                        <div>
                            <SectionTitle title="Chứng Chỉ" />
                            <div className="space-y-2">
                                {cv.certifications.map((cert) => (
                                    <div key={cert.id} className="text-sm">
                                        <p className="font-medium text-gray-800">{cert.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {cert.issuer} - {cert.date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hobbies */}
                    {cv.hobbies && (
                        <div>
                            <SectionTitle title="Sở Thích" />
                            <p className="text-sm text-gray-600">{cv.hobbies}</p>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="col-span-2 space-y-5">
                    {/* Objective */}
                    {cv.objective && (
                        <div>
                            <SectionTitle title="Mục Tiêu Nghề Nghiệp" />
                            <p className="text-gray-700 text-sm leading-relaxed">{cv.objective}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {cv.experience?.length > 0 && (
                        <div>
                            <SectionTitle title="Kinh Nghiệm Làm Việc" />
                            <div className="space-y-4">
                                {cv.experience.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{exp.position}</h4>
                                                <p className="text-blue-700 text-sm">{exp.company}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 italic">
                                                {exp.start} - {exp.current ? 'Hiện tại' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{exp.description}</p>
                                        {exp.achievements?.length > 0 && (
                                            <ul className="mt-2 list-disc list-inside">
                                                {exp.achievements.map((ach, i) => (
                                                    <li key={i} className="text-sm text-gray-600">
                                                        {ach}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {cv.projects?.length > 0 && (
                        <div>
                            <SectionTitle title="Dự Án" />
                            <div className="space-y-4">
                                {cv.projects.map((project) => (
                                    <div key={project.id}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-800">{project.name}</h4>
                                            <span className="text-xs text-blue-700">{project.role}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                                        {project.tech?.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                <span className="font-medium">Công nghệ:</span>{' '}
                                                {project.tech.join(', ')}
                                            </p>
                                        )}
                                        {project.link && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                                    {project.link}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
