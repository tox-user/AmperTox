import Component from "../component";
import htmlTemplate from "./friendRequest.component.html";
import stylesheet from "./friendRequest.component.css";

class FriendRequestComponent extends Component
{
	constructor(requestPk, requestMessage, onAccept, onDecline, parentComponent)
	{
		super(htmlTemplate, stylesheet);

		this.requestPk = requestPk;
		this.requestMessage = requestMessage;

		this.element = this.shadowRoot.querySelector(".friend-request");
		this.element.querySelector(".request-pk").textContent = this.requestPk;
		this.element.querySelector(".request-message").textContent = this.requestMessage;
		this.element.querySelector(".accept-request").addEventListener("click", () => onAccept(requestPk, parentComponent));
		this.element.querySelector(".decline-request").addEventListener("click", () => onDecline(requestPk, parentComponent));
	}
}

export default FriendRequestComponent;