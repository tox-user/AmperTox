import Component from "../component";
import htmlTemplate from "./message.html";
import stylesheet from "!!css-loader!./message.css";

class Message extends Component
{
	constructor(message)
	{
		super(htmlTemplate, stylesheet);
		this.message = message;

		const text = this.shadowRoot.querySelector(".message-text");
		text.textContent = message.message;

		const date = this.shadowRoot.querySelector(".date");
		date.textContent = message.date.toLocaleTimeString();
	}
}

export default Message;