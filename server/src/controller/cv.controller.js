const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');
const CVService = require('../services/cv.service');

class CVController {
    // Lấy tất cả CV của user
    async getAllCVs(req, res) {
        const { id } = req.user;
        const cvs = await CVService.getAllCVs(id);
        new OK({ message: 'success', metadata: cvs }).send(res);
    }

    // Lấy CV theo ID
    async getCVById(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const cv = await CVService.getCVById(cvId, id);
        new OK({ message: 'success', metadata: cv }).send(res);
    }

    // Tạo CV mới
    async createCV(req, res) {
        const { id } = req.user;
        const cv = await CVService.createCV(id, req.body);
        new Created({ message: 'Tạo CV thành công', metadata: cv }).send(res);
    }

    // Cập nhật CV
    async updateCV(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const cv = await CVService.updateCV(cvId, id, req.body);
        new OK({ message: 'Cập nhật CV thành công', metadata: cv }).send(res);
    }

    // Xóa CV
    async deleteCV(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const result = await CVService.deleteCV(cvId, id);
        new OK({ message: result.message }).send(res);
    }

    // Set CV làm mặc định
    async setDefaultCV(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const cv = await CVService.setDefaultCV(cvId, id);
        new OK({ message: 'Đã đặt làm CV mặc định', metadata: cv }).send(res);
    }

    // Clone CV
    async cloneCV(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const cv = await CVService.cloneCV(cvId, id);
        new Created({ message: 'Đã sao chép CV', metadata: cv }).send(res);
    }

    // Xuất PDF
    async exportPDF(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;
        const { template } = req.query;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        const pdfBuffer = await CVService.exportPDF(cvId, id, template);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cv-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }

    // Xuất PDF từ data trực tiếp (không cần lưu vào DB)
    async exportPDFDirect(req, res) {
        const { cv, template = 'modern' } = req.body;

        if (!cv) {
            throw new BadRequestError('Thiếu dữ liệu CV');
        }

        const CVService = require('../services/cv.service');
        const html = CVService.generateCVHTML(cv, template);

        const puppeteer = require('puppeteer');
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

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="cv-${
                    cv.profile?.fullName?.replace(/\s+/g, '-') || 'export'
                }-${Date.now()}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } finally {
            await browser.close();
        }
    }

    // Upload avatar cho CV
    async uploadAvatar(req, res) {
        const { id } = req.user;
        const { cvId } = req.params;

        if (!cvId) {
            throw new BadRequestError('Thiếu ID của CV');
        }

        if (!req.file) {
            throw new BadRequestError('Không có file được upload');
        }

        const { uploadSingle } = require('../config/cloudinaryUpload');
        const avatarUrl = await uploadSingle(req.file, 'cv-avatars');

        // Cập nhật avatar vào CV
        const cv = await CVService.updateCVAvatar(cvId, id, avatarUrl);

        new OK({
            message: 'Upload avatar thành công',
            metadata: {
                avatar: avatarUrl,
                cv,
            },
        }).send(res);
    }
}

module.exports = new CVController();
