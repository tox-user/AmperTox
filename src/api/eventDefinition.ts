const libtoxcore = require("./libtoxcore");

interface ToxEvent
{
	getAmount: (ToxEvents: Buffer) => number;
	getData: (ToxEvents: Buffer, index: number) => Buffer;
}

interface ToxEventDefinition {
	[key: string]: ToxEvent;
}

export const eventDefinition: ToxEventDefinition =
{
	conferenceConnected: {
		getAmount: libtoxcore.tox_events_get_conference_connected_size,
		getData: libtoxcore.tox_events_get_conference_connected,
	},
	conferenceInvite: {
		getAmount: libtoxcore.tox_events_get_conference_invite_size,
		getData: libtoxcore.tox_events_get_conference_invite,
	},
	conferenceMessage: {
		getAmount: libtoxcore.tox_events_get_conference_message_size,
		getData: libtoxcore.tox_events_get_conference_message,
	},
	conferencePeerListChanged: {
		getAmount: libtoxcore.tox_events_get_conference_peer_list_changed_size,
		getData: libtoxcore.tox_events_get_conference_peer_list_changed,
	},
	conferencePeerName: {
		getAmount: libtoxcore.tox_events_get_conference_peer_name_size,
		getData: libtoxcore.tox_events_get_conference_peer_name,
	},
	conferenceTitle: {
		getAmount: libtoxcore.tox_events_get_conference_title_size,
		getData: libtoxcore.tox_events_get_conference_title,
	},
	fileChunkRequest: {
		getAmount: libtoxcore.tox_events_get_file_chunk_request_size,
		getData: libtoxcore.tox_events_get_file_chunk_request,
	},
	fileRecvChunk: {
		getAmount: libtoxcore.tox_events_get_file_recv_chunk_size,
		getData: libtoxcore.tox_events_get_file_recv_chunk,
	},
	fileRecvControl: {
		getAmount: libtoxcore.tox_events_get_file_recv_control_size,
		getData: libtoxcore.tox_events_get_file_recv_control,
	},
	fileRecv: {
		getAmount: libtoxcore.tox_events_get_file_recv_size,
		getData: libtoxcore.tox_events_get_file_recv,
	},
	friendConnectionStatus: {
		getAmount: libtoxcore.tox_events_get_friend_connection_status_size,
		getData: libtoxcore.tox_events_get_friend_connection_status,
	},
	friendLosslessPacket: {
		getAmount: libtoxcore.tox_events_get_friend_lossless_packet_size,
		getData: libtoxcore.tox_events_get_friend_lossless_packet,
	},
	friendLossyPacket: {
		getAmount: libtoxcore.tox_events_get_friend_lossy_packet_size,
		getData: libtoxcore.tox_events_get_friend_lossy_packet,
	},
	friendMessage: {
		getAmount: libtoxcore.tox_events_get_friend_message_size,
		getData: libtoxcore.tox_events_get_friend_message,
	},
	friendName: {
		getAmount: libtoxcore.tox_events_get_friend_name_size,
		getData: libtoxcore.tox_events_get_friend_name,
	},
	friendReadReceipt: {
		getAmount: libtoxcore.tox_events_get_friend_read_receipt_size,
		getData: libtoxcore.tox_events_get_friend_read_receipt,
	},
	friendRequest: {
		getAmount: libtoxcore.tox_events_get_friend_request_size,
		getData: libtoxcore.tox_events_get_friend_request,
	},
	friendStatusMessage: {
		getAmount: libtoxcore.tox_events_get_friend_status_message_size,
		getData: libtoxcore.tox_events_get_friend_status_message,
	},
	friendStatus: {
		getAmount: libtoxcore.tox_events_get_friend_status_size,
		getData: libtoxcore.tox_events_get_friend_status,
	},
	friendTyping: {
		getAmount: libtoxcore.tox_events_get_friend_typing_size,
		getData: libtoxcore.tox_events_get_friend_typing,
	},
	selfConnectionStatus: {
		getAmount: libtoxcore.tox_events_get_self_connection_status_size,
		getData: libtoxcore.tox_events_get_self_connection_status,
	}
};