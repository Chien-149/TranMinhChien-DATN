const Groq = require('groq-sdk');
const Job = require('../models/job.model');

class AIService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    // Gợi ý việc làm phù hợp với CV
    async recommendJobs(cvText) {
        // Lấy danh sách jobs đang tuyển
        const now = new Date();
        const jobs = await Job.find({
            status: 'active',
            deadline: { $gte: now },
        })
            .populate('companyId', 'companyName companyLogo')
            .populate('category', 'name')
            .select(
                'title location type salaryMin salaryMax experience category companyId description requirements skills',
            )
            .limit(100); // Giới hạn 100 jobs để không quá tải AI

        // Chuẩn bị danh sách jobs cho AI
        const jobList = jobs.map((job) => ({
            id: job._id.toString(),
            title: job.title,
            company: job.companyId?.companyName || 'N/A',
            location: job.location,
            type: job.type,
            salary: `${job.salaryMin || 0} - ${job.salaryMax || 0} triệu`,
            experience: job.experience,
            category: job.category?.name || 'Khác',
            description: job.description?.substring(0, 200) || '',
            requirements: job.requirements?.substring(0, 200) || '',
            skills: job.skills || [],
        }));

        const prompt = `
Bạn là AI chuyên gia tuyển dụng. Phân tích CV sau và so khớp với danh sách việc làm.

=== CV CỦA ỨNG VIÊN ===
${cvText}

=== DANH SÁCH VIỆC LÀM ===
${JSON.stringify(jobList, null, 2)}

=== YÊU CẦU ===
1. Phân tích kỹ năng, kinh nghiệm, vị trí mong muốn từ CV.
2. So khớp với danh sách việc làm.
3. Chọn 10 công việc PHÙ HỢP NHẤT.
4. Trả về JSON theo format sau (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):

{
  "candidateProfile": {
    "name": "Tên ứng viên",
    "skills": ["skill1", "skill2"],
    "experience": "Mô tả ngắn kinh nghiệm",
    "level": "Junior/Middle/Senior",
    "expectedPosition": "Vị trí mong muốn"
  },
  "recommendations": [
    {
      "jobId": "id của job",
      "matchScore": 85,
      "reason": "Lý do phù hợp ngắn gọn"
    }
  ]
}
`;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là AI chuyên gia tuyển dụng. Luôn trả về JSON hợp lệ, không có text thừa.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            const responseText = completion.choices[0]?.message?.content || '{}';
            const result = JSON.parse(responseText);

            // Enrich recommendations với thông tin job đầy đủ
            if (result.recommendations) {
                result.recommendations = result.recommendations.map((rec) => {
                    const job = jobs.find((j) => j._id.toString() === rec.jobId);
                    return {
                        ...rec,
                        job: job
                            ? {
                                  _id: job._id,
                                  title: job.title,
                                  company: job.companyId?.companyName,
                                  companyLogo: job.companyId?.companyLogo,
                                  location: job.location,
                                  type: job.type,
                                  salaryMin: job.salaryMin,
                                  salaryMax: job.salaryMax,
                                  experience: job.experience,
                                  category: job.category?.name,
                              }
                            : null,
                    };
                });
            }

            return result;
        } catch (error) {
            console.error('AI recommend jobs error:', error);
            throw new Error('Không thể phân tích CV. Vui lòng thử lại.');
        }
    }

    // Review CV và gợi ý cải thiện
    async reviewCV(cvText) {
        const prompt = `
Bạn là AI chuyên gia review CV. Phân tích CV sau và đưa ra đánh giá.

=== CV ===
${cvText}

=== YÊU CẦU ===
1. Chấm điểm CV từ 0-100.
2. Gợi ý tối đa 10 điểm cần cải thiện.
3. Tạo 1 đoạn "Profile Summary" (3-4 câu) để ứng viên đưa vào CV.

Trả về JSON (CHỈ TRẢ VỀ JSON):

{
  "score": 75,
  "summary": "Đoạn profile summary...",
  "improvements": ["Cải thiện 1", "Cải thiện 2"],
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"]
}
`;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là AI chuyên gia review CV. Luôn trả về JSON hợp lệ.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: 'json_object' },
            });

            const responseText = completion.choices[0]?.message?.content || '{}';
            return JSON.parse(responseText);
        } catch (error) {
            console.error('AI review CV error:', error);
            throw new Error('Không thể review CV. Vui lòng thử lại.');
        }
    }

    // Chatbot tư vấn nghề nghiệp
    async chat(message, conversationHistory = []) {
        const systemPrompt = `
Bạn là AI tư vấn nghề nghiệp chuyên nghiệp, giống TopCV AI.
Nhiệm vụ:
- Gợi ý việc phù hợp theo kỹ năng
- Định hướng nghề nghiệp
- Gợi ý học thêm kỹ năng mới
- Giải thích chức danh nghề nghiệp
- Tư vấn tăng lương, chuyển nghề

Trả lời ngắn gọn, dễ hiểu, thân thiện. Dùng tiếng Việt.
`;

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                { role: 'user', content: message },
            ];

            const completion = await this.groq.chat.completions.create({
                messages,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 1000,
            });

            return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
        } catch (error) {
            console.error('AI chat error:', error);
            throw new Error('Không thể kết nối AI. Vui lòng thử lại.');
        }
    }

    // Tạo Job Description
    async generateJD(jobInfo) {
        const { position, skills, salary, description } = jobInfo;

        const prompt = `
Tạo Job Description (JD) chuyên nghiệp với thông tin sau:

- Vị trí: ${position}
- Kỹ năng yêu cầu: ${skills}
- Mức lương: ${salary}
- Mô tả thêm: ${description || 'Không có'}

Tạo JD đầy đủ gồm:
1. Mô tả công việc (5-7 bullet points)
2. Yêu cầu công việc (5-7 bullet points)
3. Quyền lợi (5-7 bullet points)

Trả về JSON:
{
  "jobDescription": ["Mô tả 1", "Mô tả 2"],
  "requirements": ["Yêu cầu 1", "Yêu cầu 2"],
  "benefits": ["Quyền lợi 1", "Quyền lợi 2"]
}
`;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là HR chuyên viết JD. Luôn trả về JSON hợp lệ.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                max_tokens: 1500,
                response_format: { type: 'json_object' },
            });

            const responseText = completion.choices[0]?.message?.content || '{}';
            return JSON.parse(responseText);
        } catch (error) {
            console.error('AI generate JD error:', error);
            throw new Error('Không thể tạo JD. Vui lòng thử lại.');
        }
    }
}

module.exports = new AIService();
