import React, { useState, useEffect } from 'react';
import { Button, Card, Tag, Progress, Collapse, Spin, Empty, Tooltip, message, Badge } from 'antd';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Star,
    Briefcase,
    ChevronRight,
    MapPin,
    Building2,
    Target,
    Award,
    RefreshCw,
    Lightbulb,
    CheckCircle,
    AlertCircle,
    FileText,
    User,
    GraduationCap,
    Code,
    FolderOpen,
    Zap,
} from 'lucide-react';
import { requestRecommendJobs, requestReviewCV } from '../../../config/aiRequest';

/**
 * AI Assistant Panel - Phiên bản cải tiến
 * - Hiển thị nổi bật với góp ý theo từng phần
 */
export default function AIAssistantPanel({ cv }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(null);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Review CV state
    const [cvReview, setCvReview] = useState(null);

    // Job recommendations state
    const [recommendations, setRecommendations] = useState([]);
    const [candidateProfile, setCandidateProfile] = useState(null);

    // Convert CV object to text for AI analysis
    const cvToText = () => {
        let text = '';

        if (cv.profile) {
            text += `Họ tên: ${cv.profile.fullName || ''}\n`;
            text += `Vị trí: ${cv.profile.role || ''}\n`;
            text += `Email: ${cv.profile.email || ''}\n`;
            text += `Điện thoại: ${cv.profile.phone || ''}\n`;
            text += `Địa chỉ: ${cv.profile.address || ''}\n\n`;
        }

        if (cv.objective) {
            text += `Mục tiêu nghề nghiệp:\n${cv.objective}\n\n`;
        }

        if (cv.skills?.length > 0) {
            text += `Kỹ năng:\n`;
            cv.skills.forEach((s) => {
                text += `- ${s.name} (${s.level}%)\n`;
            });
            text += '\n';
        }

        if (cv.experience?.length > 0) {
            text += `Kinh nghiệm làm việc:\n`;
            cv.experience.forEach((exp) => {
                text += `- ${exp.position} tại ${exp.company} (${exp.start} - ${exp.current ? 'Hiện tại' : exp.end})\n`;
                text += `  ${exp.description}\n`;
            });
            text += '\n';
        }

        if (cv.education?.length > 0) {
            text += `Học vấn:\n`;
            cv.education.forEach((edu) => {
                text += `- ${edu.school}: ${edu.major} (${edu.year})\n`;
            });
            text += '\n';
        }

        if (cv.projects?.length > 0) {
            text += `Dự án:\n`;
            cv.projects.forEach((proj) => {
                text += `- ${proj.name}: ${proj.role}\n`;
                text += `  ${proj.description}\n`;
                if (proj.tech?.length) text += `  Tech: ${proj.tech.join(', ')}\n`;
            });
            text += '\n';
        }

        if (cv.certifications?.length > 0) {
            text += `Chứng chỉ:\n`;
            cv.certifications.forEach((cert) => {
                text += `- ${cert.name} (${cert.issuer})\n`;
            });
        }

        return text;
    };

    // Kiểm tra CV có đủ dữ liệu không
    const isCVValid = () => {
        return cv.profile?.fullName && (cv.skills?.length > 0 || cv.experience?.length > 0);
    };

    // Tính completeness của CV
    const getCompleteness = () => {
        let score = 0;
        let total = 7;

        if (cv.profile?.fullName) score++;
        if (cv.profile?.role) score++;
        if (cv.objective) score++;
        if (cv.skills?.length > 0) score++;
        if (cv.experience?.length > 0) score++;
        if (cv.education?.length > 0) score++;
        if (cv.projects?.length > 0) score++;

        return Math.round((score / total) * 100);
    };

    // AI Review CV
    const handleReviewCV = async () => {
        if (!isCVValid()) {
            message.warning('Vui lòng nhập ít nhất họ tên và kỹ năng/kinh nghiệm');
            return;
        }

        setLoading(true);
        setActiveTab('review');
        try {
            const cvText = cvToText();
            const res = await requestReviewCV(cvText);
            if (res.metadata) {
                setCvReview(res.metadata);
                setHasAnalyzed(true);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // AI Gợi ý việc làm
    const handleRecommendJobs = async () => {
        if (!isCVValid()) {
            message.warning('Vui lòng nhập ít nhất họ tên và kỹ năng/kinh nghiệm');
            return;
        }

        setLoading(true);
        setActiveTab('recommend');
        try {
            const cvText = cvToText();
            const res = await requestRecommendJobs(cvText);
            if (res.metadata) {
                setRecommendations(res.metadata.recommendations || []);
                setCandidateProfile(res.metadata.candidateProfile || null);
                setHasAnalyzed(true);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const completeness = getCompleteness();

    // Các section của CV và icon tương ứng
    const sectionIcons = {
        profile: <User size={14} />,
        objective: <Target size={14} />,
        skills: <Code size={14} />,
        experience: <Briefcase size={14} />,
        education: <GraduationCap size={14} />,
        projects: <FolderOpen size={14} />,
        certifications: <Award size={14} />,
    };

    // Góp ý theo từng section
    const getSectionSuggestions = () => {
        const suggestions = [];

        if (!cv.profile?.fullName) {
            suggestions.push({ section: 'profile', icon: sectionIcons.profile, text: 'Thêm họ tên đầy đủ' });
        }
        if (!cv.profile?.role) {
            suggestions.push({ section: 'profile', icon: sectionIcons.profile, text: 'Thêm vị trí ứng tuyển' });
        }
        if (!cv.profile?.phone && !cv.profile?.email) {
            suggestions.push({ section: 'profile', icon: sectionIcons.profile, text: 'Thêm thông tin liên hệ' });
        }
        if (!cv.objective || cv.objective.length < 50) {
            suggestions.push({
                section: 'objective',
                icon: sectionIcons.objective,
                text: 'Viết mục tiêu nghề nghiệp chi tiết hơn (ít nhất 50 ký tự)',
            });
        }
        if (!cv.skills?.length) {
            suggestions.push({ section: 'skills', icon: sectionIcons.skills, text: 'Thêm ít nhất 3-5 kỹ năng chính' });
        } else if (cv.skills.length < 3) {
            suggestions.push({
                section: 'skills',
                icon: sectionIcons.skills,
                text: 'Thêm nhiều kỹ năng hơn để CV hấp dẫn',
            });
        }
        if (!cv.experience?.length) {
            suggestions.push({
                section: 'experience',
                icon: sectionIcons.experience,
                text: 'Thêm kinh nghiệm làm việc hoặc thực tập',
            });
        }
        if (!cv.education?.length) {
            suggestions.push({ section: 'education', icon: sectionIcons.education, text: 'Thêm thông tin học vấn' });
        }
        if (!cv.projects?.length) {
            suggestions.push({
                section: 'projects',
                icon: sectionIcons.projects,
                text: 'Thêm dự án cá nhân hoặc công việc để nổi bật hơn',
            });
        }

        return suggestions;
    };

    const localSuggestions = getSectionSuggestions();

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-indigo-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">AI Assistant</h3>
                        <p className="text-xs text-gray-500">Phân tích và gợi ý thông minh</p>
                    </div>
                </div>
                {hasAnalyzed && (
                    <Button
                        size="small"
                        icon={<RefreshCw size={12} />}
                        onClick={activeTab === 'review' ? handleReviewCV : handleRecommendJobs}
                        loading={loading}
                    >
                        Phân tích lại
                    </Button>
                )}
            </div>

            {/* Completeness Bar */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Độ hoàn thiện CV</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(completeness) }}>
                        {completeness}%
                    </span>
                </div>
                <Progress
                    percent={completeness}
                    showInfo={false}
                    strokeColor={{
                        '0%': '#6366f1',
                        '100%': '#a855f7',
                    }}
                    trailColor="#e5e7eb"
                />
                {completeness < 100 && (
                    <p className="text-xs text-gray-400 mt-2">
                        {completeness < 50
                            ? '🚀 Thêm thông tin để CV hấp dẫn hơn!'
                            : completeness < 80
                              ? '👍 Khá tốt! Thêm vài mục nữa nhé.'
                              : '🎉 Gần hoàn thiện rồi!'}
                    </p>
                )}
            </div>

            {/* Quick Suggestions (local, không cần AI) */}
            {localSuggestions.length > 0 && !activeTab && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-3">
                        <AlertCircle size={16} />
                        Cần bổ sung ({localSuggestions.length})
                    </h4>
                    <ul className="space-y-2">
                        {localSuggestions.slice(0, 4).map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                <span className="mt-0.5 text-amber-500">{s.icon}</span>
                                {s.text}
                            </li>
                        ))}
                        {localSuggestions.length > 4 && (
                            <li className="text-xs text-amber-600">+ {localSuggestions.length - 4} mục khác</li>
                        )}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                    type={activeTab === 'review' ? 'primary' : 'default'}
                    size="large"
                    icon={<Star size={16} />}
                    onClick={handleReviewCV}
                    loading={loading && activeTab === 'review'}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl font-medium"
                    style={
                        activeTab === 'review'
                            ? { background: 'linear-gradient(to right, #6366f1, #a855f7)', border: 'none' }
                            : {}
                    }
                >
                    Review CV
                </Button>
                <Button
                    type={activeTab === 'recommend' ? 'primary' : 'default'}
                    size="large"
                    icon={<Briefcase size={16} />}
                    onClick={handleRecommendJobs}
                    loading={loading && activeTab === 'recommend'}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl font-medium"
                    style={
                        activeTab === 'recommend'
                            ? { background: 'linear-gradient(to right, #6366f1, #a855f7)', border: 'none' }
                            : {}
                    }
                >
                    Gợi ý việc làm
                </Button>
            </div>

            {/* Results */}
            <Spin spinning={loading}>
                {/* Review CV Result */}
                {activeTab === 'review' && cvReview && (
                    <div className="space-y-4">
                        {/* Score Card */}
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                            <Progress
                                type="circle"
                                percent={cvReview.score}
                                size={100}
                                strokeColor={getScoreColor(cvReview.score)}
                                format={(p) => (
                                    <div>
                                        <span className="text-2xl font-bold">{p}</span>
                                        <span className="text-gray-400">/100</span>
                                    </div>
                                )}
                            />
                            <p className="text-sm text-gray-600 mt-3 font-medium">
                                {cvReview.score >= 80
                                    ? '🎉 CV xuất sắc!'
                                    : cvReview.score >= 60
                                      ? '👍 CV khá tốt'
                                      : '📝 CV cần cải thiện'}
                            </p>
                        </div>

                        {/* Summary */}
                        {cvReview.summary && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-indigo-700 flex items-center gap-2 mb-2">
                                    <Lightbulb size={14} />
                                    Profile gợi ý cho bạn
                                </h4>
                                <p className="text-sm text-indigo-800 italic leading-relaxed">"{cvReview.summary}"</p>
                                <p className="text-xs text-indigo-500 mt-2">💡 Copy đoạn này vào mục tiêu CV</p>
                            </div>
                        )}

                        {/* Strengths */}
                        {cvReview.strengths?.length > 0 && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-3">
                                    <CheckCircle size={14} />
                                    Điểm mạnh ({cvReview.strengths.length})
                                </h4>
                                <ul className="space-y-2">
                                    {cvReview.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {cvReview.improvements?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-3">
                                    <AlertCircle size={14} />
                                    Cần cải thiện ({cvReview.improvements.length})
                                </h4>
                                <ul className="space-y-2">
                                    {cvReview.improvements.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                            <span className="text-amber-500 mt-0.5">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Job Recommendations Result */}
                {activeTab === 'recommend' && recommendations.length > 0 && (
                    <div className="space-y-3">
                        {candidateProfile && (
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-4">
                                <p className="font-semibold">
                                    {candidateProfile.expectedPosition || candidateProfile.name}
                                </p>
                                <p className="text-sm opacity-80">
                                    {candidateProfile.level} • {candidateProfile.experience}
                                </p>
                                {candidateProfile.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {candidateProfile.skills.slice(0, 5).map((skill, i) => (
                                            <Tag key={i} className="bg-white/20 text-white border-0 text-xs">
                                                {skill}
                                            </Tag>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-sm font-medium text-gray-700">
                            🎯 Top {recommendations.length} việc phù hợp nhất:
                        </p>

                        <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                            {recommendations.map((rec, index) => (
                                <Link
                                    to={`/detail/${rec.jobId}`}
                                    key={rec.jobId || index}
                                    target="_blank"
                                    className="block bg-white rounded-xl p-3 hover:shadow-md transition-all border border-gray-100 hover:border-indigo-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {rec.job?.companyLogo ? (
                                                <img
                                                    src={
                                                        rec.job.companyLogo.startsWith('http')
                                                            ? rec.job.companyLogo
                                                            : `${import.meta.env.VITE_API_URL}/uploads/logo/${
                                                                  rec.job.companyLogo
                                                              }`
                                                    }
                                                    alt=""
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1">
                                                    {rec.job?.title || 'N/A'}
                                                </h4>
                                                <Badge
                                                    count={`${rec.matchScore}%`}
                                                    style={{ backgroundColor: getScoreColor(rec.matchScore) }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">{rec.job?.company}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin size={10} />
                                                {rec.job?.location}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg mt-2">
                                        💡 {rec.reason}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'recommend' && !loading && recommendations.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                        <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có gợi ý</p>
                    </div>
                )}
            </Spin>
        </div>
    );
}
