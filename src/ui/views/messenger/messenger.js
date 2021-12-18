import Component from "../../components/component";
import htmlTemplate from "./messenger.html";
import stylesheet from "!!css-loader!./messenger.css";

class Messenger extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);
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
	}

	show()
	{
		this.isVisible = true;
		this.element.classList.remove("hidden");
	}

	update(contact, msgs, username, publicKey, isFirstLoad)
	{
		this.element.querySelector(".name").textContent = contact.name;
		const status = this.element.querySelector("#status");
		status.update(contact);
		this.element.querySelector(".status-message").textContent = contact.statusMessage;

		const avatarsPath = sessionStorage.getItem("avatarsPath");
		this.element.querySelector(".avatar").style.backgroundImage = `url(${avatarsPath}/${contact.publicKey.toUpperCase()}.png)`;

		if (msgs)
			this.chatlog.update(contact, msgs, username, publicKey, isFirstLoad);
	}

	addMessage(msg)
	{
		this.chatlog.addMessage(msg, this.chatlog);
	}
}

export default Messenger;