# Tin học 6 · Thực hành thư điện tử

Mô phỏng tương tác phần 3, Bài 8 **Thư điện tử**, SGK Tin học 6, Kết nối tri thức với cuộc sống, trang 34–35. Có thêm thao tác đính kèm tệp từ phần vận dụng ở trang 36.

Giao diện dùng **Radix UI Themes**, **Lucide React** và trình soạn thảo **Tiptap**. Thương hiệu Mầm Xanh sử dụng logo do người dùng cung cấp, xanh quân phục, ô liu và điểm nhấn vàng. Bên trong là giao diện Gmail quen thuộc; không có khối chữ ký hoặc công cụ chèn chữ ký.

## Cấu trúc để bảo trì

- `app/page.tsx`: bố cục và điều hướng bài thực hành.
- `app/_components/simulation-context.tsx`: trạng thái và quy tắc nghiệp vụ của mô phỏng.
- `app/_components/use-mail-workspace.ts`: thư mục, nhiều bản nháp, quản lý thư, lịch gửi, tạm ẩn và hoàn tác.
- `app/_components/SignupFlow.tsx`, `app/_lib/registration.ts`: các màn hình đăng ký và kiểm tra ngày sinh, tuổi, giới tính, khôi phục, mã luyện tập.
- `app/_lib/mail-model.ts`: quy tắc thư mục, tìm kiếm, danh bạ và chuyển đổi văn bản.
- `ComposeWindow`, `EditorToolbar`, `ComposeDialogs`: soạn thư có định dạng bằng Tiptap, công cụ Radix và các hộp thoại.
- `MailReader`, `MailboxDialogs`: đọc thư giữ định dạng, xuất EML và cài đặt/tác vụ hộp thư.
- `app/_lib/lesson-data.ts`: nội dung bài, thư mẫu và quy tắc kiểm tra dữ liệu.
- `app/_components/`: Sidebar, Mailbox, ComposeWindow, AccountScreens, LessonGuide, PracticeBrowser và PracticeDialogs tách riêng theo chức năng.
- `app/globals.css`: token màu thương hiệu và cấu hình theme Radix; `app/_styles/` tách CSS theo bố cục, hộp thư, soạn thư, tài khoản, hướng dẫn và màn hình nhỏ.
- `public/mam-xanh-logo.png`, `app/icon.png`: logo gốc cho giao diện và biểu tượng trình duyệt.

## Chạy trên máy

