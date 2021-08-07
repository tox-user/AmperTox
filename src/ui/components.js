import Contact from "./components/contact/contact.component";
import ContactList from "./components/contactList/contactList";
import Chatbox from "./components/chatbox/chatbox";
import Chatlog from "./components/chatlog/chatlog";
import Message from "./components/message/message";
import Messenger from "./views/messenger/messenger";
import UserStatus from "./components/userStatus/userStatus";
import MessageThread from "./components/messageThread/messageThread";
import Welcome from "./views/welcome/welcome";

const components = [
	{selector: "ui-contact", component: Contact},
	{selector: "ui-contact-list", component: ContactList},
	{selector: "ui-chatbox", component: Chatbox},
	{selector: "ui-chatlog", component: Chatlog},
	{selector: "ui-message", component: Message},
	{selector: "ui-messenger", component: Messenger},
	{selector: "ui-user-status", component: UserStatus},
	{selector: "ui-message-thread", component: MessageThread},
	{selector: "ui-welcome", component: Welcome}
];

/**
 * Initializes custom components
 */
const initComponents = () =>
{
	components.forEach(component =>
	{
		customElements.define(component.selector, component.component);
	});
}

export default initComponents;