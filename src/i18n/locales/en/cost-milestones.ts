import type { CostMilestonesLocaleObject } from "@/i18n/types";

const costMilestonesEn: CostMilestonesLocaleObject = {
	cost_milestones_title: "Cost milestones",
	cost_milestones_table_index: "#",
	cost_milestones_table_range: "Cost range",
	cost_milestones_table_value: "Cost value",
	cost_milestones_table_action: "Action",
	cost_milestones_empty: "No cost milestones found.",
	cost_milestones_range_open: "No max",
	cost_milestones_edit_action: "Edit cost milestone",
	cost_milestones_delete_action: "Delete cost milestone",
	cost_milestones_create_success: "Cost milestone created.",
	cost_milestones_create_error: "Unable to create cost milestone.",
	cost_milestones_edit_success: "Cost milestone updated.",
	cost_milestones_edit_error: "Unable to update cost milestone.",
	cost_milestones_delete_success: "Cost milestone deleted.",
	cost_milestones_delete_error: "Unable to delete cost milestone.",
	cost_milestones_delete_confirm: "Delete cost milestone {{from}} - {{to}}?",
	cost_milestones_delete_title: "Delete cost milestone",
	cost_milestones_delete_description:
		"Are you sure you want to delete {{range}}? This cannot be undone.",
	cost_milestones_delete_confirm_action: "Delete",
	cost_milestones_delete_pending: "Deleting...",
	cost_milestones_title_create: "Create cost milestone",
	cost_milestones_title_edit: "Edit cost milestone",
	cost_milestones_description_create:
		"Define a new cost range and value per second.",
	cost_milestones_description_edit:
		"Update the cost range and value per second.",
	cost_milestones_cost_from_label: "Cost from",
	cost_milestones_cost_from_placeholder: "e.g. 0",
	cost_milestones_cost_to_label: "Cost to",
	cost_milestones_cost_to_placeholder: "e.g. 5",
	cost_milestones_cost_value_per_sec_label: "Cost value per sec",
	cost_milestones_cost_value_per_sec_placeholder: "e.g. 1.5",
	cost_milestones_cancel: "Cancel",
	cost_milestones_submit_create: "Create",
	cost_milestones_submit_edit: "Save changes",
	cost_milestones_cost_from_min:
		"Cost from must be greater than or equal to 0.",
	cost_milestones_cost_to_min: "Cost to must be greater than or equal to 0.",
	cost_milestones_cost_value_per_sec_min:
		"Cost value per second must be greater than or equal to 0.",
};

export default costMilestonesEn;
