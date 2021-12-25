import Component from "../component";
import htmlTemplate from "./topbar.component.html";
import stylesheet from "!!css-loader!./topbar.component.css";

class TopbarComponent extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.numFriendNotifications = 0;
		this.requestNotificationBtn = this.shadowRoot.querySelector(".request-notification-btn");
		this.notificationBtnTitle = this.requestNotificationBtn.querySelector(".notification-btn-title");

		this.shadowRoot.querySelector("#add-contact-btn").addEventListener("click", () => {
			document.querySelector("#add-contact-modal").show();
		});

		this.requestNotificationBtn.addEventListener("click", () => {
			document.querySelector("#pending-invites-modal").show();
		});

		window.ipc.on("friend-request", () => this.addFriendRequestNotification(this));
		window.ipc.on("remove-friend-request", () => this.removeFriendRequestNotification(this));
	}

	addFriendRequestNotification(self)
	{
		self.numFriendNotifications++;
		self.requestNotificationBtn.classList.remove("hidden");
		self.notificationBtnTitle.textContent = self.numFriendNotifications;

		if (!document.hasFocus())
		{
			const assetsPath = sessionStorage.getItem("assetsPath");
			new Audio(`${assetsPath}/incoming-message.wav`).play();
		}
	}

	removeFriendRequestNotification(self)
	{
		self.numFriendNotifications--;
		if (self.numFriendNotifications == 0)
		{
			if (!self.requestNotificationBtn.classList.contains("hidden"))
				self.requestNotificationBtn.classList.add("hidden");
		} else
		{
			self.notificationBtnTitle.textContent = self.numFriendNotifications;
		}
	}
}

export default TopbarComponent;