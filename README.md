# 🧠 Đồ Án Tìm Việc – Tài Liệu API & Thiết Kế UI

> Tài liệu này dành cho AI hoặc developer đọc để nắm toàn bộ backend API, cấu trúc dữ liệu và định hướng thiết kế UI.

---

## 📦 Tech Stack

### Frontend (Client)
| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| React | 18.3.1 | Core framework |
| Vite | ~7.x | Build tool & Dev Server |
| TailwindCSS | 4.x | Utility-first CSS |
| Ant Design (antd) | 5.x | UI Component Library |
| React Router Dom | 7.x | Routing |
| Framer Motion | 12.x | Animations |
| Lucide React | 0.5x | Icon library |
| Axios | 1.x | HTTP Client |
| Socket.io-client | 4.x | Real-time Chat & Notification |
| React Toastify | 11.x | Toast notifications |
| Recharts | 3.x | Charts/Dashboard |
| Dayjs / Moment | latest | Date formatting |
| react-quill | 2.x | Rich text editor (Job desc) |
| @tinymce/tinymce-react | 6.x | Rich text editor (CV online) |
| @react-oauth/google | 0.12 | Google OAuth login |
| js-cookie | 3.x | Cookie management (JWT) |

### Backend (Server)
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT Auth** (access token trong cookie `token`)
- **Socket.io** (Real-time)
- **Multer** (Upload file)
- **API Base URL**: `http://localhost:PORT/api`

---

## 🔐 Auth System

### User Roles
| Role | Mô tả |
|---|---|
| `user` | Người tìm việc (Candidate) |
| `employer` | Nhà tuyển dụng |
| `admin` | Quản trị viên |

### User Model
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string (hashed)",
  "phone": "string",
  "address": "string",
  "birthDay": "Date",
  "gender": "male | female | other",
  "avatar": "string (URL)",
  "role": "user | employer | admin",
  "balance": "number",
  "typeLogin": "email | google",
  "isOnline": "boolean"
}
```

---

## 📡 API Endpoints

### 1. `/api/users` – Quản lý Người dùng

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/register` | ❌ | Đăng ký |
| POST | `/login` | ❌ | Đăng nhập (email/password) |
| POST | `/login-google` | ❌ | Đăng nhập Google OAuth |
| POST | `/logout` | ✅ | Đăng xuất |
| GET | `/auth` | ✅ | Kiểm tra auth (lấy user hiện tại) |
| GET | `/refresh-token` | ❌ | Refresh access token |
| POST | `/forgot-password` | ❌ | Gửi OTP về email |
| POST | `/reset-password` | ❌ | Đặt lại mật khẩu |
| PUT | `/update` | ✅ | Cập nhật thông tin cá nhân |
| POST | `/upload-avatar` | ✅ | Upload avatar (multipart/form-data, field: `avatar`) |
| POST | `/chatbot` | ✅ | Gửi tin nhắn Chatbot AI |
| GET | `/message-chatbot` | ✅ | Lấy lịch sử chat Chatbot |
| GET | `/admin/users` | ✅ Admin | Lấy tất cả user |
| PUT | `/admin/users/:id` | ✅ Admin | Cập nhật user (khoá, đổi role...) |
| DELETE | `/admin/users/:id` | ✅ Admin | Xoá user |

---

### 2. `/api/cv` – Quản lý CV

**CV Model:**
```json
{
  "userId": "ObjectId",
  "title": "string",
  "template": "string",
  "isDefault": "boolean",
  "personalInfo": { "fullName", "email", "phone", "address", "summary", "avatar" },
  "experience": [{ "company", "position", "startDate", "endDate", "description" }],
  "education": [{ "school", "degree", "field", "startDate", "endDate" }],
  "skills": ["string"],
  "certifications": [{ "name", "issuer", "date" }],
  "languages": [{ "language", "level" }]
}
```

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ✅ | Lấy tất cả CV của user |
| GET | `/:cvId` | ✅ | Lấy chi tiết CV |
| POST | `/` | ✅ | Tạo CV mới (online) |
| PUT | `/:cvId` | ✅ | Cập nhật CV |
| DELETE | `/:cvId` | ✅ | Xoá CV |
| POST | `/:cvId/avatar` | ✅ | Upload ảnh avatar cho CV |
| POST | `/:cvId/clone` | ✅ | Nhân bản CV |
| PATCH | `/:cvId/default` | ✅ | Đặt làm CV mặc định |
| GET | `/:cvId/export-pdf` | ✅ | Export CV thành PDF |
| POST | `/export-pdf` | ❌ | Export PDF trực tiếp (guest) |

