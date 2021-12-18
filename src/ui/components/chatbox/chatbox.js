import Component from "../component";
import htmlTemplate from "./chatbox.html";
import stylesheet from "!!css-loader!./chatbox.css";

class Chatbox extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.textarea = this.shadowRoot.querySelector("textarea");
		const sendBtn = this.shadowRoot.querySelector(".send-btn");
		const fileBtn = this.shadowRoot.querySelector(".file-btn");
		const fileInput = this.shadowRoot.querySelector("#file-input");

		this.textarea.addEventListener("keydown", (e) => this.keyDown(this, e));
		sendBtn.addEventListener("click", () => this.sendMessage(this));
		fileInput.addEventListener("change", (e) => this.sendFile(e, this));

		fileBtn.addEventListener("click", () =>
		{
			fileInput.click();
		});
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

	sendFile(e, self)
	{
		const files = e.target.files;
		for (let file of files)
		{
			self.dispatchEvent(new CustomEvent("sendfile", {detail: file}));
		}
	}
}

export default Chatbox;