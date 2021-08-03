class Component extends HTMLElement
{
	constructor(htmlTemplate, stylesheet="")
	{
		super();

		this.attachShadow({mode: "open"});

		const element = document.createElement("template");
		element.innerHTML = htmlTemplate;

		if (stylesheet != "" && stylesheet != null)
		{
			const styleElement = document.createElement("style");
			styleElement.innerHTML = stylesheet.toString();
			this.shadowRoot.append(styleElement);
		}

		// this.element = element.content.cloneNode(true);
		this.shadowRoot.append(element.content.cloneNode(true));
		// this.isVisible = true;
	}

	// show()
	// {
	// 	this.isVisible = true;
	// 	if (this.element.classList.contains("hidden"))
	// 		this.element.classList.remove("hidden");
	// }

	// hide()
	// {
	// 	this.isVisible = false;
	// 	console.log(this.shadowRoot, this.shadowRoot.classList);
	// 	if (!this.element.classList.contains("hidden"))
	// 		this.element.classList.add("hidden");
	// }
}

export default Component;