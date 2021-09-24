import Component from "../component.js";
import htmlTemplate from "./modal.component.html";
import stylesheet from "!!css-loader!./modal.component.css";

class ModalComponent extends Component
{
	constructor(title="", content=null, style=null)
	{
		super(htmlTemplate, stylesheet);
		this.element = this.shadowRoot.querySelector(".modal");
		this.isVisible = false;

		this.element.querySelector(".modal-title").textContent = title;
		if (content)
		{
			this.element.querySelector(".modal-content-container").innerHTML = content;
			if (style != "" && style != null)
			{
				const styleElement = document.createElement("style");
				styleElement.innerHTML = style.toString();
				this.shadowRoot.append(styleElement);
			}
		}

		this.element.querySelector(".close-btn").addEventListener("click", () => this.hide(this));
		window.addEventListener("keydown", (e) =>
		{
			if (e.key == "Escape")
				this.hide();
		});
	}

	toggle()
	{
		if (this.isVisible)
			this.hide();
		else
			this.show();
	}

	show()
	{
		this.shadowRoot.querySelector(".modal").classList.remove("hidden");
		this.isVisible = true;
	}

	hide(self=null)
	{
		if (self == null)
			self = this;

		self.shadowRoot.querySelector(".modal").classList.add("hidden");
		self.isVisible = false;
	}
}

export default ModalComponent;