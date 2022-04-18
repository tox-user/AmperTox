import Component from "../../components/component";
import htmlTemplate from "./welcome.html";
import stylesheet from "./welcome.css";

class Welcome extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.isVisible = true;
		this.element = this.shadowRoot.querySelector(".welcome");
	}
}

export default Welcome;