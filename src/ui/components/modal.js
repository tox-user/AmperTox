class Modal
{
	constructor(id)
	{
		this.id = id;
		this.element = document.getElementById(id);
		this.isVisible = false;

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
		this.element.classList.remove("hidden");
		this.isVisible = true;
	}

	hide(self=null)
	{
		if (self == null)
			self = this;

		self.element.classList.add("hidden");
		self.isVisible = false;
	}
}

export default Modal;