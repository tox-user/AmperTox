import Component from "../component.js";
import htmlTemplate from "./contactList.html";
import stylesheet from "./contactList.css";
import ContactComponent from "../contact/contact.component";
/** @typedef {import('../../../models/contact')} Contact */

class ContactList extends Component
{
	/**
	 * @param {Contact[]} contactList
	 */
	constructor(contactList = [])
	{
		super(htmlTemplate, stylesheet);
		this.contactList = contactList.sort(this.sortFunction);
		this.activeContact = null;
		this.listElement = this.shadowRoot.querySelector("#contact-list");

		this.drawContacts();

		window.ipc.on("data", (data) => this.update(data.contacts, null));
		window.ipc.on("add-contact", (contact) => this.addContact(contact));
		window.ipc.on("remove-contact", (partialContact) => this.removeContact(partialContact.id));
		window.ipc.on("friend-name-change", (partialContact) => this.updateContact(partialContact));
		window.ipc.on("friend-status-change", (partialContact) => this.updateContact(partialContact));
		window.ipc.on("friend-connection-status-change", (partialContact) => this.updateContact(partialContact));
		window.ipc.on("friend-avatar-receive", (partialContact) => this.drawContacts(this.activeContact));

		window.ipc.on("friend-status-message-change", (partialContact) =>
		{
			const index = this.contactList.findIndex((c) => c.id == partialContact.id);
			this.contactList[index].statusMessage = partialContact.statusMessage;
			this.drawContacts(this.activeContact);
		});

		window.ipc.on("message", (message) =>
		{
			if (this.activeContact != message.contactId)
			{
				const index = this.contactList.findIndex((c) => c.id == message.contactId);
				this.contactList[index].numUnreadMessages++;
				this.drawContacts(this.activeContact);
			}
		});
	}

	/**
	 * @param {Contact} contact
	 */
	addContact(contact)
	{
		const updatedList = [...this.contactList, contact];
		this.update(updatedList, this.activeContact);
	}

	/**
	 * @param {number} contactId
	 */
	removeContact(contactId)
	{
		const contacts = [...this.contactList];
		let activeContact = this.activeContact;
		const index = this.contactList.findIndex((contact) => contact.id == contactId);
		contacts.splice(index, 1);
		if (activeContact == contactId)
			activeContact = null;

		this.update(contacts, activeContact);
	}

	/**
	 * @param {Contact[]} contactList
	 * @param {number} activeContact
	 */
	update(contactList, activeContact)
	{
		this.contactList = contactList.sort(this.sortFunction);
		this.activeContact = activeContact;
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
			component.addEventListener("contactselect", (e) => this.contactSelected(e));

			if (activeContact != null && contact.id == activeContact)
				component.setActive(true);

			this.listElement.appendChild(component);
		});
	}

	/**
	 * @param {{id: number}} partialContact
	 */
	updateContact(partialContact)
	{
		const index = this.contactList.findIndex((c) => c.id == partialContact.id);
		const {id, ...newContactData} = partialContact;
		const updatedContact = {...this.contactList[index], ...newContactData};
		this.contactList[index] = updatedContact;
		this.update(this.contactList, this.activeContact);
	}

	/**
	 * @param {any} e event
	 */
	contactSelected(e)
	{
		const event = new CustomEvent("contactselect", {detail: e.detail});
		this.dispatchEvent(event);

		let children = this.listElement.children;
		for (let i = 0; i < children.length; i++)
		{
			children[i].setActive(false);
		}

		const contact = e.detail;
		contact.numUnreadMessages = 0;
		e.target.update(contact);
		e.target.setActive(true);

		if (this.activeContact != contact.id)
		{
			this.activeContact = contact.id;
			window.ipc.send("messages-request", contact.id);
		}
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