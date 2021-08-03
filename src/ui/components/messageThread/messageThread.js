import Component from "../component";
import htmlTemplate from "./messageThread.html";
import stylesheet from "!!css-loader!./messageThread.css";
import Message from "../message/message";

class MessageThread extends Component
{
	constructor(contact)
	{
		super(htmlTemplate, stylesheet);
		this.messagesElement = this.shadowRoot.querySelector(".messages");
		this.avatarElement = this.shadowRoot.querySelector(".avatar");
		this.contact = contact;
		this.draw();
	}

	draw()
	{
		const nameElement = this.shadowRoot.querySelector(".name");
		nameElement.textContent = this.contact.name;

		const avatarsPath = localStorage.getItem("avatarsPath");
		this.avatarElement.style.backgroundImage = `url(${avatarsPath}/${this.contact.publicKey.toUpperCase()}.png)`;
	}

	addMessage(message)
	{
		let messageComponent = new Message(message);
		this.messagesElement.appendChild(messageComponent);
	}
}

export default MessageThread;