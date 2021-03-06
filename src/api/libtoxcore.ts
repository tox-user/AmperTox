const ffi = require("ffi-napi");
const types = require("./types");

const libtoxcore = ffi.Library("libtoxcore",
{
	"tox_new": [types.toxPtr, [types.toxOptionsPtr, "pointer"]],
	"tox_iteration_interval": ["int", [types.toxPtr]],
	"tox_iterate": ["void", [types.toxPtr, "pointer"]],
	"tox_bootstrap": ["bool", [types.toxPtr, "string", "int", "pointer", "pointer"]],
	"tox_get_savedata_size": ["size_t", [types.toxPtr]],
	"tox_get_savedata": ["void", [types.toxPtr, "pointer"]],
	"tox_address_size": ["int", []],
	"tox_public_key_size": ["int", []],
	"tox_hash": ["bool", ["pointer", "pointer", "size_t"]],

	// self
	"tox_self_get_address": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_name": ["void", [types.toxPtr, "pointer"]],
	"tox_self_get_name_size": ["size_t", [types.toxPtr]],
	"tox_self_set_name": ["void", [types.toxPtr, "string", "size_t", "pointer"]],
	"tox_self_get_status": ["int", [types.toxPtr]],
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
	"tox_file_send": ["int", [types.toxPtr, "int", "int", "int", "pointer", "string", "size_t", "pointer"]],
	"tox_file_send_chunk": ["bool", [types.toxPtr, "int", "int", "int", "pointer", "size_t", "pointer"]],

	// events
	"tox_events_init": ["void", [types.toxPtr]],
	"tox_events_iterate": [types.toxEventsPtr, [types.toxPtr, "bool", "pointer"]],
	"tox_events_free": ["void", [types.toxEventsPtr]],

	// events - get amount
	"tox_events_get_conference_connected_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_conference_invite_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_conference_message_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_conference_peer_list_changed_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_conference_peer_name_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_conference_title_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_file_chunk_request_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_file_recv_chunk_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_file_recv_control_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_file_recv_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_connection_status_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_lossless_packet_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_lossy_packet_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_message_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_name_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_read_receipt_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_request_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_status_message_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_status_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_friend_typing_size": ["int", [types.toxEventsPtr]],
	"tox_events_get_self_connection_status_size": ["int", [types.toxEventsPtr]],

	// events - get data
	"tox_events_get_conference_connected": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_conference_invite": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_conference_message": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_conference_peer_list_changed": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_conference_peer_name": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_conference_title": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_file_chunk_request": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_file_recv_chunk": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_file_recv_control": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_file_recv": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_connection_status": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_lossless_packet": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_lossy_packet": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_message": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_name": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_read_receipt": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_request": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_status_message": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_status": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_friend_typing": ["pointer", [types.toxEventsPtr, "int"]],
	"tox_events_get_self_connection_status": ["pointer", [types.toxEventsPtr, "int"]],

	"tox_event_file_recv_get_filename": ["pointer", ["pointer"]],
	"tox_event_file_recv_get_filename_length": ["size_t", ["pointer"]],
	"tox_event_file_recv_get_file_number": ["int", ["pointer"]],
	"tox_event_file_recv_get_file_size": ["int", ["pointer"]],
	"tox_event_file_recv_get_friend_number": ["int", ["pointer"]],
	"tox_event_file_recv_get_kind": ["int", ["pointer"]],

	"tox_event_file_recv_chunk_get_data": ["pointer", ["pointer"]],
	"tox_event_file_recv_chunk_get_length": ["size_t", ["pointer"]],
	"tox_event_file_recv_chunk_get_file_number": ["int", ["pointer"]],
	"tox_event_file_recv_chunk_get_friend_number": ["int", ["pointer"]],
	"tox_event_file_recv_chunk_get_position": ["int", ["pointer"]],

	"tox_event_file_recv_control_get_control": ["int", ["pointer"]],
	"tox_event_file_recv_control_get_file_number": ["int", ["pointer"]],
	"tox_event_file_recv_control_get_friend_number": ["int", ["pointer"]],

	"tox_event_file_chunk_request_get_length": ["int", ["pointer"]],
	"tox_event_file_chunk_request_get_file_number": ["int", ["pointer"]],
	"tox_event_file_chunk_request_get_friend_number": ["int", ["pointer"]],
	"tox_event_file_chunk_request_get_position": ["int", ["pointer"]],

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
});

module.exports = libtoxcore;