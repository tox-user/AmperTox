const ref = require("ref-napi");
import ToxOptions from "../models/tox/options";

const types =
{
	toxPtr: ref.refType(ref.types.void),
	userDataPtr: ref.refType(ref.types.void),
	intPtr: ref.refType("int"),
	stringPtr: ref.refType("string"),
	toxOptionsPtr: ref.refType(ToxOptions),
	toxEventsPtr: ref.refType(ref.types.void)
};

export interface RefBuffer extends Buffer
{
	deref: () => any;
}

export interface EventListeners
{
	[key: string]: (data: Buffer) => void;
}

module.exports = types;
export default types;