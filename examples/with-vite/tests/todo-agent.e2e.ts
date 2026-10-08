import { test } from '@e2e-dev/web';

test('TC-01: thêm todo mới', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.assert('Danh sách todo đang trống');

  await agent.act('Gõ "Mua sữa" vào ô nhập todo rồi nhấn Enter');

  await agent.assert('Danh sách có đúng 1 item "Mua sữa" và ô nhập todo đã được xóa trống');
  await agent.assert('Hiển thị "1 items left"');
});

test('TC-02: đánh dấu hoàn thành', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm todo "Học bài"');

  await agent.act('Đánh dấu todo "Học bài" là đã hoàn thành');

  await agent.assert('Todo "Học bài" đã được tick và hiển thị gạch ngang');
  await agent.assert('Hiển thị "0 items left"');
});

test('TC-03: sửa todo', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm todo "Mua sữa"');

  await agent.act('Sửa todo "Mua sữa" thành "Mua bánh mì" rồi nhấn Enter');

  await agent.assert('Danh sách chỉ có item "Mua bánh mì" và không còn item "Mua sữa"');
});

test('TC-04: hủy sửa bằng Escape', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm todo "Mua sữa"');

  await agent.act('Bấm sửa todo "Mua sữa", gõ "Nội dung khác" rồi nhấn Escape');

  await agent.assert('Danh sách vẫn là "Mua sữa", không có "Nội dung khác"');
});

test('TC-05: xóa todo', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm todo "Mua sữa"');

  await agent.act('Xóa todo "Mua sữa"');

  await agent.assert('Danh sách trống và hiển thị thông báo "No todos"');
});

test('TC-06: không thêm todo rỗng', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');

  await agent.act('Nhấn Enter khi ô nhập todo đang trống');
  await agent.act('Gõ vài dấu cách vào ô nhập todo rồi nhấn Enter');

  await agent.assert('Danh sách vẫn trống');
});

test('TC-07: lọc todo theo trạng thái', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm hai todo "Việc A" và "Việc B"');
  await agent.act('Đánh dấu "Việc A" là đã hoàn thành');

  await agent.act('Chọn bộ lọc completed');
  await agent.assert('Chỉ hiển thị "Việc A", không có "Việc B"');

  await agent.act('Chọn bộ lọc active');
  await agent.assert('Chỉ hiển thị "Việc B", không có "Việc A"');

  await agent.act('Chọn bộ lọc all');
  await agent.assert('Hiển thị cả "Việc A" và "Việc B"');
});

test('TC-08: giữ todo sau khi reload', { agent: 'claude' }, async ({ app, agent }) => {
  await app.open('/todo.html');
  await agent.act('Thêm todo "Mua sữa" và đánh dấu hoàn thành');

  await app.open('/todo.html');

  await agent.assert('Todo "Mua sữa" vẫn còn trong danh sách và vẫn ở trạng thái đã hoàn thành');
});
