import Component from "../component";
import htmlTemplate from "./message.component.html";
import stylesheet from "!!css-loader!./message.component.css";

class MessageComponent extends Component
{
	constructor(message)
	{
		super(htmlTemplate, stylesheet);
		this.message = message;

		const text = this.shadowRoot.querySelector(".message-text");
		const sanitizedMessage = this.sanitizeInput(message.message);
		const parsedMessage = this.parseMessage(sanitizedMessage);
		text.innerHTML = parsedMessage;

		const date = this.shadowRoot.querySelector(".date");
		date.textContent = message.date.toLocaleTimeString();
	}

	sanitizeInput(string)
	{
		const element = document.createElement("span");
		element.innerText = string;
		return element.innerHTML;
	}

	parseMessage(messageText)
	{
		let newString = messageText;

		// parse links
		const urlRegex = /(https?:\/\/[^\s]+)/;
		const linkHtml = '<a href="$1">$1</a>';
		newString = newString.replace(urlRegex, linkHtml);

		// parse block quote
		const blockQuoteRegex = /^&gt; (.*$)/gim;
		const blockQuoteHtml = '<blockquote>$1</blockquote>';
		newString = newString.replace(blockQuoteRegex, blockQuoteHtml);

		// parse indented code blocks
		const codeBlockRegex = /^((?:(?:[ ]{4}|\t).*(\R|$))+)/;
		const codeBlockHtml = '<pre>$1</pre>';
		newString = newString.replace(codeBlockRegex, codeBlockHtml);

		// parse fenced code block
		const fencedCodeBlockRegex = /```(.*?)```/gm;
		const fencedCodeBlockHtml = '<pre>$1</pre>';
		newString = newString.replace(fencedCodeBlockRegex, fencedCodeBlockHtml);

		// parse inline code
		const codeInlineRegex = /`(.*?)`/;
		const codeInlineHtml = '<code>$1</code>';
		newString = newString.replace(codeInlineRegex, codeInlineHtml);

		// parse bold text
		const boldRegex = /\*\*(.*?)\*\*/;
		const boldHtml = '<strong>$1</strong>';
		newString = newString.replace(boldRegex, boldHtml);

		// parse italic text
		const italicRegex = /\*(.*?)\*/;
		const italicHtml = '<em>$1</em>';
		newString = newString.replace(italicRegex, italicHtml);

		return newString;
	}
}

export default MessageComponent;