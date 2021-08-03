import Component from "../component.js";
import htmlTemplate from "./contactList.html";
import stylesheet from "!!css-loader!./contactList.css";
import Contact from "../contact/contact";

class ContactList extends Component
{
	constructor(contactList = [])
	{
		super(htmlTemplate, stylesheet);
		this.contactList = contactList.sort(this.sortFunction);
		this.listElement = this.shadowRoot.querySelector("#contact-list");;

		this.drawContacts();
	}

	update(contactList, activeContact)
	{
		this.contactList = contactList.sort(this.sortFunction);
		this.drawContacts(activeContact);
	}

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
			const component = new Contact(contact);
			component.addEventListener("contactselect", (e) => this.contactSelected(this, e));

			if (activeContact != null && contact.id == activeContact)
				component.setActive(true);

			this.listElement.appendChild(component);
		});
	}

	contactSelected(self, e)
	{
		const event = new CustomEvent("contactselect", {detail: e.detail});
		self.dispatchEvent(event);

		let children = this.listElement.children;
		for (let i = 0; i < children.length; i++)
		{
			children[i].setActive(false);
		}

		e.target.setActive(true);
		e.target.setNotification(false);
	}

	contactAddNotification(contactId)
	{
		let children = this.listElement.children;
		for (let i = 0; i < children.length; i++)
		{
			if (children[i].contact.id == contactId)
			{
				children[i].setNotification(true);
				break;
			}
		}
	}

	createDesktopNotification(contactId, messageContent)
	{
		let children = this.listElement.children;
		for (let i = 0; i < children.length; i++)
		{
			if (children[i].contact.id == contactId)
			{
				const contactName = children[i].contact.name;
				// new Notification(`Message from ${contactName}`, {body: messageContent}).onclick(() => children[i].click());
				new Notification(`Message from ${contactName}`, {body: messageContent});
				break;
			}
		}
	}

	/*updateContact(contact)
	{
		let children = this.listElement.children;
		if (!children)
			return;

		for (let i = 0; i < children.length; i++)
		{
			if (children[i].contact.id == contact.id)
				children[i].update(contact);
		}
	}*/

	sortFunction(a, b)
	{
		if (a.connectionStatus != 0 && b.connectionStatus == 0)
			return -1;

		if (b.connectionStatus != 0 && a.connectionStatus == 0)
			return 1;

		// if (a.status < b.status)
		// 	return 1;

		// if (b.status < a.status)
		// 	return -1;

		if (a.name > b.name)
			return 1;

		if (b.name > a.name)
			return -1;

		return 0;
	}
}

export default ContactList;