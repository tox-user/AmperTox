import ModalComponent from "../modal/modal.component";
import htmlTemplate from "./pendingInvitesModal.component.html";
import stylesheet from "./pendingInvitesModal.component.css";
import FriendRequestComponent from "../friendRequest/friendRequest.component";

class PendingInvitesModalComponent extends ModalComponent
{
	constructor()
	{
		super("Pending Invites", htmlTemplate, stylesheet);

		this.friendRequests = [];
		this.element = this.shadowRoot.querySelector(".invites");
		this.friendRequestCounter = this.element.querySelector("#num-friend-requests");
		this.friendRequestUl = this.element.querySelector(".friend-requests");

		window.ipc.on("friend-request", (data) => this.addFriendRequest(data.publicKey, data.message, this));
	}

	addFriendRequest(publicKey, message, self)
	{
		self.friendRequests.push({publicKey, message});
		self.drawFriendRequests();
	}

	removeFriendRequest(publicKey)
	{
		const index = this.friendRequests.findIndex((req) => req.publicKey == publicKey);
		if (index => 0)
		{
			this.friendRequests.splice(index, 1);
			this.drawFriendRequests();
		}
	}

	drawFriendRequests()
	{
		let counterMessage = `${this.friendRequests.length} Friend Request`;
		if (this.friendRequests.length > 1)
			counterMessage += "s";

		if (this.friendRequests.length == 0)
			this.hide();

		this.friendRequestCounter.textContent = counterMessage;

		while(this.friendRequestUl.firstChild)
		{
			this.friendRequestUl.removeChild(this.friendRequestUl.lastChild);
		}

		this.friendRequests.forEach((req) =>
		{
			const requestComponent = new FriendRequestComponent(req.publicKey, req.message, this.onAcceptFriendRequest, this.onDeclineFriendRequest, this);
			this.friendRequestUl.appendChild(requestComponent);
		});
	}

	onAcceptFriendRequest(publicKey, self)
	{
		window.ipc.send("accept-friend-request", {publicKey});
		self.removeFriendRequest(publicKey);
	}

	onDeclineFriendRequest(publicKey, self)
	{
		window.ipc.send("decline-friend-request", {publicKey});
		self.removeFriendRequest(publicKey);
	}
}

export default PendingInvitesModalComponent;