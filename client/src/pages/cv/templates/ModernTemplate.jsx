import React from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
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
} from 'lucide-react';

const SectionTitle = ({ icon: Icon, title, light = false }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${light ? 'bg-white/20' : 'bg-sky-100'}`}>
            <Icon size={16} className={light ? 'text-white' : 'text-sky-600'} />
        </div>
        <h3 className={`font-bold text-sm uppercase tracking-wide ${light ? 'text-white' : 'text-sky-700'}`}>
            {title}
        </h3>
    </div>
);

const SkillBar = ({ name, level }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs text-white/90 mb-1">
            <span>{name}</span>
            <span>{level}%</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${level}%` }} />
        </div>
    </div>
);

const InfoItem = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 text-white/90 text-xs mb-1.5">
        <Icon size={12} className="text-white/70 flex-shrink-0" />
        <span className="break-all">{text}</span>
    </div>
);

export default function ModernTemplate({ cv }) {
    return (
        <div className="w-full bg-white shadow-xl" style={{ minHeight: '297mm' }}>
            <div className="grid grid-cols-10">
                {/* Left Sidebar */}
                <div className="col-span-3 bg-gradient-to-b from-sky-600 to-sky-800 p-5 text-white">
                    {/* Avatar & Name */}
                    <div className="text-center mb-6">
                        <div className="relative inline-block">
                            <img
                                src={cv.profile?.avatar?.startsWith('http') || cv.profile?.avatar?.startsWith('data:') || cv.profile?.avatar?.startsWith('blob:') ? cv.profile.avatar : `${import.meta.env.VITE_API_URL}/${cv.profile?.avatar?.replace(/^\//, '')}`}
                                alt="avatar"
                                className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                        <h1 className="text-xl font-bold mt-3 leading-tight">{cv.profile.fullName}</h1>
                        <p className="text-sky-200 text-sm font-medium mt-1">{cv.profile.role}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-5">
                        <SectionTitle icon={User} title="Liên Hệ" light />
                        <div className="space-y-1">
                            <InfoItem icon={Calendar} text={cv.profile.dob} />
                            <InfoItem icon={Phone} text={cv.profile.phone} />
                            <InfoItem icon={Mail} text={cv.profile.email} />
                            <InfoItem icon={MapPin} text={cv.profile.address} />
                            {cv.profile.linkedin && <InfoItem icon={Linkedin} text={cv.profile.linkedin} />}
                            {cv.profile.github && <InfoItem icon={Github} text={cv.profile.github} />}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="mb-5">
                        <SectionTitle icon={GraduationCap} title="Học Vấn" light />
                        {cv.education?.map((edu) => (
                            <div key={edu.id} className="mb-3">
                                <p className="font-semibold text-sm">{edu.school}</p>
                                <p className="text-xs text-sky-200">{edu.year}</p>
                                <p className="text-xs text-white/80">{edu.major}</p>
                                {edu.gpa && <p className="text-xs text-sky-200">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Skills */}
                    <div className="mb-5">
                        <SectionTitle icon={Code} title="Kỹ Năng" light />
                        <div className="space-y-2">
                            {cv.skills?.map((skill) => (
                                <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    {cv.languages?.length > 0 && (
                        <div className="mb-5">
                            <SectionTitle icon={Globe} title="Ngôn Ngữ" light />
                            <div className="space-y-1">
                                {cv.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-xs">
                                        <span>{lang.name}</span>
                                        <span className="text-sky-200">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hobbies */}
                    {cv.hobbies && (
                        <div>
                            <SectionTitle icon={Heart} title="Sở Thích" light />
                            <p className="text-xs text-white/80">{cv.hobbies}</p>
                        </div>
                    )}
                </div>

                {/* Right Content */}
                <div className="col-span-7 p-6">
                    {/* Objective */}
                    {cv.objective && (
                        <div className="mb-6">
                            <SectionTitle icon={Target} title="Mục Tiêu Nghề Nghiệp" />
                            <div className="bg-gradient-to-r from-sky-50 to-transparent p-4 rounded-lg border-l-4 border-sky-500">
                                <p className="text-gray-700 text-sm leading-relaxed">{cv.objective}</p>
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {cv.experience?.length > 0 && (
                        <div className="mb-6">
                            <SectionTitle icon={Briefcase} title="Kinh Nghiệm Làm Việc" />
                            <div className="space-y-4">
                                {cv.experience.map((exp, index) => (
                                    <div key={exp.id} className="relative pl-4 border-l-2 border-sky-200">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 bg-sky-500 rounded-full" />
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{exp.position}</h4>
                                                <p className="text-sky-600 text-sm font-medium">{exp.company}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {exp.start} - {exp.current ? 'Hiện tại' : exp.end}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{exp.description}</p>
                                        {exp.achievements?.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {exp.achievements.map((ach, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-xs text-gray-600 flex items-start gap-2"
                                                    >
                                                        <span className="text-sky-500 mt-0.5">•</span>
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
                        <div className="mb-6">
                            <SectionTitle icon={FolderOpen} title="Dự Án" />
                            <div className="grid gap-3">
                                {cv.projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-sky-200 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{project.name}</h4>
                                                <p className="text-sky-600 text-xs">{project.role}</p>
                                            </div>
                                            {(project.link || project.demo) && (
                                                <div className="flex gap-2">
                                                    {project.link && (
                                                        <a
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-sky-600"
                                                        >
                                                            <Github size={14} />
                                                        </a>
                                                    )}
                                                    {project.demo && (
                                                        <a
                                                            href={project.demo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-sky-600"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                                        {project.tech?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.tech.map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {cv.certifications?.length > 0 && (
                        <div className="mb-6">
                            <SectionTitle icon={Award} title="Chứng Chỉ" />
                            <div className="grid grid-cols-2 gap-2">
                                {cv.certifications.map((cert) => (
                                    <div key={cert.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                                        <Award size={16} className="text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{cert.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {cert.issuer} • {cert.date}
                                            </p>
                                        </div>
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
