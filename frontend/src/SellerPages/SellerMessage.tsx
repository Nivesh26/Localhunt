import { useState } from 'react'
import {
  FaSearch,
  FaPaperPlane,
  FaCheckCircle,
  FaComments,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'

type Message = {
  id: number
  text: string
  sender: 'customer' | 'seller'
  timestamp: string
  read: boolean
}

type Conversation = {
  id: number
  customerName: string
  customerAvatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  orderId?: string
  messages: Message[]
}

const conversations: Conversation[] = [
  {
    id: 1,
    customerName: 'Sanjay Gurung',
    customerAvatar: 'SG',
    lastMessage: 'When will my order #S-9827 be delivered?',
    timestamp: '2m ago',
    unreadCount: 2,
    orderId: '#S-9827',
    messages: [
      {
        id: 1,
        text: 'Hello, I placed an order yesterday. Can you tell me when it will be shipped?',
        sender: 'customer',
        timestamp: 'Yesterday 3:45 PM',
        read: true,
      },
      {
        id: 2,
        text: 'Hi Sanjay! Thanks for your order. We\'ll ship it today and you should receive it within 2-3 business days.',
        sender: 'seller',
        timestamp: 'Yesterday 4:12 PM',
        read: true,
      },
      {
        id: 3,
        text: 'Great! Can you provide a tracking number once it ships?',
        sender: 'customer',
        timestamp: 'Yesterday 4:30 PM',
        read: true,
      },
      {
        id: 4,
        text: 'When will my order #S-9827 be delivered?',
        sender: 'customer',
        timestamp: '2m ago',
        read: false,
      },
    ],
  },
  {
    id: 2,
    customerName: 'Meena KC',
    customerAvatar: 'MK',
    lastMessage: 'Thank you so much! The product is perfect.',
    timestamp: '1h ago',
    unreadCount: 0,
    orderId: '#S-9822',
    messages: [
      {
        id: 1,
        text: 'I received my order today. The quality is amazing!',
        sender: 'customer',
        timestamp: '1h ago',
        read: true,
      },
      {
        id: 2,
        text: 'Thank you so much! The product is perfect.',
        sender: 'customer',
        timestamp: '1h ago',
        read: true,
      },
    ],
  },
  {
    id: 3,
    customerName: 'Global Crafts UK',
    customerAvatar: 'GC',
    lastMessage: 'We need to discuss bulk pricing for our next order.',
    timestamp: '3h ago',
    unreadCount: 1,
    messages: [
      {
        id: 1,
        text: 'Hi, we\'re interested in placing a bulk order for 50 units. Can you provide a quote?',
        sender: 'customer',
        timestamp: '3h ago',
        read: true,
      },
      {
        id: 2,
        text: 'We need to discuss bulk pricing for our next order.',
        sender: 'customer',
        timestamp: '3h ago',
        read: false,
      },
    ],
  },
  {
    id: 4,
    customerName: 'Anil Shrestha',
    customerAvatar: 'AS',
    lastMessage: 'Is this product available in different colors?',
    timestamp: '5h ago',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        text: 'Is this product available in different colors?',
        sender: 'customer',
        timestamp: '5h ago',
        read: true,
      },
    ],
  },
]

const SellerMessage = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: selectedConversation.messages.length + 1,
      text: replyText.trim(),
      sender: 'seller',
      timestamp: 'Just now',
      read: true,
    }

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: replyText.trim(),
      timestamp: 'Just now',
      unreadCount: 0,
    }

    setSelectedConversation(updatedConversation)
    setReplyText('')
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Messages
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Customer Messages</h1>
                  <p className="text-sm text-gray-500">
                    Communicate with customers about orders, products, and support requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {totalUnread > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2">
                    <FaComments className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">{totalUnread} unread</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px,1fr]">
            {/* Conversations List */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredConversations.map(conversation => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full rounded-xl p-3 text-left transition ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
                        {conversation.customerAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.customerName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.orderId && (
                          <p className="text-xs text-gray-500 mt-0.5">Order {conversation.orderId}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 truncate">{conversation.lastMessage}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{conversation.timestamp}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredConversations.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No conversations found
                  </div>
                )}
              </div>
            </section>

            {/* Message Thread */}
            <section className="rounded-2xl bg-white shadow-sm flex flex-col h-[700px]">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
                          {selectedConversation.customerAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedConversation.customerName}
                          </p>
                          {selectedConversation.orderId && (
                            <p className="text-xs text-gray-500">Order {selectedConversation.orderId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selectedConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            message.sender === 'seller'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-[11px] mt-1 ${
                              message.sender === 'seller' ? 'text-red-100' : 'text-gray-400'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-end gap-3">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                        placeholder="Type your message..."
                        rows={2}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="rounded-xl bg-red-600 p-3 text-white transition hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <FaPaperPlane className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaComments className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SellerMessage
