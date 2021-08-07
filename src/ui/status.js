const Status = {
	ONLINE: 0,
	AWAY: 1,
	BUSY: 2,
	OFFLINE: 3
};

/**
 * Returns a display name for specified status
 * @param {number} status
 * @returns {string} status display name
 */
function statusToString(status)
{
	switch(status)
	{
		case Status.ONLINE:
			return "Online";
		case Status.AWAY:
			return "Away";
		case Status.BUSY:
			return "Busy";
		default:
			return "Offline";
	}
}

export {Status, statusToString};