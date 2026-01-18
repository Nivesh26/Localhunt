import { useState, useEffect, useRef } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaTrash } from 'react-icons/fa'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface ChatMessage {
  id: number
  message: string
  senderType: string
  createdAt: string
  userName?: string
  sellerName?: string
  productId?: number
  productName?: string
}

interface ChatWidgetProps {
  productId: number
  productName: string
  productDescription?: string
  productImage?: string
  sellerId: number
  sellerName: string
  userId: number
  openOnMount?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

const ChatWidget = ({ productId, productName, productDescription, productImage, sellerId, sellerName, userId, openOnMount = false, onOpenChange }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(openOnMount)
  
  // Update internal state when openOnMount prop changes
  useEffect(() => {
    if (openOnMount) {
      setIsOpen(true)
    }
  }, [openOnMount])
  
  // Notify parent of state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastSentProductId, setLastSentProductId] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !connected) {
      connectWebSocket()
      fetchChatHistory()
    }

    return () => {
      if (stompClient && connected) {
        stompClient.deactivate()
      }
    }
  }, [isOpen])


  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat') as any,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/chat', (message) => {
          const chatMessage = JSON.parse(message.body)
          // Only add messages for this conversation (user-seller pair)
          if (chatMessage.userId === userId && chatMessage.sellerId === sellerId) {
            setMessages((prev) => [...prev, chatMessage])
          }
        })
      },
      onStompError: (frame) => {
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

  const fetchChatHistory = async (beforeId?: number) => {
    try {
      const url = beforeId 
        ? `http://localhost:8080/api/chat/history?userId=${userId}&sellerId=${sellerId}&userType=USER&beforeId=${beforeId}&limit=20`
        : `http://localhost:8080/api/chat/history?userId=${userId}&sellerId=${sellerId}&userType=USER`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        
        if (beforeId) {
          // Loading older messages - prepend to existing messages
          if (data.length === 0) {
            setHasMore(false)
          } else {
            setMessages((prev) => [...data, ...prev])
          }
        } else {
          // Initial load - replace all messages
          setMessages(data)
          setHasMore(data.length >= 20)
        }
        
        // Find the last product ID that was mentioned in messages
        const allMessages = beforeId ? [...data, ...messages] : data
        const lastProductMessage = allMessages.filter((msg: ChatMessage) => msg.productId).slice(-1)[0]
        if (lastProductMessage) {
          setLastSentProductId(lastProductMessage.productId)
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const loadMoreMessages = () => {
    if (loadingMore || !hasMore || messages.length === 0) return
    
    const oldestMessage = messages[0]
    if (oldestMessage && oldestMessage.id) {
      setLoadingMore(true)
      fetchChatHistory(oldestMessage.id)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    // Check if scrolled to top (within 50px)
    if (container.scrollTop < 50 && hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  // Send product details message automatically when switching products
  const sendProductDetailsMessage = async () => {
    if (!stompClient || !connected || !productDescription) return
    
    const productDetailsMessage = `📦 Product: ${productName}\n${productDescription}`

    const chatMessage = {
      productId,
      userId,
      sellerId,
      message: productDetailsMessage,
      senderType: 'USER',
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage),
    })

    setLastSentProductId(productId)
  }

  const sendMessage = () => {
    if (!messageText.trim() || !stompClient || !connected) return

    // Check if this is the first message about this product
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
    const lastMessageHasThisProduct = lastMessage && lastMessage.productId === productId
    const needsProductDetails = !lastMessageHasThisProduct && productId !== lastSentProductId && productDescription

    // If first message about this product, send product details first, then user message
    if (needsProductDetails) {
      // Send product details first
      sendProductDetailsMessage()
    }

    // Send user's message (always send, but after product details if needed)
    const messageContent = messageText.trim()

    const chatMessage = {
      productId,
      userId,
      sellerId,
      message: messageContent,
      senderType: 'USER',
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage),
    })

    setMessageText('')
    
    // Update lastSentProductId after sending message
    if (needsProductDetails) {
      setLastSentProductId(productId)
    }
  }

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/message/${messageId}?userType=USER`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all z-50"
          title="Chat with vendor"
        >
          <FaComments className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Chat with {sellerName}</h3>
              <p className="text-xs text-red-100">{productName}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-200">
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" 
            style={{ maxHeight: '400px' }}
            onScroll={handleScroll}
          >
            {loadingMore && (
              <div className="text-center text-gray-500 py-2 text-sm">Loading older messages...</div>
            )}
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      msg.senderType === 'USER'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] ${msg.senderType === 'USER' ? 'text-red-100' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                      {msg.senderType === 'USER' && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="ml-2 hover:text-red-200"
                          title="Delete message"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={!connected}
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim() || !connected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
            {!connected && <p className="text-xs text-gray-500 mt-1">Connecting...</p>}
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
