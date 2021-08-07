import Component from "../component.js";
import htmlTemplate from "./contact.component.html";
import stylesheet from "!!css-loader!./contact.component.css";
import UserStatus from "../userStatus/userStatus";

class ContactComponent extends Component
{
	/**
	 * Contact component
	 * @typedef {import('../../../models/contact')} Contact
	 * @param {Contact} contact
	 * @param {number} numUnreadMessages
	 */
	constructor(contact, numUnreadMessages=0)
	{
		super(htmlTemplate, stylesheet);

		this.contact = contact;
		this.numUnreadMessages = numUnreadMessages;

		this.element = this.shadowRoot.querySelector(".contact");
		this.element.addEventListener("click", () =>
		{
			const event = new CustomEvent("contactselect", {detail: this.contact, bubbles: true});
			this.dispatchEvent(event);
		});

		const statusComponent = new UserStatus();
		statusComponent.update(this.contact);
		statusComponent.className = "contact-status";
		this.statusElement = statusComponent;

		const notificationIcon = this.element.querySelector(".notification-icon");
		notificationIcon.parentNode.insertBefore(statusComponent, notificationIcon);

		this.avatarElement = this.shadowRoot.querySelector(".avatar");

		this.draw();
	}

	/**
	 * @param {Contact} contact
	 */
	update(contact)
	{
		this.contact = contact;
		this.draw();
	}

	draw()
	{
		const name = this.shadowRoot.querySelector(".contact-name");
		name.textContent = this.contact.name;
		name.title = this.contact.name;

		this.statusElement.update(this.contact);

		const statusMsg = this.shadowRoot.querySelector(".contact-status-message");
		statusMsg.textContent = this.contact.statusMessage;
		statusMsg.title = this.contact.statusMessage;

		const avatarsPath = localStorage.getItem("avatarsPath");
		this.avatarElement.style.backgroundImage = `url(${avatarsPath}/${this.contact.publicKey.toUpperCase()}.png)`;
	}

	/**
	 * @param {boolean} isActive
	 */
	setActive(isActive)
	{
		let contact = this.shadowRoot.querySelector(".contact");
		this.numUnreadMessages = 0;

		if (isActive)
		{
			if (!contact.classList.contains("active"))
				contact.classList.add("active");
		} else
		{
			if (contact.classList.contains("active"))
				contact.classList.remove("active");
		}
	}

	/**
	 * @param {boolean} hasUnreadMessages
	 */
	setNotification(hasUnreadMessages)
	{
		this.numUnreadMessages++;

		let contact = this.shadowRoot.querySelector(".contact");
		let notification = this.shadowRoot.querySelector(".notification-icon");
		let counter = this.shadowRoot.querySelector(".counter");

		if (hasUnreadMessages)
		{
			if (!contact.classList.contains("notification"))
				contact.classList.add("notification");

			if (notification.classList.contains("hidden"))
				notification.classList.remove("hidden");

			if (this.numUnreadMessages > 99)
				counter.textContent = "99+";
			else
				counter.textContent = this.numUnreadMessages;
		} else
		{
			if (contact.classList.contains("notification"))
				contact.classList.remove("notification");

			if (!notification.classList.contains("hidden"))
				notification.classList.add("hidden");

			counter.textContent = "";
		}
	}
}

export default ContactComponent;