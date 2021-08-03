import Component from "../component";
import htmlTemplate from "./chatbox.html";
import stylesheet from "!!css-loader!./chatbox.css";

class Chatbox extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.textarea = this.shadowRoot.querySelector("textarea");
		let sendBtn = this.shadowRoot.querySelector(".send-btn");

		this.textarea.addEventListener("keydown", (e) => this.keyDown(this, e));
		sendBtn.addEventListener("click", () => this.sendMessage(this));
	}

	keyDown(self, e)
	{
		if (e.key == "Enter" && !e.shiftKey)
		{
			e.preventDefault();
			self.sendMessage(self);
		}
	}

	sendMessage(self)
	{
		self.dispatchEvent(new CustomEvent("sendmessage", {detail: self.textarea.value}));
		self.textarea.value = "";
	}
}

export default Chatbox;