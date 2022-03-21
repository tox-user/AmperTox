const Status = {
	ONLINE: 0,
	AWAY: 1,
	BUSY: 2,
	OFFLINE: 3
};

/**
 * Returns a display name for specified status
 * @param {number} status
 * @param {boolean} self is our user
 * @returns {string} status display name
 */
function statusToString(status, self=false)
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
			if (self)
				return "Connecting";
			else
				return "Offline";
	}
}

export {Status, statusToString};