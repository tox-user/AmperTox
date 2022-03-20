import Component from "../component";
import htmlTemplate from "./userStatus.component.html";
import stylesheet from "!!css-loader!./userStatus.component.css";
import { Status, statusToString } from "../../status";

class UserStatusComponent extends Component
{
	/**
	 * UserStatus component
	 */
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.element = this.shadowRoot.querySelector(".status");
	}

	/**
	 * @typedef {import('../../../models/contact')} Contact
	 * @param {Contact} contact
	 */
	update(contact)
	{
		let status = contact.status;

		if (this.element.classList.contains("online"))
			this.element.classList.remove("online");

		if (this.element.classList.contains("away"))
			this.element.classList.remove("away");

		if (this.element.classList.contains("busy"))
			this.element.classList.remove("busy");

		if (this.element.classList.contains("offline"))
			this.element.classList.remove("offline");

		if (contact.connectionStatus == 0)
			status = Status.OFFLINE;

		const statusString = statusToString(status);
		this.element.textContent = statusString;
		this.element.classList.add(statusString.toLowerCase());
	}
}

export default UserStatusComponent;