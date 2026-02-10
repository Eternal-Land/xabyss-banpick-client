import type { UsersLocaleObject } from "@/i18n/types";

const usersVi: UsersLocaleObject = {
	users_title: "Người dùng",
	users_count: "{{count}} người dùng",
	users_count_plural: "{{count}} người dùng",
	users_load_error: "Không thể tải danh sách người dùng.",
	users_search_placeholder: "Tìm theo tên, email hoặc UID",
	users_refresh: "Làm mới",
	users_table_name: "Tên",
	users_table_email: "Email",
	users_table_ingame_uid: "UID trong game",
	users_table_status: "Trạng thái",
	users_table_last_login: "Đăng nhập lần cuối",
	users_table_created_at: "Ngày tạo",
	users_status_active: "Đang hoạt động",
	users_status_inactive: "Đã tắt",
	users_empty: "Không có người dùng.",
	users_pagination_previous: "Trước",
	users_pagination_next: "Sau",
	users_pagination_page: "Trang {{current}} / {{total}}",
};

export default usersVi;