---

### 3. `/api/jobs` – Quản lý Tin tuyển dụng

**Job Model:**
```json
{
  "companyId": "ObjectId",
  "title": "string",
  "category": "ObjectId (industries)",
  "location": "string",
  "type": "full-time | part-time | internship | contract | freelance",
  "salaryMin": "number",
  "salaryMax": "number",
  "salaryNegotiable": "boolean",
  "experience": "string",
  "education": "string",
  "skills": ["string"],
  "description": "string (HTML)",
  "requirements": "string (HTML)",
  "benefits": "string (HTML)",
  "status": "pending | active | rejected",
  "deadline": "Date",
  "views": "number",
  "applicants": "number",
  "isBoosted": "boolean",
  "boostExpiry": "Date"
}
```

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/search` | ❌ | Tìm kiếm job (query: keyword, location, salaryMin, salaryMax, type, category, experience) |
| GET | `/list` | ❌ | Lấy tất cả job (public) |
| GET | `/detail/:id` | ❌ | Lấy chi tiết job |
| GET | `/locations` | ❌ | Lấy danh sách địa điểm |
| GET | `/dashboard-stats` | ❌ | Thống kê public (số job, số công ty...) |
| GET | `/admin` | ❌ | Danh sách job cho admin duyệt |
| PUT | `/update/:id` | ❌ | Admin duyệt/từ chối job |
| GET | `/` | ✅ Employer | Lấy job của công ty mình |
| POST | `/` | ✅ Employer | Đăng tin tuyển dụng |
| PUT | `/:id` | ✅ Employer | Chỉnh sửa tin |
| DELETE | `/:id` | ✅ Employer | Xoá tin |
| PATCH | `/:id/toggle-status` | ✅ Employer | Ẩn/Hiện tin |
| POST | `/:id/duplicate` | ✅ Employer | Nhân bản tin |
| POST | `/:id/boost` | ✅ Employer | Boost tin lên đầu |

---

### 4. `/api/applications` – Ứng tuyển

**Application Status Flow:** `pending → reviewing → interview → accepted | rejected`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/apply` | ✅ User | Nộp hồ sơ (multipart: `cvFile` optional, body: `jobId`, `coverLetter`) |
| GET | `/user` | ✅ User | Danh sách job user đã ứng tuyển |
| GET | `/list` | ✅ Employer | Danh sách ứng viên cho công ty |
| POST | `/accept` | ✅ Employer | Chuyển trạng thái → interview/accepted |
| POST | `/reject` | ✅ Employer | Từ chối ứng viên |

---

### 5. `/api/company` – Công ty

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/create` | ✅ Employer | Tạo công ty mới (multipart: `logo`) |
| GET | `/me` | ✅ Employer | Lấy thông tin công ty của mình |
| PUT | `/me` | ✅ Employer | Cập nhật thông tin công ty |
| PUT | `/me/logo` | ✅ Employer | Upload logo |
| PUT | `/me/cover` | ✅ Employer | Upload ảnh bìa |
| GET | `/dashboard` | ✅ Employer | Thống kê dashboard nhà tuyển dụng |
| GET | `/list` | ❌ | Danh sách tất cả công ty (public) |
| PUT | `/update/:id` | ❌ | Admin duyệt/từ chối công ty |
| GET | `/:id` | ❌ | Lấy thông tin công ty theo ID |

**Company Status:** `pending → approved | rejected`

---

### 6. `/api/favourite` – Lưu việc làm (Bookmark)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/create` | ✅ | Lưu / Bỏ lưu (toggle) job |
| GET | `/get-favourite-by-user-id` | ✅ | Lấy danh sách job đã lưu |
| GET | `/list/:jobId` | ❌ | Lấy số người đã lưu job |

---

