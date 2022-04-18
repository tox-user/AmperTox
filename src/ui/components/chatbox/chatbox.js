import Component from "../component";
import htmlTemplate from "./chatbox.html";
import stylesheet from "./chatbox.css";

class Chatbox extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.textarea = this.shadowRoot.querySelector("textarea");
		this.sendBtn = this.shadowRoot.querySelector(".send-btn");
		const fileBtn = this.shadowRoot.querySelector(".file-btn");
		const fileInput = this.shadowRoot.querySelector("#file-input");

		this.textarea.addEventListener("input", () => this.update(this));
		this.textarea.addEventListener("keydown", (e) => this.keyDown(this, e));

		this.sendBtn.disabled = true;
		this.sendBtn.addEventListener("click", () => this.sendMessage(this));

		fileInput.addEventListener("change", (e) => this.sendFile(e, this));

		fileBtn.addEventListener("click", () =>
		{
			fileInput.click();
		});
	}

	update(self)
	{
		if (self.textarea.value == "")
			self.sendBtn.disabled = true;
		else
			self.sendBtn.disabled = false;

		// expand textarea each time user inserts a new line
		const amountNewLines = self.textarea.value.split("\n").length;
		self.textarea.rows = Math.max(1, amountNewLines);
	}

	keyDown(self, e)
	{
		if (e.key == "Enter" && !e.shiftKey)
		{
			e.preventDefault();

			if (!self.sendBtn.disabled)
				self.sendMessage(self);
		}
	}

	sendMessage(self)
	{
		self.dispatchEvent(new CustomEvent("sendmessage", {detail: self.textarea.value}));
		self.textarea.value = "";
		self.update(self);
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