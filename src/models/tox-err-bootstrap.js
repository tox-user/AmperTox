const Enum = require("enum");

module.exports = new Enum({
	TOX_ERR_BOOTSTRAP_OK: 0,
	TOX_ERR_BOOTSTRAP_NULL: 1,
	TOX_ERR_BOOTSTRAP_BAD_HOST: 2,
	TOX_ERR_BOOTSTRAP_BAD_PORT: 3
}, {name: "TOX_ERR_BOOTSTRAP"});