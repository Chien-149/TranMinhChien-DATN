import React from 'react';
import { Mail, Phone, MapPin, Calendar, Link as LinkIcon, Globe } from 'lucide-react';

// Common icon classes for the preview (smaller visual weight)
const iconClass = "w-3 h-3 text-slate-400 shrink-0";

export default function CVPreview({ cv, template = 'modern' }) {
    if (!cv) return null;

    const profile = cv.profile || {};
    const education = cv.education || [];
    const experience = cv.experience || [];
    const skills = cv.skills || [];
    const projects = cv.projects || [];
    const certs = cv.certifications || [];
    const languages = cv.languages || [];

    const ModernTemplate = () => (
        <div className="grid grid-cols-[30%_70%] min-h-[297mm] bg-white h-full w-full">
            {/* Sidebar */}
            <div className="bg-gradient-to-b from-sky-500 to-sky-700 text-white p-6">
                {profile.avatar && (
                    <img src={profile.avatar} alt="Avatar" className="w-[100px] h-[100px] rounded-full border-4 border-white/30 object-cover mx-auto block mb-4" />
                )}
                <h1 className="text-xl font-bold text-center leading-tight">{profile.fullName}</h1>
                <p className="text-sm text-center opacity-90 font-medium leading-relaxed mt-1 mb-6">{profile.role}</p>

                {/* Contact */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-wider border-b-2 border-white/30 pb-1 mb-3">Liên Hệ</h2>
                    <div className="space-y-2 text-xs opacity-90">
                        {profile.dob && <p className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {profile.dob}</p>}
                        {profile.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> {profile.phone}</p>}
                        {profile.email && <p className="flex items-center gap-2 max-w-full break-all"><Mail className="w-3 h-3 shrink-0"/> {profile.email}</p>}
                        {profile.address && <p className="flex items-start gap-2 max-w-full"><MapPin className="w-3 h-3 shrink-0 mt-0.5"/> <span>{profile.address}</span></p>}
                        {profile.linkedin && <p className="flex items-center gap-2 max-w-full truncate"><LinkIcon className="w-3 h-3 shrink-0"/> {profile.linkedin}</p>}
                    </div>
                </div>

                {/* Education */}
                {education.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[10px] font-bold uppercase tracking-wider border-b-2 border-white/30 pb-1 mb-3">Học Vấn</h2>
                        <div className="space-y-3">
                            {education.map((edu, idx) => (
                                <div key={idx} className="leading-snug">
                                    <p className="font-bold text-xs">{edu.school}</p>
                                    <p className="text-[9px] opacity-80 mt-0.5">{edu.year}</p>
                                    <p className="text-[10px] opacity-90 mt-0.5">{edu.major}</p>
                                    {edu.gpa && <p className="text-[10px] opacity-90 mt-0.5">GPA: {edu.gpa}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[10px] font-bold uppercase tracking-wider border-b-2 border-white/30 pb-1 mb-3">Kỹ Năng</h2>
                        <div className="space-y-2">
                            {skills.map((skill, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span>{skill.name}</span>
                                        <span>{skill.level || 0}%</span>
                                    </div>
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{ width: `${skill.level || 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[10px] font-bold uppercase tracking-wider border-b-2 border-white/30 pb-1 mb-3">Ngôn Ngữ</h2>
                        <div className="space-y-1.5">
                            {languages.map((lang, idx) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                    <span>{lang.name}</span>
                                    <span className="opacity-80">{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hobbies */}
                {cv.hobbies && (
                    <div className="mb-6">
                        <h2 className="text-[10px] font-bold uppercase tracking-wider border-b-2 border-white/30 pb-1 mb-3">Sở Thích</h2>
                        <p className="text-[10px] opacity-90 leading-relaxed whitespace-pre-line">{cv.hobbies}</p>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="bg-white p-7 text-slate-800">
                {/* Objective */}
                {cv.objective && (
                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">Mục Tiêu Nghề Nghiệp</h2>
                        <div className="bg-gradient-to-r from-sky-50 to-transparent p-3 border-l-[3px] border-sky-500 rounded-r-md text-xs leading-relaxed whitespace-pre-line text-slate-700">
                            {cv.objective}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">Kinh Nghiệm Làm Việc</h2>
                        <div className="space-y-4">
                            {experience.map((exp, idx) => (
                                <div key={idx} className="pl-3 border-l-2 border-sky-100 relative">
                                    <div className="absolute w-2 h-2 bg-sky-500 rounded-full -left-[5px] top-1 ring-4 ring-white" />
                                    <div className="flex justify-between items-baseline flex-wrap gap-x-4 gap-y-1">
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900">{exp.position}</h3>
                                            <p className="text-xs font-semibold text-sky-700 mt-0.5">{exp.company}</p>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                            {exp.start} — {exp.current ? 'Hiện tại' : exp.end}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </div>
                                    {exp.achievements?.length > 0 && (
                                        <ul className="mt-2 pl-4 list-disc text-[11px] text-slate-600 space-y-1">
                                            {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">Dự Án Nổi Bật</h2>
                        <div className="space-y-3">
                            {projects.map((proj, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-sm text-slate-900">{proj.name}</h3>
                                        <span className="text-[10px] font-semibold text-sky-700">{proj.role}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 leading-relaxed mb-2 whitespace-pre-line">
                                        {proj.description}
                                    </div>
                                    {proj.tech?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {proj.tech.map((t, i) => (
                                                <span key={i} className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[9px] font-medium">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        {proj.link && <a href={proj.link} className="flex items-center gap-1 text-[10px] text-sky-600 hover:underline"><LinkIcon size={10}/> Source</a>}
                                        {proj.demo && <a href={proj.demo} className="flex items-center gap-1 text-[10px] text-sky-600 hover:underline"><Globe size={10}/> Demo</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {certs.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">Chứng Chỉ</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {certs.map((cert, idx) => (
                                <div key={idx} className="bg-amber-50 p-2.5 rounded-md border border-amber-100">
                                    <h3 className="font-bold text-[11px] text-slate-800">{cert.name}</h3>
                                    <p className="text-[10px] text-amber-800 mt-0.5">{cert.issuer} &bull; {cert.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const ClassicTemplate = () => (
        <div className="bg-white text-slate-800 min-h-[297mm] h-full w-full p-10">
            {/* Header */}
            <div className="text-center border-b-2 border-blue-800 pb-5 mb-6">
                <h1 className="text-3xl font-bold text-blue-900 uppercase tracking-wide">{profile.fullName}</h1>
                <p className="text-sm text-blue-600 mt-1 font-medium">{profile.role}</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 text-[11px] text-slate-500">
                    {profile.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-blue-800"/> {profile.phone}</span>}
                    {profile.email && <span className="flex items-center gap-1"><Mail size={11} className="text-blue-800"/> {profile.email}</span>}
                    {profile.address && <span className="flex items-center gap-1"><MapPin size={11} className="text-blue-800"/> {profile.address}</span>}
                </div>
            </div>

            <div className="grid grid-cols-[35%_65%] gap-8">
                {/* Left Column */}
                <div>
                    {/* Education */}
                    {education.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Học Vấn</h2>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-bold text-xs text-slate-800">{edu.school}</h3>
                                        <p className="text-[10px] font-semibold text-blue-600 mt-0.5">{edu.year}</p>
                                        <p className="text-[11px] text-slate-600 mt-0.5">{edu.major}</p>
                                        {edu.gpa && <p className="text-[10px] text-slate-500 mt-0.5">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Kỹ Năng</h2>
                            <div className="space-y-3">
                                {skills.map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-700">
                                            <span>{skill.name}</span>
                                            <span>{skill.level || 0}%</span>
                                        </div>
                                        <div className="h-1 bg-slate-200 rounded-full">
                                            <div className="h-full bg-blue-800 rounded-full" style={{ width: `${skill.level || 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {languages.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Ngôn Ngữ</h2>
                            <div className="space-y-2">
                                {languages.map((lang, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px]">
                                        <span className="font-medium text-slate-700">{lang.name}</span>
                                        <span className="text-slate-500">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div>
                    {/* Objective */}
                    {cv.objective && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Mục Tiêu Nghề Nghiệp</h2>
                            <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line text-justify">{cv.objective}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Kinh Nghiệm</h2>
                            <div className="space-y-5">
                                {experience.map((exp, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div>
                                                <h3 className="font-bold text-[13px] text-slate-900">{exp.position}</h3>
                                                <p className="text-[11px] font-semibold text-blue-700">{exp.company}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic shrink-0 ml-4">
                                                {exp.start} — {exp.current ? 'Hiện tại' : exp.end}
                                            </p>
                                        </div>
                                        <div className="mt-1 pb-1 text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">
                                            {exp.description}
                                        </div>
                                        {exp.achievements?.length > 0 && (
                                            <ul className="list-disc pl-4 text-[11px] leading-relaxed text-slate-700 space-y-1">
                                                {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-[12px] font-bold uppercase text-blue-900 border-b border-blue-900 pb-1 mb-3">Dự Án</h2>
                            <div className="space-y-4">
                                {projects.map((proj, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-[12px] text-slate-900">{proj.name}</h3>
                                            <span className="text-[11px] font-medium text-blue-700">{proj.role}</span>
                                        </div>
                                        <div className="mt-1 text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{proj.description}</div>
                                        {proj.tech?.length > 0 && (
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                <span className="font-medium mr-1">Công nghệ:</span> 
                                                {proj.tech.join(', ')}
                                            </div>
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

    const MinimalTemplate = () => (
        <div className="bg-white text-slate-800 min-h-[297mm] h-full w-full p-12">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-light text-slate-900 tracking-tight">{profile.fullName}</h1>
                <p className="text-sm text-slate-500 mt-2 tracking-wide uppercase">{profile.role}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[11px] text-slate-500">
                    {profile.phone && <span className="flex items-center gap-1.5"><Phone size={12}/> {profile.phone}</span>}
                    {profile.email && <span className="flex items-center gap-1.5"><Mail size={12}/> {profile.email}</span>}
                    {profile.address && <span className="flex items-center gap-1.5"><MapPin size={12}/> {profile.address}</span>}
                    {profile.linkedin && <span className="flex items-center gap-1.5"><LinkIcon size={12}/> {profile.linkedin}</span>}
                </div>
            </div>

            <hr className="border-slate-200 my-8" />

            {/* Objective */}
            {cv.objective && (
                <div className="mb-8">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Giới Thiệu</h2>
                    <p className="text-[12px] leading-loose text-slate-700">{cv.objective}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Kinh Nghiệm</h2>
                    <div className="space-y-6">
                        {experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-slate-900 text-[13px]">{exp.position}</h3>
                                    <span className="text-[10px] text-slate-400 tracking-wider">
                                        {exp.start} — {exp.current ? 'Hiện tại' : exp.end}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 mb-2 font-medium">{exp.company}</p>
                                <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Dự Án</h2>
                    <div className="space-y-5">
                        {projects.map((proj, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-slate-900 text-[12px]">{proj.name}</h3>
                                    {proj.link && <a href={proj.link} className="text-[10px] text-slate-400 hover:text-slate-700 underline underline-offset-2">Lấy Source</a>}
                                </div>
                                <p className="text-[10px] text-slate-500 my-1">{proj.role}</p>
                                <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line mb-3">{proj.description}</p>
                                {proj.tech?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {proj.tech.map((t, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100/50 text-slate-600 text-[9px] rounded-md border border-slate-200/60 leading-none">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-10">
                {/* Education */}
                {education.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Học Vấn</h2>
                        <div className="space-y-4">
                            {education.map((edu, idx) => (
                                <div key={idx}>
                                    <h3 className="font-semibold text-[11px] text-slate-900">{edu.school}</h3>
                                    <p className="text-[10px] text-slate-500 mt-1">{edu.major}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 tracking-wider">{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Kỹ Năng</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[10px] rounded-full font-medium">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (template === 'classic') return <ClassicTemplate />;
    if (template === 'minimal') return <MinimalTemplate />;
    return <ModernTemplate />;
}
