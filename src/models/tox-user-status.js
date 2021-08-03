const Enum = require("enum");

module.exports = new Enum({
	TOX_USER_STATUS_NONE: 0,
	TOX_USER_STATUS_AWAY: 1,
	TOX_USER_STATUS_BUSY: 2
}, {name: "TOX_USER_STATUS"});