### 7. `/api/conversation` & `/api/message` – Chat

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/conversation` | ✅ | Lấy danh sách cuộc trò chuyện |
| POST | `/api/conversation` | ✅ | Tạo cuộc trò chuyện mới |
| GET | `/api/message/:conversationId` | ✅ | Lấy tin nhắn trong cuộc trò chuyện |
| POST | `/api/message` | ✅ | Gửi tin nhắn |

**Socket.io Events:**
- `emitMessage` – Nhận tin nhắn mới real-time
- `emitNewConversation` – Cuộc trò chuyện mới
- `emitNotification` – Thông báo hệ thống

---

### 8. `/api/ai` – AI Features

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/recommend-jobs` | ❌ | AI gợi ý việc làm từ nội dung CV (`cvText`) |
| POST | `/review-cv` | ❌ | AI review & đánh giá CV (`cvText`) |
| POST | `/chat` | ❌/✅ | AI Chatbot tư vấn nghề nghiệp |
| GET | `/chat/history` | ✅ | Lịch sử chat AI |
| GET | `/chat/:chatId` | ✅ | Chi tiết 1 cuộc chat |
| POST | `/chat/new` | ✅ | Tạo chat mới với AI |
| DELETE | `/chat/:chatId` | ✅ | Xoá 1 cuộc chat |
| DELETE | `/chat` | ✅ | Xoá tất cả lịch sử chat |
| POST | `/generate-jd` | ✅ Employer | AI tạo Job Description |

---

### 9. `/api/industries` – Ngành nghề (Category)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ❌ | Lấy tất cả ngành nghề |
| POST | `/` | ✅ Admin | Tạo ngành nghề mới |
| PUT | `/:id` | ✅ Admin | Cập nhật ngành nghề |
| DELETE | `/:id` | ✅ Admin | Xoá ngành nghề |

---

### 10. `/api/admin` – Admin

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/stats` | ✅ Admin | Dashboard thống kê (tổng user, job, company, lượt apply) |

---

### 11. `/api/wallet` – Ví tiền (Employer)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ✅ Employer | Lấy thông tin ví |
| POST | `/deposit` | ✅ Employer | Nạp tiền vào ví |
| GET | `/transactions` | ✅ Employer | Lịch sử giao dịch |

---

### 12. `/api/packages` – Gói tin đăng

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ❌ | Danh sách các gói tin |
| POST | `/` | ✅ Admin | Tạo gói mới |
| PUT | `/:id` | ✅ Admin | Cập nhật gói |
| DELETE | `/:id` | ✅ Admin | Xoá gói |

---

### 13. `/api/blog` – Bài viết / Blog

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ❌ | Danh sách bài viết |
| GET | `/:id` | ❌ | Chi tiết bài viết |
| POST | `/` | ✅ Admin | Tạo bài viết mới |
| PUT | `/:id` | ✅ Admin | Cập nhật bài viết |
| DELETE | `/:id` | ✅ Admin | Xoá bài viết |

---

### 14. `/candidate` – Hồ sơ ứng viên

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/` | ✅ | Lấy hồ sơ ứng viên của user |
| POST | `/` | ✅ | Tạo hồ sơ ứng viên |
| PUT | `/` | ✅ | Cập nhật hồ sơ ứng viên |

---

## 🎨 Thiết kế UI – Design System

### Color Palette (Gợi ý)
```
Primary:   #4F46E5 (Indigo 600) - main brand
Secondary: #06B6D4 (Cyan 500)  - accent
Success:   #10B981 (Emerald 500)
Warning:   #F59E0B (Amber 500)
Error:     #EF4444 (Red 500)
Background: #0F172A (Slate 900) - dark mode
Surface:    #1E293B (Slate 800)
Text:       #F1F5F9 (Slate 100)
```

### Quy tắc Design
- **Dark mode** là mặc định với gradient tím-xanh
- Font chính: **Inter** (Google Fonts)
- Corner radius: `rounded-xl` (12px) cho card, `rounded-2xl` cho modal
- Shadow: `shadow-lg` với màu tím/xanh nhẹ
- Animation: dùng `framer-motion` cho page transition và hover effects
- Icon: dùng `lucide-react` (không dùng icon Ant Design)
- Thông báo: `react-toastify` cho toast, `Modal` của Ant Design cho confirm dialog

---

## 🗺️ Cấu trúc trang (Routes)

### Trang công khai (Guest)
| Path | Component | Mô tả |
|---|---|---|
| `/` | `HomePage` | Trang chủ |
| `/jobs` | `JobListPage` | Danh sách việc làm |
| `/jobs/:id` | `JobDetailPage` | Chi tiết việc làm |
| `/companies` | `CompanyListPage` | Danh sách công ty |
| `/companies/:id` | `CompanyDetailPage` | Chi tiết công ty |
| `/blog` | `BlogPage` | Bài viết tìm việc |
| `/blog/:id` | `BlogDetailPage` | Chi tiết bài viết |
| `/login` | `LoginPage` | Đăng nhập |
| `/register` | `RegisterPage` | Đăng ký |
| `/forgot-password` | `ForgotPasswordPage` | Quên mật khẩu |
| `/ai-assistant` | `AIAssistantPage` | AI Chatbot tư vấn |

