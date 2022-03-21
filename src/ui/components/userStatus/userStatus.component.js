import Component from "../component";
import htmlTemplate from "./userStatus.component.html";
import stylesheet from "!!css-loader!./userStatus.component.css";
import { Status, statusToString } from "../../status";
/** @typedef {import('../../../models/contact')} Contact */

class UserStatusComponent extends Component
{
	/**
	 * UserStatus component
	 */
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.element = this.shadowRoot.querySelector(".status");
		this.statusElement = this.element.querySelector(".status-text");
		this.isSelf = this.hasAttribute("self") && this.getAttribute("self") != "false";
		this.spinnerElement = this.element.querySelector(".connection-spinner");

		if (!this.isSelf) // show spinner only for our user
			this.spinnerElement.style.display = "none";
	}

	/**
	 * Update status text and color
	 * @param {Contact} contact
	 */
	update(contact)
	{
		let status = contact.status;

		if (this.statusElement.classList.contains("online"))
			this.statusElement.classList.remove("online");

		if (this.statusElement.classList.contains("away"))
			this.statusElement.classList.remove("away");

		if (this.statusElement.classList.contains("busy"))
			this.statusElement.classList.remove("busy");

		if (this.statusElement.classList.contains("offline"))
			this.statusElement.classList.remove("offline");

		if (contact.connectionStatus == 0)
			status = Status.OFFLINE;

		// hide spinner when we are online
		if (this.isSelf)
		{
			if (contact.connectionStatus != 0) // online
			{
				if (!this.spinnerElement.classList.contains("hidden"))
					this.spinnerElement.classList.add("hidden");
			} else
			{
				this.spinnerElement.classList.remove("hidden");
			}
		}

		const statusString = statusToString(status, this.isSelf);
		this.statusElement.textContent = statusString;

		let className = statusString.toLowerCase();
		if (className == "connecting")
			className = "offline";

		this.statusElement.classList.add(className);
	}
}

export default UserStatusComponent;