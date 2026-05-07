import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

const Section = ({ title, children }) => (
    <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</h3>
        {children}
    </div>
);

export default function MinimalTemplate({ cv }) {
    return (
        <div className="w-full bg-white shadow-xl p-10" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-light text-gray-900 tracking-tight">{cv.profile.fullName}</h1>
                <p className="text-lg text-gray-500 mt-1">{cv.profile.role}</p>

                {/* Contact */}
                <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
                    <a href={`tel:${cv.profile.phone}`} className="flex items-center gap-2 hover:text-gray-900">
                        <Phone size={14} />
                        {cv.profile.phone}
                    </a>
                    <a href={`mailto:${cv.profile.email}`} className="flex items-center gap-2 hover:text-gray-900">
                        <Mail size={14} />
                        {cv.profile.email}
                    </a>
                    <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {cv.profile.address}
                    </span>
                    {cv.profile.linkedin && (
                        <a href={cv.profile.linkedin} className="flex items-center gap-2 hover:text-gray-900">
                            <Linkedin size={14} />
                            LinkedIn
                        </a>
                    )}
                    {cv.profile.github && (
                        <a href={cv.profile.github} className="flex items-center gap-2 hover:text-gray-900">
                            <Github size={14} />
                            GitHub
                        </a>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                {/* Summary */}
                {cv.objective && (
                    <Section title="Giới Thiệu">
                        <p className="text-gray-700 leading-relaxed">{cv.objective}</p>
                    </Section>
                )}

                {/* Experience */}
                {cv.experience?.length > 0 && (
                    <Section title="Kinh Nghiệm">
                        <div className="space-y-5">
                            {cv.experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                        <span className="text-sm text-gray-400">
                                            {exp.start} — {exp.current ? 'Hiện tại' : exp.end}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{exp.company}</p>
                                    <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                                    {exp.achievements?.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {exp.achievements.map((ach, i) => (
                                                <li
                                                    key={i}
                                                    className="text-sm text-gray-600 pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-gray-400"
                                                >
                                                    {ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Projects */}
                {cv.projects?.length > 0 && (
                    <Section title="Dự Án">
                        <div className="space-y-4">
                            {cv.projects.map((project) => (
                                <div key={project.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                            >
                                                <Globe size={12} />
                                                Link
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm">{project.role}</p>
                                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                                    {project.tech?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {project.tech.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Two Column Layout for smaller sections */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Education */}
                    <Section title="Học Vấn">
                        {cv.education?.map((edu) => (
                            <div key={edu.id} className="mb-3">
                                <h4 className="font-semibold text-gray-900 text-sm">{edu.school}</h4>
                                <p className="text-gray-500 text-sm">{edu.major}</p>
                                <p className="text-gray-400 text-xs">{edu.year}</p>
                            </div>
                        ))}
                    </Section>

                    {/* Skills */}
                    <Section title="Kỹ Năng">
                        <div className="flex flex-wrap gap-2">
                            {cv.skills?.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </Section>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Languages */}
                    {cv.languages?.length > 0 && (
                        <Section title="Ngôn Ngữ">
                            <div className="space-y-1">
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{lang.name}</span>
                                        <span className="text-gray-400">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Certifications */}
                    {cv.certifications?.length > 0 && (
                        <Section title="Chứng Chỉ">
                            {cv.certifications.map((cert) => (
                                <div key={cert.id} className="text-sm mb-2">
                                    <span className="text-gray-700">{cert.name}</span>
                                    <span className="text-gray-400 text-xs ml-2">
                                        {cert.issuer}, {cert.date}
                                    </span>
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
