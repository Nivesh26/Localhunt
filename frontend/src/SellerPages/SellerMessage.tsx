import { useState, useEffect, useRef } from 'react'
import {
  FaSearch,
  FaPaperPlane,
  FaCheckCircle,
  FaComments,
  FaTrash,
  FaSync,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
import { sessionUtils } from '../utils/sessionUtils'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

type Message = {
  id: number
  message: string
  senderType: 'USER' | 'SELLER'
  createdAt: string
  userName?: string
  sellerName?: string
  productId?: number
  productName?: string
  userProfilePicture?: string | null
  sellerProfilePicture?: string | null
}

type Conversation = {
  productId: number
  productName: string
  userId: number
  userName: string
  sellerId: number
  sellerName: string
  lastMessage: string
  lastMessageTime: string | null
  unreadCount: number
  userProfilePicture?: string | null
}

const SellerMessage = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef<boolean>(true)
  const shouldScrollToBottomRef = useRef<boolean>(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const seller = sessionUtils.getUser()
    if (!seller) {
      toast.error('Please login to view messages')
      navigate('/sellerlogin')
      return
    }

    fetchConversations()
    connectWebSocket()

    return () => {
      if (stompClient) {
        stompClient.deactivate()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
      markAsRead()
    }
    // Reset initial load flag when conversation changes
    isInitialLoadRef.current = true
  }, [selectedConversation])

  useEffect(() => {
    // Only scroll to bottom if:
    // 1. It's the initial load (initial load SHOULD scroll to bottom to show newest messages first)
    // 2. A new message was sent/received (shouldScrollToBottomRef is true)
    if (isInitialLoadRef.current && messages.length > 0) {
      // Scroll to bottom on initial load to show newest messages first
      setTimeout(() => {
        scrollToBottom(true) // Scroll to last/newest message (instant scroll on initial load)
        isInitialLoadRef.current = false
      }, 150)
    } else if (!isInitialLoadRef.current && shouldScrollToBottomRef.current) {
      // Scroll to bottom when new message is sent/received
      setTimeout(() => {
        scrollToBottom(false) // Scroll to last/newest message (smooth scroll for new messages)
        shouldScrollToBottomRef.current = false
      }, 100)
    }
  }, [messages])

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat') as any,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/chat', (message: any) => {
          const chatMessage = JSON.parse(message.body)
          if (selectedConversation &&
            chatMessage.userId === selectedConversation.userId &&
            chatMessage.sellerId === selectedConversation.sellerId
          ) {
            setMessages((prev) => {
              // Check if message already exists (avoid duplicates)
              const exists = prev.some(msg => 
                msg.id === chatMessage.id || 
                (msg.message === chatMessage.message && 
                 msg.senderType === chatMessage.senderType &&
                 Math.abs(new Date(msg.createdAt).getTime() - new Date(chatMessage.createdAt).getTime()) < 2000)
              )
              if (exists) return prev
              
              // Replace temp message (timestamp-based) with real one if exists
              const tempMessageIndex = prev.findIndex(msg => 
                msg.id > 1000000000000 && // Temp IDs are timestamps
                msg.message === chatMessage.message &&
                msg.senderType === chatMessage.senderType
              )
              
              if (tempMessageIndex !== -1) {
                const newMessages = [...prev]
                newMessages[tempMessageIndex] = chatMessage
                return newMessages
              }
              
              // Trigger scroll to bottom when receiving a new message
              shouldScrollToBottomRef.current = true
              return [...prev, chatMessage]
            })
          }
          // Refresh conversations to update last message
          fetchConversations()
        })
      },
      onStompError: (frame: any) => {
        console.error('Broker reported error: ' + frame.headers['message'])
        setConnected(false)
      },
      onDisconnect: () => {
        setConnected(false)
      },
    })

    client.activate()
    setStompClient(client)
  }

  const fetchConversations = async () => {
    const seller = sessionUtils.getUser()
    if (!seller) return

    try {
      const response = await fetch(`http://localhost:8080/api/chat/conversations/seller/${seller.userId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (beforeId?: number) => {
    if (!selectedConversation) return

    try {
      const url = beforeId
        ? `http://localhost:8080/api/chat/history?userId=${selectedConversation.userId}&sellerId=${selectedConversation.sellerId}&userType=SELLER&beforeId=${beforeId}&limit=20`
        : `http://localhost:8080/api/chat/history?userId=${selectedConversation.userId}&sellerId=${selectedConversation.sellerId}&userType=SELLER`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        
        if (beforeId) {
          // Loading older messages - prepend to existing messages
          if (data.length === 0) {
            setHasMore(false)
            setLoadingMore(false)
          } else {
            setMessages((prev) => [...data, ...prev])
            // Don't setLoadingMore(false) here - let loadMoreMessages handle it after scroll restore
          }
        } else {
          // Initial load - replace all messages
          setMessages(data)
          setHasMore(data.length >= 20)
          // Mark as initial load
          isInitialLoadRef.current = true
          setLoadingMore(false)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setLoadingMore(false)
    }
  }

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !selectedConversation || messages.length === 0) return
    
    const oldestMessage = messages[0]
    if (oldestMessage && oldestMessage.id) {
      // Save current scroll position
      const container = messagesContainerRef.current
      const scrollHeight = container?.scrollHeight || 0
      const scrollTop = container?.scrollTop || 0
      
      setLoadingMore(true)
      await fetchMessages(oldestMessage.id)
      
      // Restore scroll position after new messages are loaded
      // Wait a bit for DOM to update
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          const heightDifference = newScrollHeight - scrollHeight
          container.scrollTop = scrollTop + heightDifference
        }
        setLoadingMore(false)
      }, 100)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    // Check if scrolled to top (within 100px) to load older messages
    if (container.scrollTop < 100 && hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  const markAsRead = async () => {
    if (!selectedConversation) return

    try {
      await fetch(
        `http://localhost:8080/api/chat/mark-read?userId=${selectedConversation.userId}&sellerId=${selectedConversation.sellerId}&userType=SELLER`,
        { method: 'POST' }
      )
      fetchConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation || !stompClient || !connected) return

    const seller = sessionUtils.getUser()
    if (!seller) return

    // Get the most recent product from messages or use the conversation's product
    const recentProductId = messages.length > 0 && messages[messages.length - 1].productId 
      ? messages[messages.length - 1].productId 
      : (selectedConversation.productId || null)

    const messageToSend = replyText.trim()
    
    // Optimistically add message to UI immediately
    const tempMessage: Message = {
      id: Date.now(), // Temporary ID until real one comes from server
      message: messageToSend,
      senderType: 'SELLER',
      createdAt: new Date().toISOString(),
      userName: seller.fullName || seller.email,
      sellerName: seller.fullName || seller.email,
      productId: recentProductId || undefined,
    }
    setMessages((prev) => [...prev, tempMessage])

    const chatMessage = {
      productId: recentProductId || 1, // Fallback if no product found
      userId: selectedConversation.userId,
      sellerId: seller.userId,
      message: messageToSend,
      senderType: 'SELLER',
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage),
    })

    setReplyText('')
    // Trigger scroll to bottom when sending a message
    shouldScrollToBottomRef.current = true
  }

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/message/${messageId}?userType=SELLER`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const scrollToBottom = (instant: boolean = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' })
    } else if (messagesContainerRef.current) {
      // Fallback: directly set scrollTop to bottom
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getCustomerAvatar = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  const handleRefresh = async () => {
    setLoading(true)
    await fetchConversations()
    if (selectedConversation) {
      await fetchMessages()
      await markAsRead()
    }
    setLoading(false)
    toast.success('Chat refreshed')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
          <SellerNavbar />
          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

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
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 transition-colors"
                  title="Refresh conversations"
                >
                  <FaSync className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Refresh</span>
                </button>
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
                {filteredConversations.map((conversation) => (
                  <button
                    key={`${conversation.productId}-${conversation.userId}`}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full rounded-xl p-3 text-left transition ${
                      selectedConversation?.productId === conversation.productId &&
                      selectedConversation?.userId === conversation.userId
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                        {conversation.userProfilePicture ? (
                          <img
                            src={conversation.userProfilePicture.startsWith('http')
                              ? conversation.userProfilePicture
                              : `http://localhost:8080${conversation.userProfilePicture}`}
                            alt={conversation.userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to avatar if image fails
                              e.currentTarget.style.display = 'none'
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.avatar-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-red-100 text-red-700 text-sm font-semibold items-center justify-center avatar-fallback ${conversation.userProfilePicture ? 'hidden' : 'flex'}`}>
                          {getCustomerAvatar(conversation.userName)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.userName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{conversation.productName}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{conversation.lastMessage}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{formatTime(conversation.lastMessageTime)}</p>
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                          {selectedConversation.userProfilePicture ? (
                            <img
                              src={selectedConversation.userProfilePicture.startsWith('http')
                                ? selectedConversation.userProfilePicture
                                : `http://localhost:8080${selectedConversation.userProfilePicture}`}
                              alt={selectedConversation.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to avatar if image fails
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  const fallback = parent.querySelector('.header-avatar-fallback') as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-red-100 text-red-700 text-sm font-semibold items-center justify-center header-avatar-fallback ${selectedConversation.userProfilePicture ? 'hidden' : 'flex'}`}>
                            {getCustomerAvatar(selectedConversation.userName)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedConversation.userName}
                          </p>
                          <p className="text-xs text-gray-500">{selectedConversation.productName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    onScroll={handleScroll}
                  >
                    {loadingMore && (
                      <div className="text-center text-gray-500 py-2 text-sm">Loading older messages...</div>
                    )}
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>
                    ) : (
                      messages.map((message) => {
                        // Parse message to extract image URL if present
                        const imageUrlMatch = message.message.match(/\[Image:\s*(.+?)\]/)
                        const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null
                        const textWithoutImage = imageUrl 
                          ? message.message.replace(/\[Image:\s*.+?\]/g, '').trim()
                          : message.message
                        
                        // Get profile picture URL
                        const profilePictureUrl = message.senderType === 'USER' 
                          ? message.userProfilePicture 
                          : message.sellerProfilePicture
                        const formattedProfilePictureUrl = profilePictureUrl 
                          ? (profilePictureUrl.startsWith('http') 
                              ? profilePictureUrl 
                              : `http://localhost:8080${profilePictureUrl}`)
                          : null
                        
                        return (
                      <div
                        key={message.id}
                            className={`flex items-end gap-2 ${message.senderType === 'SELLER' ? 'justify-end' : 'justify-start'}`}
                      >
                            {/* Profile Picture for USER messages */}
                            {message.senderType === 'USER' && (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                {formattedProfilePictureUrl ? (
                                  <img
                                    src={formattedProfilePictureUrl}
                                    alt={message.userName || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Hide image if it fails to load
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                    {message.userName ? message.userName.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                              </div>
                            )}
                            
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                message.senderType === 'SELLER'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                              {textWithoutImage && (
                                <p className="text-sm whitespace-pre-wrap">{textWithoutImage}</p>
                              )}
                              {imageUrl && (
                                <div className="mt-2">
                                  <img 
                                    src={imageUrl} 
                                    alt="Product" 
                                    className="max-w-full max-h-48 rounded-lg object-cover"
                                    onError={(e) => {
                                      // Hide image if it fails to load
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <p
                                  className={`text-[11px] ${
                                    message.senderType === 'SELLER' ? 'text-red-100' : 'text-gray-400'
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                                {message.senderType === 'SELLER' && (
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="ml-2 hover:text-red-200"
                                    title="Delete message"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                        </div>
                            
                            {/* Profile Picture for SELLER messages */}
                            {message.senderType === 'SELLER' && (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                {formattedProfilePictureUrl ? (
                                  <img
                                    src={formattedProfilePictureUrl}
                                    alt={message.sellerName || 'Seller'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Hide image if it fails to load
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {message.sellerName ? message.sellerName.charAt(0).toUpperCase() : 'S'}
                                  </div>
                                )}
                              </div>
                            )}
                      </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
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
                        disabled={!connected}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || !connected}
                        className="rounded-xl bg-red-600 p-3 text-white transition hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <FaPaperPlane className="h-5 w-5" />
                      </button>
                    </div>
                    {!connected && <p className="text-[11px] text-gray-400 mt-2">Connecting...</p>}
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
