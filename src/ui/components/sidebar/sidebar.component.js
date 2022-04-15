import Component from "../component";
import htmlTemplate from "./sidebar.component.html";
import stylesheet from "!!css-loader!./sidebar.component.css";

class SidebarComponent extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);

		this.connectionStatusElement = this.shadowRoot.querySelector("ui-user-status");
		this.statusMessageElement = this.shadowRoot.querySelector("#status-message");
		this.usernameElement = this.shadowRoot.querySelector("#username");
		this.avatarElement = this.shadowRoot.querySelector(".user-avatar");
		this.contactListElement = this.shadowRoot.querySelector("#contact-list");

		this.shadowRoot.querySelector("#add-friend-btn").addEventListener("click", () => {
			document.querySelector("#add-contact-modal").show();
		});

		this.connectionStatusElement.update({connectionStatus: 0, status: 0}); // set initial offline status
		window.ipc.on("status-change", (data) => this.connectionStatusElement.update(data));
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
}

export default SidebarComponent;