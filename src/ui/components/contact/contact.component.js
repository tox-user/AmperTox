import Component from "../component.js";
import htmlTemplate from "./contact.component.html";
import stylesheet from "!!css-loader!./contact.component.css";
import UserStatusComponent from "../userStatus/userStatus.component";

class ContactComponent extends Component
{
	/**
	 * Contact component
	 * @typedef {import('../../../models/contact')} Contact
	 * @param {Contact} contact
	 */
	constructor(contact)
	{
		super(htmlTemplate, stylesheet);

		this.contact = contact;
		this.dataset.contactId = this.contact.id;

		this.element = this.shadowRoot.querySelector(".contact");
		this.element.addEventListener("click", () =>
		{
			const event = new CustomEvent("contactselect", {detail: this.contact, bubbles: true});
			this.dispatchEvent(event);
		});

		// TODO: add proper context menu with a button to remove contact
		// this.element.addEventListener("contextmenu", () => {
		// 	console.log("removing contact");
		// 	window.ipc.send("remove-contact", {contactId: contact.id});
		// });

		const statusComponent = new UserStatusComponent();
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

		const avatarsPath = sessionStorage.getItem("avatarsPath");
		this.avatarElement.style.backgroundImage = `url(${avatarsPath}/${this.contact.publicKey.toUpperCase()}.png)`;

		const contactElement = this.shadowRoot.querySelector(".contact");
		const notificationElement = this.shadowRoot.querySelector(".notification-icon");
		const counterElement = this.shadowRoot.querySelector(".counter");

		if (this.contact.numUnreadMessages > 0)
		{
			if (!contactElement.classList.contains("notification"))
				contactElement.classList.add("notification");

			notificationElement.classList.remove("hidden");

			if (this.contact.numUnreadMessages > 99)
				counterElement.textContent = "99+";
			else
				counterElement.textContent = this.contact.numUnreadMessages;
		} else
		{
			contactElement.classList.remove("notification");

			if (!notificationElement.classList.contains("hidden"))
				notificationElement.classList.add("hidden");

			counterElement.textContent = "";
		}
	}

	/**
	 * @param {boolean} isActive
	 */
	setActive(isActive)
	{
		let contact = this.shadowRoot.querySelector(".contact");

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
}

export default ContactComponent;