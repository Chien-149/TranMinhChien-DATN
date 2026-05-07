const CV = require('../models/cv.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CVService {
    // Lấy tất cả CV của user
    async getAllCVs(userId) {
        const cvs = await CV.find({ userId }).sort({ updatedAt: -1 });
        return cvs;
    }

    // Lấy CV theo ID
    async getCVById(cvId, userId) {
        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }
        return cv;
    }

    // Tạo CV mới
    async createCV(userId, data) {
        // Nếu đây là CV đầu tiên, set làm mặc định
        const existingCVs = await CV.countDocuments({ userId });

        const cv = await CV.create({
            userId,
            ...data,
            isDefault: existingCVs === 0,
        });

        return cv;
    }

    // Cập nhật CV
    async updateCV(cvId, userId, data) {
        const cv = await CV.findOneAndUpdate({ _id: cvId, userId }, { $set: data }, { new: true });

        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        return cv;
    }

    // Cập nhật avatar cho CV
    async updateCVAvatar(cvId, userId, avatarPath) {
        const cv = await CV.findOneAndUpdate(
            { _id: cvId, userId },
            { $set: { 'profile.avatar': `/uploads/avatars/${avatarPath}` } },
            { new: true },
        );

        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        return cv;
    }

    // Xóa CV
    async deleteCV(cvId, userId) {
        const cv = await CV.findOneAndDelete({ _id: cvId, userId });

        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        // Nếu xóa CV mặc định, set CV khác làm mặc định
        if (cv.isDefault) {
            const nextCV = await CV.findOne({ userId });
            if (nextCV) {
                nextCV.isDefault = true;
                await nextCV.save();
            }
        }

        return { message: 'Đã xóa CV thành công' };
    }

    // Set CV làm mặc định
    async setDefaultCV(cvId, userId) {
        // Bỏ mặc định của CV cũ
        await CV.updateMany({ userId }, { isDefault: false });

        // Set CV mới làm mặc định
        const cv = await CV.findOneAndUpdate({ _id: cvId, userId }, { isDefault: true }, { new: true });

        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        return cv;
    }

    // Clone CV
    async cloneCV(cvId, userId) {
        const originalCV = await CV.findOne({ _id: cvId, userId });

        if (!originalCV) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        const cvData = originalCV.toObject();
        delete cvData._id;
        delete cvData.createdAt;
        delete cvData.updatedAt;
        cvData.name = `${cvData.name} (Copy)`;
        cvData.isDefault = false;

        const newCV = await CV.create(cvData);
        return newCV;
    }

    // Xuất PDF
    async exportPDF(cvId, userId, template = 'modern') {
        const cv = await CV.findOne({ _id: cvId, userId });

        if (!cv) {
            throw new NotFoundError('Không tìm thấy CV');
        }

        // Convert avatar to base64 so Puppeteer can embed it without network requests
        let avatarBase64 = null;
        if (cv.profile?.avatar) {
            try {
                const avatarPath = path.join(__dirname, '../uploads', cv.profile.avatar);
                if (fs.existsSync(avatarPath)) {
                    const imgBuffer = fs.readFileSync(avatarPath);
                    const ext = path.extname(avatarPath).slice(1).toLowerCase() || 'jpeg';
                    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
                    avatarBase64 = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;
                }
            } catch (err) {
                console.error('Could not read avatar file:', err.message);
            }
        }

        const html = this.generateCVHTML(cv, template, avatarBase64);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' },
            });

            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }

    // Generate HTML cho CV (để xuất PDF)
    generateCVHTML(cv, template, avatarBase64 = null) {
        const styles = this.getTemplateStyles(template);

        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${cv.profile.fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.5; color: #333; }
        .cv-container { width: 210mm; min-height: 297mm; background: white; }
        ${styles}
    </style>
</head>
<body>
    <div class="cv-container">
        ${this.generateTemplateContent(cv, template, avatarBase64)}
    </div>
</body>
</html>`;
    }

    getTemplateStyles(template) {
        const templates = {
            modern: `
                .cv-grid { display: grid; grid-template-columns: 30% 70%; min-height: 297mm; }
                .sidebar { background: linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 24px; }
                .main { padding: 24px; }
                .avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); object-fit: cover; display: block; margin: 0 auto; }
                .name { font-size: 18px; font-weight: 700; text-align: center; margin-top: 12px; }
                .role { font-size: 12px; text-align: center; opacity: 0.9; margin-top: 4px; }
                .section-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid currentColor; }
                .sidebar .section-title { color: white; border-color: rgba(255,255,255,0.3); }
                .main .section-title { color: #0369a1; }
                .section { margin-top: 16px; }
                .info-item { display: flex; align-items: center; gap: 8px; font-size: 10px; margin-bottom: 6px; opacity: 0.9; }
                .skill-bar { height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin-top: 4px; }
                .skill-fill { height: 100%; background: white; border-radius: 2px; }
                .exp-item { margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #e0f2fe; }
                .exp-title { font-weight: 600; color: #1e293b; }
                .exp-company { color: #0369a1; font-size: 11px; }
                .exp-date { font-size: 9px; color: #64748b; }
                .project-card { background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 8px; }
                .tech-tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 10px; font-size: 9px; margin-right: 4px; margin-bottom: 4px; }
                .objective-box { background: linear-gradient(90deg, #f0f9ff 0%, transparent 100%); padding: 12px; border-left: 3px solid #0ea5e9; border-radius: 4px; }
            `,
            classic: `
                .cv-container { padding: 32px; }
                .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 16px; margin-bottom: 20px; }
                .name { font-size: 24px; font-weight: 700; color: #1e40af; }
                .role { font-size: 14px; color: #3b82f6; margin-top: 4px; }
                .contact-row { display: flex; justify-content: center; gap: 16px; margin-top: 12px; font-size: 10px; color: #64748b; }
                .cv-grid { display: grid; grid-template-columns: 35% 65%; gap: 24px; }
                .section-title { font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; border-bottom: 1px solid #1e40af; padding-bottom: 4px; margin-bottom: 10px; }
                .section { margin-bottom: 16px; }
                .skill-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 4px; }
                .skill-fill { height: 100%; background: #1e40af; border-radius: 2px; }
                .exp-item { margin-bottom: 12px; }
                .exp-title { font-weight: 600; }
                .exp-company { color: #3b82f6; }
                .exp-date { font-size: 9px; color: #64748b; font-style: italic; }
            `,
            minimal: `
                .cv-container { padding: 40px; }
                .header { margin-bottom: 24px; }
                .name { font-size: 28px; font-weight: 300; color: #1f2937; }
                .role { font-size: 14px; color: #6b7280; margin-top: 4px; }
                .contact-row { display: flex; gap: 20px; margin-top: 12px; font-size: 11px; color: #6b7280; }
                .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
                .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 12px; }
                .section { margin-bottom: 20px; }
                .exp-item { margin-bottom: 16px; }
                .exp-title { font-weight: 600; color: #111827; }
                .exp-company { color: #6b7280; font-size: 11px; }
                .exp-date { font-size: 10px; color: #9ca3af; }
                .skill-tag { display: inline-block; background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 10px; margin-right: 6px; margin-bottom: 6px; }
                .cv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
            `,
        };

        return templates[template] || templates.modern;
    }

    generateTemplateContent(cv, template, avatarBase64 = null) {
        if (template === 'modern') {
            return this.generateModernTemplate(cv, avatarBase64);
        } else if (template === 'classic') {
            return this.generateClassicTemplate(cv, avatarBase64);
        } else {
            return this.generateMinimalTemplate(cv, avatarBase64);
        }
    }

    generateModernTemplate(cv, avatarBase64 = null) {
        const avatarSrc = avatarBase64 || (cv.profile.avatar ? cv.profile.avatar : null);
        return `
        <div class="cv-grid">
            <div class="sidebar">
                ${avatarSrc ? `<img src="${avatarSrc}" class="avatar" />` : ''}
                <div class="name">${cv.profile.fullName || ''}</div>
                <div class="role">${cv.profile.role || ''}</div>
                
                <div class="section">
                    <div class="section-title">Liên Hệ</div>
                    ${cv.profile.dob ? `<div class="info-item">📅 ${cv.profile.dob}</div>` : ''}
                    ${cv.profile.phone ? `<div class="info-item">📞 ${cv.profile.phone}</div>` : ''}
                    ${cv.profile.email ? `<div class="info-item">📧 ${cv.profile.email}</div>` : ''}
                    ${cv.profile.address ? `<div class="info-item">📍 ${cv.profile.address}</div>` : ''}
                </div>
                
                ${
                    cv.education?.length
                        ? `
                <div class="section">
                    <div class="section-title">Học Vấn</div>
                    ${cv.education
                        .map(
                            (edu) => `
                        <div style="margin-bottom: 8px;">
                            <div style="font-weight: 600; font-size: 11px;">${edu.school || ''}</div>
                            <div style="font-size: 9px; opacity: 0.8;">${edu.year || ''}</div>
                            <div style="font-size: 10px; opacity: 0.9;">${edu.major || ''}</div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.skills?.length
                        ? `
                <div class="section">
                    <div class="section-title">Kỹ Năng</div>
                    ${cv.skills
                        .map(
                            (skill) => `
                        <div style="margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; font-size: 10px;">
                                <span>${skill.name || ''}</span>
                                <span>${skill.level || 0}%</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-fill" style="width: ${skill.level || 0}%"></div>
                            </div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.languages?.length
                        ? `
                <div class="section">
                    <div class="section-title">Ngôn Ngữ</div>
                    ${cv.languages
                        .map(
                            (lang) => `
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
                            <span>${lang.name || ''}</span>
                            <span style="opacity: 0.8;">${lang.level || ''}</span>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.hobbies
                        ? `
                <div class="section">
                    <div class="section-title">Sở Thích</div>
                    <div style="font-size: 10px; opacity: 0.9;">${cv.hobbies}</div>
                </div>
                `
                        : ''
                }
            </div>
            
            <div class="main">
                ${
                    cv.objective
                        ? `
                <div class="section" style="margin-top: 0;">
                    <div class="section-title">Mục Tiêu Nghề Nghiệp</div>
                    <div class="objective-box">${cv.objective}</div>
                </div>
                `
                        : ''
                }
                
                ${
                    cv.experience?.length
                        ? `
                <div class="section">
                    <div class="section-title">Kinh Nghiệm Làm Việc</div>
                    ${cv.experience
                        .map(
                            (exp) => `
                        <div class="exp-item">
                            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                <div>
                                    <div class="exp-title">${exp.position || ''}</div>
                                    <div class="exp-company">${exp.company || ''}</div>
                                </div>
                                <div class="exp-date">${exp.start || ''} - ${
                                    exp.current ? 'Hiện tại' : exp.end || ''
                                }</div>
                            </div>
                            <div style="margin-top: 6px; font-size: 10px; color: #475569;">${
                                exp.description || ''
                            }</div>
                            ${
                                exp.achievements?.length
                                    ? `
                                <ul style="margin-top: 4px; padding-left: 16px;">
                                    ${exp.achievements
                                        .map((ach) => `<li style="font-size: 9px; color: #64748b;">${ach}</li>`)
                                        .join('')}
                                </ul>
                            `
                                    : ''
                            }
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.projects?.length
                        ? `
                <div class="section">
                    <div class="section-title">Dự Án</div>
                    ${cv.projects
                        .map(
                            (project) => `
                        <div class="project-card">
                            <div style="font-weight: 600;">${project.name || ''}</div>
                            <div style="font-size: 10px; color: #0369a1;">${project.role || ''}</div>
                            <div style="margin-top: 6px; font-size: 10px; color: #475569;">${
                                project.description || ''
                            }</div>
                            ${
                                project.tech?.length
                                    ? `
                                <div style="margin-top: 6px;">
                                    ${project.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
                                </div>
                            `
                                    : ''
                            }
                            ${
                                project.link
                                    ? `<div style="margin-top: 4px; font-size: 9px; color: #0ea5e9;">${project.link}</div>`
                                    : ''
                            }
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.certifications?.length
                        ? `
                <div class="section">
                    <div class="section-title">Chứng Chỉ</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        ${cv.certifications
                            .map(
                                (cert) => `
                            <div style="background: #fef3c7; padding: 8px; border-radius: 4px;">
                                <div style="font-weight: 500; font-size: 10px;">${cert.name || ''}</div>
                                <div style="font-size: 9px; color: #92400e;">${cert.issuer || ''} • ${
                                    cert.date || ''
                                }</div>
                            </div>
                        `,
                            )
                            .join('')}
                    </div>
                </div>
                `
                        : ''
                }
            </div>
        </div>
        `;
    }

    generateClassicTemplate(cv) {
        return `
        <div class="header">
            <div class="name">${cv.profile.fullName || ''}</div>
            <div class="role">${cv.profile.role || ''}</div>
            <div class="contact-row">
                ${cv.profile.phone ? `<span>📞 ${cv.profile.phone}</span>` : ''}
                ${cv.profile.email ? `<span>📧 ${cv.profile.email}</span>` : ''}
                ${cv.profile.address ? `<span>📍 ${cv.profile.address}</span>` : ''}
            </div>
        </div>
        
        <div class="cv-grid">
            <div>
                ${
                    cv.education?.length
                        ? `
                <div class="section">
                    <div class="section-title">Học Vấn</div>
                    ${cv.education
                        .map(
                            (edu) => `
                        <div style="margin-bottom: 8px;">
                            <div style="font-weight: 600;">${edu.school || ''}</div>
                            <div style="font-size: 10px; color: #3b82f6;">${edu.year || ''}</div>
                            <div style="font-size: 10px;">${edu.major || ''}</div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.skills?.length
                        ? `
                <div class="section">
                    <div class="section-title">Kỹ Năng</div>
                    ${cv.skills
                        .map(
                            (skill) => `
                        <div style="margin-bottom: 6px;">
                            <div style="display: flex; justify-content: space-between; font-size: 10px;">
                                <span>${skill.name || ''}</span>
                                <span>${skill.level || 0}%</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-fill" style="width: ${skill.level || 0}%"></div>
                            </div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.languages?.length
                        ? `
                <div class="section">
                    <div class="section-title">Ngôn Ngữ</div>
                    ${cv.languages
                        .map(
                            (lang) => `
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
                            <span>${lang.name || ''}</span>
                            <span style="color: #64748b;">${lang.level || ''}</span>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
            </div>
            
            <div>
                ${
                    cv.objective
                        ? `
                <div class="section">
                    <div class="section-title">Mục Tiêu Nghề Nghiệp</div>
                    <div style="font-size: 11px; line-height: 1.6;">${cv.objective}</div>
                </div>
                `
                        : ''
                }
                
                ${
                    cv.experience?.length
                        ? `
                <div class="section">
                    <div class="section-title">Kinh Nghiệm</div>
                    ${cv.experience
                        .map(
                            (exp) => `
                        <div class="exp-item">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div class="exp-title">${exp.position || ''}</div>
                                    <div class="exp-company">${exp.company || ''}</div>
                                </div>
                                <div class="exp-date">${exp.start || ''} - ${
                                    exp.current ? 'Hiện tại' : exp.end || ''
                                }</div>
                            </div>
                            <div style="margin-top: 4px; font-size: 10px;">${exp.description || ''}</div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
                
                ${
                    cv.projects?.length
                        ? `
                <div class="section">
                    <div class="section-title">Dự Án</div>
                    ${cv.projects
                        .map(
                            (project) => `
                        <div style="margin-bottom: 10px;">
                            <div style="font-weight: 600;">${project.name || ''}</div>
                            <div style="font-size: 10px; color: #3b82f6;">${project.role || ''}</div>
                            <div style="font-size: 10px; margin-top: 4px;">${project.description || ''}</div>
                            ${
                                project.tech?.length
                                    ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px;">Công nghệ: ${project.tech.join(
                                          ', ',
                                      )}</div>`
                                    : ''
                            }
                        </div>
                    `,
                        )
                        .join('')}
                </div>
                `
                        : ''
                }
            </div>
        </div>
        `;
    }

    generateMinimalTemplate(cv) {
        return `
        <div class="header">
            <div class="name">${cv.profile.fullName || ''}</div>
            <div class="role">${cv.profile.role || ''}</div>
            <div class="contact-row">
                ${cv.profile.phone ? `<span>📞 ${cv.profile.phone}</span>` : ''}
                ${cv.profile.email ? `<span>📧 ${cv.profile.email}</span>` : ''}
                ${cv.profile.address ? `<span>📍 ${cv.profile.address}</span>` : ''}
            </div>
        </div>
        
        <div class="divider"></div>
        
        ${
            cv.objective
                ? `
        <div class="section">
            <div class="section-title">Giới Thiệu</div>
            <div style="font-size: 11px; line-height: 1.7;">${cv.objective}</div>
        </div>
        `
                : ''
        }
        
        ${
            cv.experience?.length
                ? `
        <div class="section">
            <div class="section-title">Kinh Nghiệm</div>
            ${cv.experience
                .map(
                    (exp) => `
                <div class="exp-item">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <div class="exp-title">${exp.position || ''}</div>
                        <div class="exp-date">${exp.start || ''} — ${exp.current ? 'Hiện tại' : exp.end || ''}</div>
                    </div>
                    <div class="exp-company">${exp.company || ''}</div>
                    <div style="margin-top: 6px; font-size: 11px; color: #4b5563;">${exp.description || ''}</div>
                </div>
            `,
                )
                .join('')}
        </div>
        `
                : ''
        }
        
        ${
            cv.projects?.length
                ? `
        <div class="section">
            <div class="section-title">Dự Án</div>
            ${cv.projects
                .map(
                    (project) => `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <div style="font-weight: 600;">${project.name || ''}</div>
                        ${
                            project.link
                                ? `<a href="${project.link}" style="font-size: 10px; color: #6b7280;">Link</a>`
                                : ''
                        }
                    </div>
                    <div style="font-size: 10px; color: #6b7280;">${project.role || ''}</div>
                    <div style="font-size: 11px; margin-top: 4px; color: #4b5563;">${project.description || ''}</div>
                    ${
                        project.tech?.length
                            ? `
                        <div style="margin-top: 6px;">
                            ${project.tech.map((t) => `<span class="skill-tag">${t}</span>`).join('')}
                        </div>
                    `
                            : ''
                    }
                </div>
            `,
                )
                .join('')}
        </div>
        `
                : ''
        }
        
        <div class="cv-grid">
            ${
                cv.education?.length
                    ? `
            <div class="section">
                <div class="section-title">Học Vấn</div>
                ${cv.education
                    .map(
                        (edu) => `
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; font-size: 11px;">${edu.school || ''}</div>
                        <div style="font-size: 10px; color: #6b7280;">${edu.major || ''}</div>
                        <div style="font-size: 9px; color: #9ca3af;">${edu.year || ''}</div>
                    </div>
                `,
                    )
                    .join('')}
            </div>
            `
                    : ''
            }
            
            ${
                cv.skills?.length
                    ? `
            <div class="section">
                <div class="section-title">Kỹ Năng</div>
                <div>
                    ${cv.skills.map((skill) => `<span class="skill-tag">${skill.name || ''}</span>`).join('')}
                </div>
            </div>
            `
                    : ''
            }
        </div>
        `;
    }
}

module.exports = new CVService();
