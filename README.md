# 🌟 LinguaFlow — Sổ Tay Từ Vựng Song Ngữ Thông Minh (Anh - Trung) & Quiz Hàng Ngày

Ứng dụng Web hiện đại hỗ trợ học và ghi chú từ vựng song ngữ **Tiếng Anh 🇬🇧 & Tiếng Trung 🇨🇳**, tích hợp trí tuệ nhân tạo **Google Gemini AI**, phát âm Audio chuẩn bản xứ cho từ vựng & câu ví dụ, sổ tay theo ngày và trung tâm Quiz ôn tập đa chế độ.

---

## ✨ Tính Năng Nổi Bật

1. **Tra cứu & Bóc tách đa từ loại siêu tốc (Multi-POS Gemini AI):**
   - Tự động nhận diện từ tiếng Anh hoặc tiếng Trung.
   - Bóc tách toàn bộ các từ loại nếu từ có nhiều vai trò (ví dụ: *record* vừa là Danh từ vừa là Động từ; chữ Hán đa nghĩa đa âm).
   - Phiên âm chuẩn xác (IPA với tiếng Anh, Pinyin có dấu thanh điệu với tiếng Trung).
   - Nghĩa tiếng Việt giải thích chuẩn ngữ cảnh.
   - Câu ví dụ thực tế song ngữ kèm phát âm audio.
   - Cụm từ thông dụng (Collocations) và Từ đồng nghĩa (Synonyms).

2. **Hệ Thống Phát Âm Audio Bản Xứ (Web Speech Engine):**
   - Phát âm từ vựng và từng câu ví dụ bằng giọng đọc chuẩn Anh-Mỹ / Anh-Anh hoặc Trung Phổ thông.
   - Tùy chỉnh tốc độ và cao độ giọng đọc trong Cài đặt.

3. **Sổ Tay Từ Vựng Gom Nhóm Theo Ngày (Daily Notebook):**
   - Tự động gom nhóm từ theo ngày học (`Hôm nay`, `Hôm qua`, `Ngày cụ thể`).
   - Lọc theo ngôn ngữ, trạng thái thuộc từ (Mới thêm, Đang học, Đã thuộc), và đánh dấu từ quan trọng (⭐).
   - Tìm kiếm nhanh trong sổ tay.

4. **Trung Tâm Quiz Ôn Luyện Hàng Ngày (4 Chế Độ):**
   - Nút **"Luyện Quiz Ngày Này"** trên từng ngày hoặc luyện toàn bộ sổ tay.
   - **Flashcard 3D:** Lật thẻ mượt mà, tự động đọc từ và nghe ví dụ.
   - **Trắc nghiệm 4 đáp án:** Chọn nghĩa hoặc chọn từ với giải thích chi tiết.
   - **Luyện nghe (Listening):** Nghe phát âm chọn từ đúng.
   - **Điền từ vào câu ví dụ (Fill in the blank):** Rèn luyện ngữ cảnh thực tế.
   - Bảng tổng kết điểm, hiệu ứng pháo hoa (**Confetti**) và chế độ ôn lại từ sai.

5. **Giao Diện Chuẩn Dribbble & Tiện Ích:**
   - Hỗ trợ **Dark Mode / Light Mode** mượt mà.
   - Lưu trữ an toàn trên trình duyệt (**LocalStorage**) — Hoạt động offline 100%.
   - Sao lưu dữ liệu: **Xuất file JSON, Xuất Excel (CSV)** và **Phục hồi từ JSON**.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Mở Terminal / Command Prompt tại thư mục dự án:
```bash
npm run dev
```

### 2. Mở trình duyệt truy cập:
```
http://localhost:5173
```

---

## ⚙️ Cấu Hình API Key

- API Key của **Google Gemini AI Studio** đã được cấu hình sẵn trong ứng dụng.
- Bạn có thể kiểm tra hoặc thay đổi bất cứ lúc nào tại biểu tượng **Bánh răng Cài đặt (Settings)** ở góc trên bên phải màn hình.
