class Component extends HTMLElement
{
	/**
	 * Creates a new component
	 * @param {string} htmlTemplate
	 * @param {string} stylesheet
	 */
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

		this.shadowRoot.append(element.content.cloneNode(true));
		this.isVisible = true;
	}

	show()
	{
		this.isVisible = true;
		this.classList.remove("hidden");
	}

	hide()
	{
		this.isVisible = false;
		if (!this.classList.contains("hidden"))
			this.classList.add("hidden");
	}
}

export default Component;