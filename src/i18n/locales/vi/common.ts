import type { CommonLocaleObject } from "@/i18n/types";

const commonVi: CommonLocaleObject = {
	validation_required: "Trường này là bắt buộc.",
	validation_email: "Vui lòng nhập email hợp lệ.",
	validation_password_strength:
		"Mật khẩu phải dài 6-30 ký tự và gồm chữ thường và số.",
	validation_password_mismatch: "Mật khẩu không khớp.",
	validation_url: "Vui lòng nhập URL hợp lệ.",
	validation_permission_required: "Vui lòng chọn ít nhất một quyền.",
	pagination_page_info: "Trang {{current}} / {{total}}",
	pagination_previous: "Trước",
	pagination_next: "Sau",
	search_placeholder: "Tìm kiếm...",
	show_inactive_true: "Tất cả",
	show_inactive_false: "Đang hoạt động",
	filter_all_elements: "Tất cả nguyên tố",
	filter_all_weapon_types: "Tất cả loại vũ khí",
	filter_all_rarities: "Tất cả độ hiếm",
	filter_sort: "Sắp xếp",
	filter_name_asc: "Tên A-Z",
	filter_name_desc: "Tên Z-A",
	filter_total_cost_low_high: "Tổng cost thấp-cao",
	filter_total_cost_high_low: "Tổng cost cao-thấp",
	level: "Cấp",
	cancel: "Hủy",
	save: "Lưu",
};

export default commonVi;
