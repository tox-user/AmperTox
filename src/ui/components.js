import Contact from "./components/contact/contact.component";
import ContactList from "./components/contactList/contactList";
import Chatbox from "./components/chatbox/chatbox";
import Chatlog from "./components/chatlog/chatlog";
import MessageComponent from "./components/message/message.component";
import Messenger from "./views/messenger/messenger";
import UserStatusComponent from "./components/userStatus/userStatus.component";
import MessageThread from "./components/messageThread/messageThread";
import Welcome from "./views/welcome/welcome";
import ModalComponent from "./components/modal/modal.component";
import TopbarComponent from "./components/topbar/topbar.component";
import AddContactModalComponent from "./components/addContactModal/addContactModal.component";
import FriendRequestComponent from "./components/friendRequest/friendRequest.component";
import PendingInvitesModalComponent from "./components/pendingInvitesModal/pendingInvitesModal.component";
import SidebarComponent from "./components/sidebar/sidebar.component";

const components = [
	{selector: "ui-contact", component: Contact},
	{selector: "ui-contact-list", component: ContactList},
	{selector: "ui-chatbox", component: Chatbox},
	{selector: "ui-chatlog", component: Chatlog},
	{selector: "ui-message", component: MessageComponent},
	{selector: "ui-messenger", component: Messenger},
	{selector: "ui-user-status", component: UserStatusComponent},
	{selector: "ui-message-thread", component: MessageThread},
	{selector: "ui-welcome", component: Welcome},
	{selector: "ui-modal", component: ModalComponent},
	{selector: "ui-topbar", component: TopbarComponent},
	{selector: "ui-add-contact-modal", component: AddContactModalComponent},
	{selector: "ui-friend-request", component: FriendRequestComponent},
	{selector: "ui-pending-invites-modal", component: PendingInvitesModalComponent},
	{selector: "ui-sidebar", component: SidebarComponent}
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