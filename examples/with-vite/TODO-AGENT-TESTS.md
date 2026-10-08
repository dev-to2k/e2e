# Todo app và test agent

Todo app nằm cạnh app Say hello trong example này. Test agent mô tả từng bước
bằng tiếng Việt, agent tự đọc màn hình rồi thao tác và kiểm tra.

## File liên quan

| File | Vai trò |
|---|---|
| `todo.html`, `src/todo-main.tsx` | Trang riêng của todo app, mở ở `/todo.html` |
| `src/todo/TodoApp.tsx`, `src/todo/todo.css` | Giao diện và logic: thêm, hoàn thành, sửa, xóa, lọc, lưu localStorage |
| `tests/todo-agent.e2e.ts` | 8 test case agent bằng tiếng Việt |
| `e2e.config.ts` | Khai báo các agent (model) |
| `.env` | Key và workspace ID, không commit |

## Test case

| Case | Nội dung |
|---|---|
| TC-01 | Thêm todo mới |
| TC-02 | Đánh dấu hoàn thành |
| TC-03 | Sửa todo |
| TC-04 | Hủy sửa bằng Escape |
| TC-05 | Xóa todo |
| TC-06 | Không thêm todo rỗng |
| TC-07 | Lọc theo trạng thái |
| TC-08 | Giữ todo sau khi reload |

Mỗi case gọi `agent.act("...")` để thao tác và `agent.assert("...")` để kiểm tra.
Câu lệnh viết như hướng dẫn cho người, không có selector.

## Chạy test

Từ thư mục `examples/with-vite`:

```bash
npm install
npm run test:todo
```

Chạy một case cho đỡ tốn lượt model (thêm `:grok`, `:claude`, `:opencode` vào tên script để chọn model):

```bash
npm run test:todo -- --grep "TC-01"
```

Cờ lọc là `--grep`, không phải `-t`. `npm run test:todo` tự nạp `.env` trong
thư mục này. Server Vite ở `http://localhost:5173` được dùng lại nếu đã chạy,
nếu chưa thì runner tự bật.

Xem app bằng tay: `npm run dev`, rồi mở `http://localhost:5173/todo.html`.

## Chọn model

Test không ghim model. Chọn agent lúc chạy bằng script, hoặc bằng cờ `--agent`
của `e2e run`. Không truyền cờ thì test dùng agent `default`.

```bash
npm run test:todo:grok
npm run test:todo:claude
npm run test:todo:opencode
npm run test:todo -- --agent <tên>
```

Header của lần chạy in đúng model của agent được chọn. Thêm agent mới thì khai
báo trong `e2e.config.ts` rồi gọi bằng `--agent <tên>`.

| Agent | Model | Cần |
|---|---|---|
| `grok` | `grok('grok-4')` | `npx e2e login spacexai`, gói SuperGrok hoặc X Premium+ |
| `claude` | `claude-sonnet-5-5` | `ANTHROPIC_API_KEY`, `ANTHROPIC_WORKSPACE_ID`, credit API |
| `opencode` | `deepseek-v4.1-flash` qua OpenCode Zen | `OPENCODE_API_KEY`, credit Zen |
| `default` | `gemini-3.8-flash` | `GOOGLE_GENERATIVE_AI_API_KEY`, quota Google |

Đăng nhập Grok một lần, token tự refresh:

```bash
npx e2e login spacexai
```

Biến trong `.env` (mỗi dòng một biến, giá trị không để trong git):

```
ANTHROPIC_API_KEY=
ANTHROPIC_WORKSPACE_ID=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENCODE_API_KEY=
```

## Kết quả lần chạy gần nhất

Chạy đủ 8 case bằng `grok` (`xai.responses/grok-4`), 3 phút, 247k token: 6 pass, 2 fail.

| Case | Kết quả | Lý do |
|---|---|---|
| TC-01, 03, 05, 06, 07, 08 | Pass | |
| TC-02 | Fail, `ASSERTION_INCONCLUSIVE` | Câu assert nhắc "gạch ngang". Giám khảo chỉ đọc cây ngữ nghĩa, không thấy CSS, nên không kết luận được. Checkbox đã tick đúng. |
| TC-04 | Fail, `ACTION_FAILED` | Agent làm đúng (Escape, text giữ nguyên) nhưng coi việc text trở về bản gốc là thất bại, vì câu lệnh không nói đó là kết quả mong muốn. |

Cả hai là lỗi cách viết test, không phải lỗi của todo app. Chưa sửa. Cách sửa:
TC-02 bỏ ý "gạch ngang" hoặc thêm `vision: true`; TC-04 viết lại câu `act` là
hủy sửa bằng Escape và để kết quả ở bước `assert`.

## Lỗi thường gặp

| Thông báo | Nguyên nhân | Cách xử lý |
|---|---|---|
| `Anthropic API key is missing` / `Google ... API key is missing` | Thiếu biến trong `.env` | Thêm biến đúng tên |
| `This API key is not scoped to a workspace` | Key Anthropic không thuộc workspace | Tạo key trong workspace, hoặc đặt `ANTHROPIC_WORKSPACE_ID` |
| `Your credit balance is too low` | Hết credit Anthropic | Nạp credit ở Plans & Billing |
| `Insufficient account funds` | Hết số dư OpenCode Zen | Nạp credit, hoặc dùng `go/` với gói OpenCode Go |
| `You exceeded your current quota` (429) | Hết quota Google | Bật billing hoặc tạo key mới |
| `STEP_TIMEOUT: model call exceeded the remaining step timeout` | Thường là 429 của Google: SDK retry tới khi hết 30 giây | Sửa quota, không cần tăng timeout |
| `ETARGET ... provider-utils@5.0.57` khi `npm install` | Bản mới nhất của gói `@ai-sdk/*` cần phiên bản chưa publish | Cài lùi một bản, ví dụ `@ai-sdk/xai@5.0.18` |
| `NO_TESTS ... skipped` | Test bị `skip` do thiếu key | Thêm key, hoặc bỏ điều kiện skip |

## Ghi chú

- Cổng 5173 là của cả hai app. Nếu một server khác đang giữ cổng này, test sẽ
  mở nhầm app.
- `.env` bị gitignore (`.env*` ở gốc repo). Không dán key vào code hay commit.
- Test agent phụ thuộc model, nên kết quả có thể lệch giữa các lần chạy. Mỗi
  bước agent đi kèm một câu `assert` để bắt sai lệch.
