import Component from "../component";
import htmlTemplate from "./chatlog.html";
import stylesheet from "!!css-loader!./chatlog.css";
import MessageThread from "../messageThread/messageThread";

class Chatlog extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.threadsElement = this.shadowRoot.querySelector(".threads");
		this.contact = null;
		this.username = "";
		this.publicKey = "";
		this.isTyping = false;
		this.lastThread = null;
		this.lastContactId = null;
		this.lastDate = new Date();
		this.amountMessages = 20;
	}

	draw(messages, isFirstLoad=true)
	{
		// clear the list
		while(this.threadsElement.lastChild)
		{
			this.threadsElement.removeChild(this.threadsElement.lastChild);
		}

		messages.forEach((message) => this.addMessage(message, this));
		this.drawIsTyping(this.contact);

		if (isFirstLoad)
			this.shadowRoot.querySelector("#chatlog-end").scrollIntoView();
	}

	addMessage(message, self)
	{
		let lastContactId = self.lastContactId;
		let thread = self.lastThread;
		let contact = {...self.contact};
		const isSameDay = message.date.getDate() == self.lastDate.getDate();

		if (message.contactId != lastContactId || !isSameDay)
		{
			if (message.contactId == -1)
			{
				contact.name = this.username;
				contact.publicKey = this.publicKey;
			}

			thread = new MessageThread(contact);
			self.threadsElement.appendChild(thread);
		}

		thread.addMessage(message);
		lastContactId = message.contactId;

		self.lastThread = thread;
		self.lastContactId = lastContactId;
		self.lastDate = message.date;

		self.shadowRoot.querySelector("#chatlog-end").scrollIntoView();
	}

	update(contact, messages, username, publicKey, isFirstLoad)
	{
		this.contact = contact;
		this.username = username;
		this.publicKey = publicKey;
		this.draw(messages, isFirstLoad);
	}

	updateAvatars()
	{
		this.shadowRoot.querySelectorAll(".avatar").forEach((avatar) =>
		{
			const avatarsPath = sessionStorage.getItem("avatarsPath");
			avatar.style.backgroundImage = `url(${avatarsPath}/${contact.publicKey.toUpperCase()}.png)`;
		});
	}

	drawIsTyping()
	{
		const notification = this.shadowRoot.querySelector(".typing-notification");
		const name = notification.querySelector(".name");
		name.textContent = this.contact.name;

		if (this.isTyping)
		{
			if (notification.classList.contains("hidden"))
				notification.classList.remove("hidden");
		} else
		{
			if (!notification.classList.contains("hidden"))
				notification.classList.add("hidden");
		}
	}

	setIsTyping(isTyping)
	{
		this.isTyping = isTyping;
		this.drawIsTyping();
	}
}

export default Chatlog;