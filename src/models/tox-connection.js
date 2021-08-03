const Enum = require("enum");

module.exports = new Enum({
	TOX_CONNECTION_NONE: 0,
	TOX_CONNECTION_TCP: 1,
	TOX_CONNECTION_UDP: 2
}, {name: "TOX_CONNECTION"});