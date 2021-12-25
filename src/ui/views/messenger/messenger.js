import Component from "../../components/component";
import htmlTemplate from "./messenger.html";
import stylesheet from "!!css-loader!./messenger.css";

class Messenger extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.contact = null;
		this.isVisible = false;
		this.element = this.shadowRoot.querySelector(".messenger");

		this.chatlog = this.shadowRoot.querySelector("#chatlog");
		this.chatbox = this.shadowRoot.querySelector("#chatbox");
		this.chatbox.addEventListener("sendmessage", (e) =>
		{
			this.dispatchEvent(new CustomEvent("sendmessage", {detail: e.detail}));
		});
		this.chatbox.addEventListener("sendfile", (e) =>
		{
			this.dispatchEvent(new CustomEvent("sendfile", {detail: e.detail}));
		});

		this.shadowRoot.querySelector(".chatlog-container").addEventListener("scroll", (e) =>
		{
			if (e.target.scrollTop == 0)
			{
				console.log(e.target.scrollTop);
				console.log(this.chatlog.amountMessages, this.chatlog.contact);
				this.chatlog.amountMessages += 20;
				const data = {contactId: this.chatlog.contact.id, amount: this.chatlog.amountMessages};
				window.ipc.send("load-more-messages", data);
			}
		});

		window.ipc.on("message", (message) =>
		{
			if (this.contact && this.contact.id == message.contactId)
				this.addMessage(message);

			if (!document.hasFocus())
			{
				const assetsPath = sessionStorage.getItem("assetsPath");
				new Audio(`${assetsPath}/incoming-message.wav`).play();
			}
		});

		window.ipc.on("friend-status-change", (partialContact) => this.updateContactOnEvent(partialContact));
		window.ipc.on("friend-status-message-change", (partialContact) => this.updateContactOnEvent(partialContact));
		window.ipc.on("friend-name-change", (partialContact) => this.updateContactOnEvent(partialContact));
		window.ipc.on("friend-connection-status-change", (partialContact) => this.updateContactOnEvent(partialContact));
		window.ipc.on("friend-avatar-receive", (partialContact) => this.draw());
	}

	show()
	{
		this.isVisible = true;
		this.element.classList.remove("hidden");
	}

	draw()
	{
		this.element.querySelector(".name").textContent = this.contact.name;
		const status = this.element.querySelector("#status");
		status.update(this.contact);
		this.element.querySelector(".status-message").textContent = this.contact.statusMessage;

		const avatarsPath = sessionStorage.getItem("avatarsPath");
		this.element.querySelector(".avatar").style.backgroundImage = `url(${avatarsPath}/${this.contact.publicKey.toUpperCase()}.png)`;
	}

	/**
	 * @param {{id: number}} partialContact
	 */
	updateContact(partialContact)
	{
		this.contact = {...this.contact, ...partialContact};
		this.draw();
	}

	/**
	 * @param {{id: number}} partialContact
	 */
	updateContactOnEvent(partialContact)
	{
		if (this.contact != null && partialContact.id == this.contact.id)
		{
			this.updateContact(partialContact);
		}
	}

	updateMessages(msgs, username, publicKey, isFirstLoad)
	{
		this.chatlog.update(this.contact, msgs, username, publicKey, isFirstLoad);
	}

	addMessage(msg)
	{
		this.chatlog.addMessage(msg, this.chatlog);
	}
}

export default Messenger;