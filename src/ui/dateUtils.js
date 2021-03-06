const timeFormat = new Intl.DateTimeFormat([], {timeStyle: "short"});
const dateFormat = new Intl.DateTimeFormat();

/**
 * Check if two dates are the same, but without taking time into account
 * @param {Date} date1
 * @param {Date} date2
 * @returns boolean
 */
const isSameDay = (date1, date2) =>
{
	return date1.getDate() == date2.getDate() &&
			date1.getMonth() == date2.getMonth() &&
			date1.getFullYear() == date2.getFullYear();
};

/**
 * If date is the same as today
 * @param {Date} date
 * @returns boolean
 */
const isToday = (date) =>
{
	const now = new Date();
	return isSameDay(date, now);
};

/**
 * If date is the same as yesterday
 * @param {Date} date
 * @returns boolean
 */
const isYesterday = (date) =>
{
	const date2 = new Date();
	date2.setDate(date2.getDate() - 1);
	return isSameDay(date, date2);
};

/**
 *
 * @param {number} numMinutes
 * @param {Date} date1
 * @param {Date} date2
 * @returns boolean true if one of the dates is older by numMinutes or more
 */
export const hasMinutesDifference = (numMinutes, date1, date2) =>
{
	const minutesMs = numMinutes * 60 * 1000;
	const differenceMs = Math.abs(date1.getTime() - date2.getTime());
	if (differenceMs >= minutesMs)
		return true;

	return false;
};

/**
 * Returns a string with locale time
 * @param {Date} date
 * @returns {string} time display string
 */
export const messageTimeString = (date) =>
{
	return timeFormat.format(date);
};

/**
 * Returns a string with locale date and time, but exact date is only shown if it's not today or yesterday
 * @param {Date} date
 * @returns {string} datetime display string
 */
export const messageDateTimeString = (date) =>
{
	const timeString = timeFormat.format(date);
	let dateString = "";

	if (isToday(date))
		dateString = "Today";
	else if (isYesterday(date))
		dateString = "Yesterday";
	else
		dateString = dateFormat.format(date);

	return `${dateString}, ${timeString}`;
};