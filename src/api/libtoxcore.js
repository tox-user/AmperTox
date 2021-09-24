const ffi = require("ffi-napi");
const types = require("./types");

const libtoxcore = ffi.Library("libtoxcore.so.2",
{
	"tox_new": [types.toxPtr, [types.toxOptionsPtr, "pointer"]],
	"tox_iteration_interval": ["int", [types.toxPtr]],
	"tox_iterate": ["void", [types.toxPtr, "pointer"]],
	"tox_bootstrap": ["bool", [types.toxPtr, "string", "int", "pointer", "pointer"]],
	"tox_get_savedata_size": ["size_t", [types.toxPtr]],
	"tox_get_savedata": ["void", [types.toxPtr, "pointer"]],
	"tox_address_size": ["int", []],
	"tox_public_key_size": ["int", []],

	// self
	"tox_self_get_address": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_name": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_name_size": ["size_t", [types.toxPtr]],
	"tox_self_set_name": ["void", [types.toxPtr, "string", "size_t", "pointer"]],
	"tox_self_get_status_message": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_status_message_size": ["size_t", [types.toxPtr]],
	"tox_self_set_status_message": ["void", [types.toxPtr, "string", "size_t", "pointer"]],
	"tox_self_get_public_key": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_friend_list": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_friend_list_size": ["size_t", [types.toxPtr]],

	// friend
	"tox_friend_add": ["int", [types.toxPtr, "pointer", "string", "size_t", "pointer"]],
	"tox_friend_add_norequest": ["int", [types.toxPtr, "pointer", "pointer"]],
	"tox_friend_get_name": ["bool", [types.toxPtr, "int", "pointer", "pointer"]],
	"tox_friend_get_name_size": ["size_t", [types.toxPtr, "int", "pointer"]],
	"tox_friend_get_status_message": ["bool", [types.toxPtr, "int", "pointer", "pointer"]],
	"tox_friend_get_status_message_size": ["size_t", [types.toxPtr, "int", "pointer"]],
	"tox_friend_get_public_key": ["bool", [types.toxPtr, "int", "pointer", "pointer"]],
	"tox_friend_send_message": ["int", [types.toxPtr, "int", "int", "pointer", "size_t", "pointer"]],
	"tox_friend_delete": ["bool", [types.toxPtr, "int", "pointer"]],
	"tox_file_control": ["bool", [types.toxPtr, "int", "int", "int", "pointer"]],

	// callbacks
	"tox_callback_self_connection_status": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_request": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_message": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_read_receipt": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_typing": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_connection_status": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_status": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_status_message": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_friend_name": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_peer_list_changed": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_peer_name": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_title": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_message": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_connected": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_conference_invite": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_file_recv_chunk": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_file_recv": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_file_chunk_request": ["void", [types.toxPtr, "pointer"]],
	"tox_callback_file_recv_control": ["void", [types.toxPtr, "pointer"]]
});

module.exports = libtoxcore;