import Component from "../../components/component";
import htmlTemplate from "./welcome.html";
import stylesheet from "!!css-loader!./welcome.css";

class Welcome extends Component
{
	constructor()
	{
		super(htmlTemplate, stylesheet);
		this.isVisible = true;
		this.element = this.shadowRoot.querySelector(".welcome");
	}

	show()
	{
		if (!this.isVisible)
		{
			this.isVisible = true;
			this.element.classList.remove("hidden");
		}
	}

	hide()
	{
		if (this.isVisible)
		{
			this.isVisible = false;
			this.element.classList.add("hidden");
		}
	}
}

export default Welcome;