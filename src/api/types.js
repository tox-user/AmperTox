const ref = require("ref-napi");
const ToxOptions = require("../models/tox/options");

module.exports =
{
	toxPtr: ref.refType(ref.types.void),
	userDataPtr: ref.refType(ref.types.void),
	intPtr: ref.refType("int"),
	stringPtr: ref.refType("string"),
	toxOptionsPtr: ref.refType(ToxOptions)
};