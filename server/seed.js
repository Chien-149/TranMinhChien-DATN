require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/users.model');
const Company = require('./src/models/company.model');
const Job = require('./src/models/job.model');
const Industry = require('./src/models/industries.model');
const bcrypt = require('bcrypt');

const LOCATIONS = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Bà Rịa - Vũng Tàu'
];
const TYPES = ['full-time', 'part-time', 'internship', 'contract', 'freelance'];
const EXPERIENCE = ['Không yêu cầu', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '5 năm', 'Trên 5 năm'];

// Random helper functions
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randBoolean = () => Math.random() > 0.5;

async function seed() {
    try {
        await mongoose.connect(process.env.CONNECT_DB);
        console.log('Connected to MongoDB');

        // Fetch industries to use for companies and jobs
        const industries = await Industry.find({});
        if (industries.length === 0) {
            console.error('No industries found in DB. Please make sure industries exist first.');
            process.exit(1);
        }
        console.log(`Found ${industries.length} industries.`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('Generating 30 companies and their employers...');
        const companiesCount = 30;
        const jobsPerCompany = 30;

        for (let i = 1; i <= companiesCount; i++) {
            // Create Employer User
            const user = new User({
                fullName: `Employer Name ${i}`,
                email: `employer${i}_${Date.now()}@example.com`,
                password: hashedPassword,
                role: 'employer',
                address: randElem(LOCATIONS),
                phone: `09${randInt(10000000, 99999999)}`,
            });
            await user.save();

            // Create Company for the Employer
            const industry = randElem(industries);
            const sizeMap = ['1-10', '11-50', '51-200', '201-500', '500+'];
            const company = new Company({
                userId: user._id,
                companyName: `Global Tech Corp ${i}`,
                companyEmail: `contact@globaltech${i}.com`,
                companyPhone: user.phone,
                companyAddress: `${randInt(1, 100)} Street, ${randElem(LOCATIONS)}`,
                companyDescription: `Chúng tôi là công ty hàng đầu trong lĩnh vực với hơn 10 năm kinh nghiệm. Luôn tìm kiếm những tài năng trẻ.`,
                industry: industry._id,
                companySize: randElem(sizeMap),
                foundedYear: randInt(2000, 2023),
                isVerified: randBoolean(),
                status: 'approved', // Pre-approve for testing
            });
            await company.save();
            console.log(`Created Company ${i} (Industry: ${industry.name})`);

            // Generate Jobs for this company
            const jobsToInsert = [];
            for (let j = 1; j <= jobsPerCompany; j++) {
                const isNego = randBoolean();
                const sMin = isNego ? 0 : randInt(5, 15) * 1000000;
                const sMax = isNego ? 0 : sMin + randInt(5, 15) * 1000000;
                
                const jobInd = randElem(industries);
                
                // expiry deadline from 10 to 60 days ahead
                const deadline = new Date();
                deadline.setDate(deadline.getDate() + randInt(10, 60));

                jobsToInsert.push({
                    companyId: company._id,
                    title: `Tuyển ${jobInd.name} Specialist hoặc Manager (Vị trí ${j})`,
                    category: jobInd._id,
                    location: randElem(LOCATIONS),
                    type: randElem(TYPES),
                    salaryMin: sMin,
                    salaryMax: sMax,
                    salaryNegotiable: isNego,
                    experience: randElem(EXPERIENCE),
                    description: `Mô tả công việc chi tiết cho vị trí ${j}. Đảm bảo tiến độ dự án và quản lý quy trình hiệu quả.`,
                    requirements: `- Tốt nghiệp đại học chuyên ngành liên quan\n- Co kinh nghiệm từ 1 đến 3 năm\n- Kỹ năng giao tiếp tốt\n- Chịu được áp lực cao`,
                    benefits: `- Lương thưởng hấp dẫn tháng 13, 14\n- Bảo hiểm sức khỏe PVI\n- Môi trường năng động, trẻ trung`,
                    status: 'active', // Make active so it shows up on UI
                    deadline: deadline,
                    isBoosted: Math.random() > 0.8, // 20% chance to be boosted
                });
            }
            await Job.insertMany(jobsToInsert);
            console.log(`  -> Inserted ${jobsPerCompany} jobs for Company ${i}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed DB:', error);
        process.exit(1);
    }
}

seed();
