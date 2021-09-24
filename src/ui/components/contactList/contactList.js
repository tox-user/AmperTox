import Component from "../component.js";
import htmlTemplate from "./contactList.html";
import stylesheet from "!!css-loader!./contactList.css";
import ContactComponent from "../contact/contact.component";

class ContactList extends Component
{
	/**
	 * @typedef {import('../../../models/contact')} Contact
	 * @param {Contact[]} contactList
	 */
	constructor(contactList = [])
	{
		super(htmlTemplate, stylesheet);
		this.contactList = contactList.sort(this.sortFunction);
		this.listElement = this.shadowRoot.querySelector("#contact-list");

		this.drawContacts();
	}

	/**
	 * @param {Contact[]} contactList
	 * @param {number} activeContact
	 */
	update(contactList, activeContact)
	{
		this.contactList = contactList.sort(this.sortFunction);
		this.drawContacts(activeContact);
	}

	/**
	 * @param {number} activeContact
	 */
	drawContacts(activeContact=null)
	{
		// clear the list
		while(this.listElement.lastChild)
		{
			this.listElement.removeChild(this.listElement.lastChild);
		}

		let noContactsMessage = this.shadowRoot.querySelector("#no-contacts-message");
		if (this.contactList.length > 0)
		{
			noContactsMessage.classList.add("hidden");
		} else
		{
			if (noContactsMessage.classList.contains("hidden"))
				noContactsMessage.classList.remove("hidden");
		}

		this.contactList.forEach(contact =>
		{
			const component = new ContactComponent(contact);
			component.addEventListener("contactselect", (e) => this.contactSelected(this, e));

			if (activeContact != null && contact.id == activeContact)
				component.setActive(true);

			this.listElement.appendChild(component);
		});
	}

	updateContact(contact)
	{
		const elements = this.listElement.querySelectorAll("ui-contact");
		for(let i = 0; i < elements.length; i++)
		{
			if (elements[i].dataset.contactId == contact.id)
			{
				elements[i].update(contact);
				return;
			}
		}
	}

	/**
	 * @param {ContactList} self
	 * @param {*} e
	 */
	contactSelected(self, e)
	{
		const event = new CustomEvent("contactselect", {detail: e.detail});
		self.dispatchEvent(event);

		let children = this.listElement.children;
		for (let i = 0; i < children.length; i++)
		{
			children[i].setActive(false);
		}

		const contact = e.detail;
		contact.numUnreadMessages = 0;
		e.target.update(contact);
		e.target.setActive(true);
	}

	/**
	 * @param {Contact} a
	 * @param {Contact} b
	 * @returns {number}
	 */
	sortFunction(a, b)
	{
		if (a.connectionStatus != 0 && b.connectionStatus == 0)
			return -1;

		if (b.connectionStatus != 0 && a.connectionStatus == 0)
			return 1;

		if (a.name > b.name)
			return 1;

		if (b.name > a.name)
			return -1;

		return 0;
	}
}

export default ContactList;