const ref = require("ref-napi");
const Struct = require("ref-struct-di")(ref);

module.exports = Struct({
	ipv6_enabled: "bool",
	udp_enabled: "bool",
	local_discovery_enabled: "bool",
	proxy_type: "int",
	proxy_host: "string",
	proxy_port: "uint16",
	start_port: "uint16",
	end_port: "uint16",
	tcp_port: "uint16",
	hole_punching_enabled: "bool",
	savedata_type: "int",
	savedata_data: "pointer",
	savedata_length: "size_t",
	log_callback: "pointer",
	log_user_data: "pointer"
});