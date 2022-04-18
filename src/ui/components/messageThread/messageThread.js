import Component from "../component";
import htmlTemplate from "./messageThread.html";
import stylesheet from "./messageThread.css";
import MessageComponent from "../message/message.component";
import { messageDateTimeString } from '../../dateUtils';

class MessageThread extends Component
{
	constructor(contact, date)
	{
		super(htmlTemplate, stylesheet);
		this.messagesElement = this.shadowRoot.querySelector(".messages");
		this.avatarElement = this.shadowRoot.querySelector(".avatar");
		this.contact = contact;
		this.date = date;
		this.draw();
	}

	draw()
	{
		const nameElement = this.shadowRoot.querySelector(".name");
		nameElement.textContent = this.contact.name;

		const dateElement = this.shadowRoot.querySelector(".date");
		dateElement.textContent = messageDateTimeString(this.date);

		const avatarsPath = sessionStorage.getItem("avatarsPath");
		this.avatarElement.style.backgroundImage = `url(${avatarsPath}/${this.contact.publicKey.toUpperCase()}.png)`;
	}

	addMessage(message)
	{
		const messageComponent = new MessageComponent(message);
		this.messagesElement.appendChild(messageComponent);
	}
}

export default MessageThread;