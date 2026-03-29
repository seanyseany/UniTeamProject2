import { Sparkles } from 'lucide-react';
import { groupMessages, privateMessages } from './data';

function MessageList({ messages }: { messages: typeof groupMessages }) {
  return (
    <div className="messages">
      {messages.map((message, index) => (
        <article className="message" key={`${message.author}-${index}`}>
          <div className="message-header">
            <strong>{message.author}</strong>
            <span className="muted">{message.time}</span>
          </div>
          <div>{message.text}</div>
          <div className="reaction-row">
            {message.reactions.map((reaction) => (
              <span className="reaction" key={reaction}>{reaction}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ChatPanel() {
  return (
    <div className="sidebar-stack">
      <section className="chat-card panel-padding">
        <div className="section-head">
          <div>
            <p className="muted">Communication feature</p>
            <h3>Group + private chat</h3>
          </div>
          <div className="chat-tabs">
            <button className="chat-tab active">Group</button>
            <button className="chat-tab">Private</button>
          </div>
        </div>

        <MessageList messages={groupMessages} />

        <div className="composer">
          <input value="Use reactions for quick replies to reduce clutter…" readOnly />
          <button className="primary-btn">Send</button>
        </div>
      </section>

      <section className="private-card panel-padding">
        <div className="section-head">
          <div>
            <p className="muted">Direct message preview</p>
            <h3>Ava ↔ You</h3>
          </div>
          <button className="ghost-btn">Open DM</button>
        </div>
        <MessageList messages={privateMessages} />
      </section>

      <section className="ai-card panel-padding">
        <div className="section-head">
          <div>
            <p className="muted">Reduce chat clutter</p>
            <h3>AI summary</h3>
          </div>
          <button className="ghost-btn"><Sparkles size={16} /> Summarise</button>
        </div>

        <div className="ai-summary">
          <strong>Summary of unread messages</strong>
          <p style={{ marginBottom: 8 }}>
            Tom uploaded the cleaned dataset at 10:12. Maria finished the literature review draft at 10:20 and needs proofreading.
            Your next action is to review the draft after finishing the dashboard layout.
          </p>
          <p style={{ margin: 0 }}>
            Low-value quick confirmations are replaced by reactions so the main chat stays focused on updates and decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
