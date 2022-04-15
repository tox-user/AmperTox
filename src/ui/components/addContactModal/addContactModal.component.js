import ModalComponent from "../modal/modal.component";
import htmlTemplate from "./addContactModal.component.html";
import style from "!!css-loader!./addContactModal.component.css";

class AddContactModalComponent extends ModalComponent
{
	constructor()
	{
		super("Add Friend", htmlTemplate, style);

		this.defaultMessage = "Hi, my name is ___. Please accept my friend request.";

		this.element = this.shadowRoot.querySelector(".add-contact-modal");
		this.toxIdInput = this.element.querySelector(".tox-id-input");
		this.messageInput = this.element.querySelector(".message-input");
		this.sendButton = this.element.querySelector(".send-friend-request-btn");
		this.toxIdInput.addEventListener("input", () => this.onToxIdInput(this));
		this.sendButton.addEventListener("click", () => this.sendFriendRequest(this));
		this.resetInputValues();
	}

	sendFriendRequest(self)
	{
		const toxId = self.toxIdInput.value;
		const message = self.messageInput.value;
		window.ipc.send("send-friend-request", {toxId, message});
		self.hide(); // close modal
	}

	isValidToxId(string)
	{
		if (string == null || string == "" || string.length != 76)
			return false;

		const regex = /^[A-F0-9]+$/i;
		return regex.test(string);
	}

	onToxIdInput(self)
	{
		if (self.isValidToxId(self.toxIdInput.value))
			self.sendButton.disabled = false;
		else
			self.sendButton.disabled = true;
	}

	resetInputValues()
	{
		this.toxIdInput.value = "";
		this.messageInput.value = this.defaultMessage;
	}

	hide()
	{
		super.hide();
		this.resetInputValues();
	}
}

export default AddContactModalComponent;