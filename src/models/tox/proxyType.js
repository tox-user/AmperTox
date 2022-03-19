const Enum = require("enum");

module.exports = new Enum({
	TOX_PROXY_TYPE_NONE: 0,
	TOX_PROXY_TYPE_HTTP: 1,
	TOX_PROXY_TYPE_SOCKS5: 2
}, {name: "Tox_Proxy_Type"});