### Trang Candidate (Role: user)
| Path | Component | Mô tả |
|---|---|---|
| `/profile` | `ProfilePage` | Hồ sơ cá nhân |
| `/my-cv` | `MyCVPage` | Quản lý CV |
| `/my-cv/create` | `CreateCVPage` | Tạo CV online |
| `/my-cv/:id` | `EditCVPage` | Chỉnh sửa CV |
| `/applications` | `MyApplicationsPage` | Việc làm đã ứng tuyển |
| `/saved-jobs` | `SavedJobsPage` | Việc làm đã lưu |
| `/messages` | `MessagesPage` | Tin nhắn chat |
| `/ai-cv-review` | `AICVReviewPage` | AI review CV |

### Trang Employer (Role: employer)
| Path | Component | Mô tả |
|---|---|---|
| `/employer/dashboard` | `EmployerDashboard` | Tổng quan |
| `/employer/company` | `CompanyProfilePage` | Hồ sơ công ty |
| `/employer/jobs` | `EmployerJobsPage` | Quản lý tin đăng |
| `/employer/jobs/create` | `CreateJobPage` | Đăng tin mới |
| `/employer/jobs/:id/edit` | `EditJobPage` | Chỉnh sửa tin |
| `/employer/applications` | `ApplicationsPage` | Quản lý ứng viên |
| `/employer/messages` | `MessagesPage` | Tin nhắn |
| `/employer/wallet` | `WalletPage` | Ví & giao dịch |

### Trang Admin (Role: admin)
| Path | Component | Mô tả |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | Thống kê hệ thống |
| `/admin/users` | `AdminUsersPage` | Quản lý user |
| `/admin/companies` | `AdminCompaniesPage` | Duyệt công ty |
| `/admin/jobs` | `AdminJobsPage` | Duyệt tin tuyển dụng |
| `/admin/industries` | `AdminIndustriesPage` | Quản lý ngành nghề |
| `/admin/blog` | `AdminBlogPage` | Quản lý blog |
| `/admin/packages` | `AdminPackagesPage` | Gói tin đăng |

---

## 📁 Client Folder Structure

```
client/src/
├── api/             # Axios instances & API calls theo từng module
│   ├── axios.js     # Axios base instance (baseURL, interceptors)
│   ├── auth.api.js
│   ├── job.api.js
│   ├── cv.api.js
│   ├── company.api.js
│   ├── application.api.js
│   ├── ai.api.js
│   └── ...
├── components/      # Shared components
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   ├── ui/          # Small reusable components
│   │   ├── JobCard.jsx
│   │   ├── CompanyCard.jsx
│   │   ├── Badge.jsx
│   │   └── ...
│   └── shared/
│       ├── LoadingSpinner.jsx
│       ├── EmptyState.jsx
│       └── ...
├── pages/           # Page components (theo cấu trúc route)
│   ├── Home/
│   ├── Jobs/
│   ├── Auth/
│   ├── Candidate/
│   ├── Employer/
│   └── Admin/
├── hooks/           # Custom React hooks
│   ├── useAuth.js
│   ├── useSocket.js
│   └── ...
├── store/           # Global state (Context API hoặc Zustand)
│   └── authStore.js
├── utils/           # Helper functions
│   └── format.js
├── App.jsx          # Router setup
├── main.jsx
└── index.css        # Global styles & Tailwind
```

---

## ⚙️ Lưu ý khi phát triển

1. **Auth**: Token lưu trong cookie `token` (httpOnly), refresh token trong cookie `refreshToken`. Gọi `GET /api/users/auth` để check login status khi app load.
2. **File Upload**: Dùng `multipart/form-data` với Axios (`FormData`). Tránh set `Content-Type` manual.
3. **Socket**: Kết nối Socket.io sau khi user đăng nhập. Server tự lấy token từ cookie để authenticate socket.
4. **Role Guard**: Wrap các route nhạy cảm bằng `ProtectedRoute` component kiểm tra `user.role`.
5. **Search Job**: Query params: `keyword`, `location`, `salaryMin`, `salaryMax`, `type`, `category`, `experience`, `page`, `limit`.
6. **Pagination**: Hầu hết các API list đều hỗ trợ `page` và `limit` query params.
