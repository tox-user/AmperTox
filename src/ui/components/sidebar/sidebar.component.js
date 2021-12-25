import Component from "../component";
import htmlTemplate from "./sidebar.component.html";
import stylesheet from "!!css-loader!./sidebar.component.css";

class SidebarComponent extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.connectionSpinnerElement = this.shadowRoot.querySelector("#connection-spinner");
		this.connectionStatusElement = this.shadowRoot.querySelector("#connection-status");
		this.statusMessageElement = this.shadowRoot.querySelector("#status-message");
		this.usernameElement = this.shadowRoot.querySelector("#username");
		this.avatarElement = this.shadowRoot.querySelector(".user-avatar");
		this.contactListElement = this.shadowRoot.querySelector("#contact-list");

		window.ipc.on("connection-status-change", (status) => this.updateStatus(status));
		window.ipc.on("data", (data) =>
		{
			this.updateUsername(data.username);
			this.updateStatusMessage(data.statusMessage);
			this.updateAvatar();
		});
	}

	updateUsername(newUsername)
	{
		this.usernameElement.textContent = newUsername;
		this.usernameElement.title = newUsername;
	}

	updateStatusMessage(newStatusMessage)
	{
		this.statusMessageElement.textContent = newStatusMessage;
		this.statusMessageElement.title = newStatusMessage;
	}

	updateAvatar()
	{
		const avatarsPath = sessionStorage.getItem("avatarsPath");
		const publicKey = sessionStorage.getItem("publicKey");
		this.avatarElement.style.backgroundImage = `url(${avatarsPath}/${publicKey.toUpperCase()}.png)`;
	}

	clearStatus()
	{
		if (!this.connectionSpinnerElement.classList.contains("hidden"))
			this.connectionSpinnerElement.classList.add("hidden");

		if (this.connectionStatusElement.classList.contains("online"))
			this.connectionStatusElement.classList.remove("online");

		if (this.connectionStatusElement.classList.contains("away"))
			this.connectionStatusElement.classList.remove("away");

		if (this.connectionStatusElement.classList.contains("busy"))
			this.connectionStatusElement.classList.remove("busy");

		if (this.connectionStatusElement.classList.contains("offline"))
			this.connectionStatusElement.classList.remove("offline");
	}

	updateStatus(newStatus)
	{
		this.clearStatus();

		if (newStatus != 0)
		{
			this.connectionStatusElement.classList.add("online");
			this.connectionStatusElement.textContent = "Online";
		} else
		{
			if (this.connectionSpinnerElement.classList.contains("hidden"))
				this.connectionSpinnerElement.classList.remove("hidden");

			if (!this.connectionSpinnerElement.classList.contains("offline"))
				this.connectionStatusElement.classList.add("offline");

			this.connectionStatusElement.textContent = "Offline";
		}
	}
}

export default SidebarComponent;