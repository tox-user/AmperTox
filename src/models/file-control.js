const Enum = require("enum");

module.exports = new Enum({
	TOX_FILE_CONTROL_RESUME: 0,
	TOX_FILE_CONTROL_PAUSE: 1,
	TOX_FILE_CONTROL_CANCEL: 2
}, {name: "TOX_FILE_CONTROL"});