```powershell
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Màn hình ban đầu có sẵn hộp thư mẫu để học sinh thử gửi thư. Chọn bài ở thanh điều hướng để học từ bước tạo tài khoản. Bước cần làm luôn xuất hiện ngay trên vùng thực hành; nút **Các bước** mở danh sách kiểm tra mà không thu hẹp hộp thư.

```powershell
npm run build
npm start
```

## Nội dung tương tác

- Đăng ký giả lập theo 7 bước: chọn tài khoản cá nhân/trẻ em → họ tên → ngày sinh/giới tính → địa chỉ Gmail → mật khẩu → khôi phục và xác minh → kiểm tra/hoàn tất.
- Ngày sinh kiểm tra ngày thực tế, năm nhuận và tương lai; giới tính có Không muốn trả lời và Tùy chỉnh. Điện thoại/email khôi phục không bắt buộc; có thể bỏ qua. Email khôi phục phải khác Gmail đang tạo, kể cả biến thể dấu chấm hoặc đuôi +.
- Khi nhập điện thoại, thực hành mã xác minh 6 chữ số hiển thị trên màn hình; có tạo mã mới, mã cũ mất hiệu lực. Không gửi SMS thật. Quay lại sửa điện thoại sẽ yêu cầu xác minh lại.
- Tình huống dưới 15 tuổi tại Việt Nam chuyển sang luồng trẻ em, có xác nhận người giám hộ hỗ trợ trong mô phỏng. Mốc tuổi tham khảo [Google Account Help](https://support.google.com/accounts/answer/1350409?hl=vi); luồng tham khảo [hướng dẫn tạo tài khoản](https://support.google.com/accounts/answer/27441?hl=vi). Đây là bài tập, không thực hiện xác minh hay cấp phép tài khoản thật.
- Màn hình cuối hiển thị đầy đủ thông tin, điều kiện/quyền riêng tư của bài mô phỏng và xác nhận trước khi hoàn tất; không chấp nhận điều khoản Google thay cho học sinh.
- Đăng nhập bằng tài khoản vừa tạo hoặc tài khoản mẫu; kiểm tra địa chỉ và mật khẩu, mở thư, đăng xuất qua ảnh đại diện.
- Soạn nhiều bản nháp tự lưu; Đến/Cc/Bcc hỗ trợ nhiều địa chỉ, kiểm tra trực tiếp từng trường; gửi, hoàn tác gửi, trả lời, trả lời tất cả, chuyển tiếp.
- Định dạng: hoàn tác/làm lại, phông, cỡ, đậm/nghiêng/gạch chân/gạch ngang, màu chữ/nền, căn lề, danh sách, thụt lề danh sách, trích dẫn và xóa định dạng.
- Chèn liên kết (chặn giao thức nguy hiểm), biểu tượng cảm xúc, ảnh từ máy, tài liệu mẫu Drive mô phỏng. Không có tính năng chữ ký.
- Tệp đính kèm thật trong bộ nhớ trình duyệt, tải lại được; tối đa 10 MB/tệp và 25 MB/thư. Ảnh chèn PNG/JPEG/GIF/WebP tối đa 5 MB.
- Phân nhóm Chính/Quảng cáo/Mạng xã hội/Cập nhật; chọn hàng loạt, đánh dấu sao/quan trọng/đã đọc, lưu trữ, thư rác, thùng rác, khôi phục, nhãn và phân trang.
- Tìm kiếm văn bản và các bộ lọc `from:`, `to:`, `subject:`, `is:unread`, `is:starred`, `has:attachment`, `in:anywhere`; có bảng tìm nâng cao.
- Gửi theo lịch, hủy lịch về nháp; tạm ẩn và tự trả thư về hộp đến. Cài mật độ, số thư/trang, bật/tắt nhóm thư; chế độ toàn màn hình hộp thư và phóng to/thu nhỏ cửa sổ soạn.
- Đặt thời hạn xem thư bảo mật mô phỏng, in và tải thư dạng EML. Chế độ bảo mật là tương tác luyện tập, không cung cấp mã hóa/xác thực SMS.
- Hướng dẫn bước hiện tại, danh sách các bước có thể mở rộng, phản hồi nhập sai, tiến độ theo thao tác và tải báo cáo kết quả dạng văn bản. Danh bạ và mẫu thư nằm trong menu Tùy chọn hộp thư.
- Kiểm tra ngay khi gõ hoặc rời ô: email, họ tên, tên đăng nhập, mật khẩu, xác nhận mật khẩu, tiêu đề và nội dung thư. Ô sai viền đỏ, kèm lí do; sửa đúng tự hết lỗi. Nút gửi/tiếp theo luôn kiểm tra lại và đưa con trỏ đến ô sai đầu tiên.
- Giao diện thích ứng với máy tính và điện thoại.

## Dữ liệu mô phỏng

Không kết nối Gmail/Google, không tạo tài khoản thật, không gửi email và không tải tệp lên máy chủ. Tệp chọn được giữ bằng Blob URL trong trình duyệt để tải lại; ảnh chèn được đọc tại máy và lưu trong nội dung thư của phiên.

Tài khoản, mật khẩu luyện tập, nháp, nội dung, tệp và lịch gửi tồn tại trong bộ nhớ trang. Tải lại trang sẽ đặt lại hộp thư và tài khoản mẫu. Lịch gửi/tạm ẩn chỉ hoạt động khi trang đang mở. Chỉ tiến độ hoàn thành được lưu trong `localStorage` trên trình duyệt. Nút **Làm lại** xóa tiến độ và dữ liệu lượt thực hành.

Tài khoản mẫu: `hahai6a@gmail.com`, mật khẩu giả định: `TinHoc6!`. Học sinh nên nhập thông tin giả định và không dùng mật khẩu thật.

## Kiểm chứng

Build sản xuất kiểm tra TypeScript. Các luồng đã kiểm tra trực tiếp trên trình duyệt: đăng kí, đăng nhập đúng/sai mật khẩu, đọc thư, đăng xuất, gửi thiếu dữ liệu, lưu/mở nháp, gửi kèm tệp, đọc lại thư đã gửi và hoàn thành 12/12 thao tác.

Chạy `npm test` để kiểm tra các quy tắc dữ liệu, gồm ngày sinh không tồn tại/năm nhuận/tương lai, tuổi theo đúng ngày sinh, thông tin khôi phục, mã xác minh; email sai dấu chấm, tên miền, khoảng trắng, độ dài; tên đăng nhập sai; mật khẩu và xác nhận không khớp. `app/_lib/validation.ts` là nguồn quy tắc chung cho kiểm tra trực tiếp và khi gửi biểu mẫu.
