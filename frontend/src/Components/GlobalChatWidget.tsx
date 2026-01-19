import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaComments, FaTimes, FaPaperPlane, FaTrash, FaSearch } from 'react-icons/fa'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { sessionUtils } from '../utils/sessionUtils'

type Message = {
  id: number
  message: string
  senderType: 'USER' | 'SELLER'
  createdAt: string
  userName?: string
  sellerName?: string
  productId?: number
  productName?: string
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
}

const GlobalChatWidget = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef<boolean>(true)
  const shouldScrollToBottomRef = useRef<boolean>(false)
  const pendingSellerIdRef = useRef<number | null>(null)
  const pendingChatInfoRef = useRef<{ sellerId: number; sellerName: string; productId: number; productName: string; productDescription?: string; productImage?: string } | null>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)
  const lastSentProductIdRef = useRef<number | null>(null)
  const currentProductInfoRef = useRef<{ productId: number; productName: string; productDescription?: string; productImage?: string } | null>(null)

  const [loginStatus, setLoginStatus] = useState(() => {
    const user = sessionUtils.getUser()
    return sessionUtils.isLoggedIn() && user && user.role === 'USER'
  })

  // Listen for login status changes
  useEffect(() => {
    const handleLoginStatusChange = () => {
      const user = sessionUtils.getUser()
      const isUserLoggedIn = sessionUtils.isLoggedIn() && user && user.role === 'USER'
      setLoginStatus(isUserLoggedIn)
    }

    window.addEventListener('userLoginStatusChange', handleLoginStatusChange)
    return () => {
      window.removeEventListener('userLoginStatusChange', handleLoginStatusChange)
    }
  }, [])

  const user = sessionUtils.getUser()
  const userId = user?.userId
  const isLoggedIn = loginStatus

  // Define fetchConversations before useEffects that use it
  const fetchConversations = useCallback(async () => {
    // Always get fresh userId from session to avoid stale closures
    const currentUser = sessionUtils.getUser()
    const currentUserId = currentUser?.userId
    
    if (!currentUserId) {
      setConversations([]) // Ensure conversations is set even if no userId
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/chat/conversations/user/${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data || []) // Ensure it's always an array
        
        // If there's a pending sellerId to select, select it now
        if (pendingSellerIdRef.current) {
          const conversation = (data || []).find((c: Conversation) => c.sellerId === pendingSellerIdRef.current)
          if (conversation) {
            setSelectedConversation(conversation)
            pendingSellerIdRef.current = null
            pendingChatInfoRef.current = null
          } else if (pendingChatInfoRef.current) {
            // If conversation doesn't exist, create a temporary one so user can send messages
            const tempConversation: Conversation = {
              productId: pendingChatInfoRef.current.productId,
              productName: pendingChatInfoRef.current.productName,
              userId: currentUserId,
              userName: currentUser?.fullName || 'User',
              sellerId: pendingChatInfoRef.current.sellerId,
              sellerName: pendingChatInfoRef.current.sellerName,
              lastMessage: '',
              lastMessageTime: null,
              unreadCount: 0
            }
            setSelectedConversation(tempConversation)
            // Store current product info for sending messages
            currentProductInfoRef.current = {
              productId: pendingChatInfoRef.current.productId,
              productName: pendingChatInfoRef.current.productName,
              productDescription: pendingChatInfoRef.current.productDescription,
              productImage: pendingChatInfoRef.current.productImage
            }
            // Reset last sent product ID for new conversation
            lastSentProductIdRef.current = null
            pendingSellerIdRef.current = null
            // Keep pendingChatInfoRef for product details
          }
        }
      } else {
        // Even if response is not ok, set empty array so widget still shows
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      // Even on error, set empty array so widget still shows
      setConversations([])
    }
  }, []) // Empty dependency array - function doesn't depend on component state

  // Listen for open chat events from other components (separate useEffect to keep it always active)
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      // Check if user is logged in
      const currentUser = sessionUtils.getUser()
      const isUserLoggedIn = sessionUtils.isLoggedIn() && currentUser && currentUser.role === 'USER'
      
      if (!isUserLoggedIn) {
        // User not logged in, open chat to show login prompt
        setIsOpen(true)
        return
      }

      const { sellerId, sellerName, productId, productName, productDescription, productImage } = event.detail || {}
      console.log('Received openChatWidget event:', { sellerId, sellerName, productId, productName }) // Debug log
      if (sellerId) {
        pendingSellerIdRef.current = sellerId
        if (sellerName && productId && productName) {
          pendingChatInfoRef.current = { sellerId, sellerName, productId, productName, productDescription, productImage }
          // Store current product info for when sending messages
          currentProductInfoRef.current = { productId, productName, productDescription, productImage }
        }
        setIsOpen(true)
        // Fetch conversations to ensure they're loaded
        fetchConversations()
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener('openChatWidget' as any, handleOpenChat as EventListener)
    console.log('Event listener for openChatWidget registered') // Debug log

    return () => {
      window.removeEventListener('openChatWidget' as any, handleOpenChat as EventListener)
    }
  }, [fetchConversations]) // Include fetchConversations in dependency array

  useEffect(() => {
    // Only fetch conversations and connect WebSocket if user is logged in
    if (!isLoggedIn) {
      return
    }

    // Fetch conversations on mount and when opened
    fetchConversations()
    
    // Connect WebSocket if not already connected (always connect when user is logged in)
    if (!stompClient && !connected) {
      connectWebSocket()
    }

    // Periodically refresh conversations to update badge (every 5 seconds when closed)
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (!isOpen) {
      intervalId = setInterval(() => {
        fetchConversations()
      }, 5000) // Refresh every 5 seconds
    }

    return () => {
      if (stompClient && connected) {
        stompClient.deactivate()
      }
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isOpen, isLoggedIn, fetchConversations, stompClient, connected])

  useEffect(() => {
    // Update ref whenever selectedConversation changes
    selectedConversationRef.current = selectedConversation
    
    if (selectedConversation && isOpen) {
      // Clear messages when switching conversations to avoid showing wrong messages
      setMessages([])
      setHasMore(true)
      setLoadingMore(false)
      fetchMessages()
      markAsRead()
    } else if (!selectedConversation) {
      // Clear messages when no conversation is selected
      setMessages([])
      lastSentProductIdRef.current = null
      currentProductInfoRef.current = null
    }
    // Reset initial load flag when conversation changes
    isInitialLoadRef.current = true
  }, [selectedConversation, isOpen])


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
          console.log('Received WebSocket message:', chatMessage) // Debug log
          
          // Check if this message is for the current user
          if (chatMessage.userId === userId) {
            // Always update conversations when any message arrives
            fetchConversations()
            
            // If this message is for the currently selected conversation, update messages
            const currentConversation = selectedConversationRef.current
            if (currentConversation &&
                chatMessage.sellerId === currentConversation.sellerId) {
              // Replace temporary message if it exists, otherwise add new
              setMessages((prev) => {
                // Check if message already exists (avoid duplicates)
                const exists = prev.some(m => 
                  m.id === chatMessage.id || 
                  (m.id === -1 && m.message === chatMessage.message && 
                   Math.abs(new Date(m.createdAt).getTime() - new Date(chatMessage.createdAt).getTime()) < 2000))
                if (exists) {
                  return prev.map(m => 
                    (m.id === -1 && m.message === chatMessage.message) ? chatMessage : m
                  )
                }
                console.log('Adding new message to UI:', chatMessage) // Debug log
                // Update last sent product ID if this message has a product
                if (chatMessage.productId) {
                  lastSentProductIdRef.current = chatMessage.productId
                }
                // Trigger scroll to bottom when receiving a new message
                shouldScrollToBottomRef.current = true
                return [...prev, chatMessage]
              })
            } else {
              console.log('Message not for current conversation:', {
                messageSellerId: chatMessage.sellerId,
                currentSellerId: currentConversation?.sellerId
              }) // Debug log
            }
          }
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

  const fetchMessages = async (beforeId?: number) => {
    if (!selectedConversation || !userId) return

    try {
      // Use current userId from session, not from conversation
      const url = beforeId
        ? `http://localhost:8080/api/chat/history?userId=${userId}&sellerId=${selectedConversation.sellerId}&userType=USER&beforeId=${beforeId}&limit=20`
        : `http://localhost:8080/api/chat/history?userId=${userId}&sellerId=${selectedConversation.sellerId}&userType=USER`
      
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
          
          // Find the last product ID that was mentioned in messages
          const lastProductMessage = data.filter((msg) => msg.productId).slice(-1)[0]
          if (lastProductMessage) {
            lastSentProductIdRef.current = lastProductMessage.productId
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setLoadingMore(false)
    }
  }

  // Send product details message
  const sendProductDetailsMessage = async (productInfo: { productId: number; productName: string; productDescription?: string; productImage?: string }) => {
    if (!stompClient || !selectedConversation || !userId) return
    
    let productDetailsText = `📦 Product: ${productInfo.productName}`
    if (productInfo.productDescription) {
      const desc = productInfo.productDescription.substring(0, 200)
      productDetailsText += `\n\n${desc}${productInfo.productDescription.length > 200 ? '...' : ''}`
    }
    if (productInfo.productImage) {
      productDetailsText += `\n🖼️ [Image: ${productInfo.productImage}]`
    }

    const chatMessage = {
      productId: productInfo.productId,
      userId: userId,
      sellerId: selectedConversation.sellerId,
      message: productDetailsText,
      senderType: 'USER',
    }

    // Send via WebSocket or REST API
    if (stompClient && connected && stompClient.connected) {
      try {
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(chatMessage),
        })
        console.log('Product details sent via WebSocket')
      } catch (error) {
        console.error('Error sending product details via WebSocket:', error)
        sendMessageViaAPI(chatMessage)
      }
    } else {
      sendMessageViaAPI(chatMessage)
    }

    lastSentProductIdRef.current = productInfo.productId
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
    // Check if scrolled to top (within 50px)
    if (container.scrollTop < 50 && hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  const markAsRead = async () => {
    if (!selectedConversation || !userId) return

    try {
      await fetch(
        `http://localhost:8080/api/chat/mark-read?userId=${userId}&sellerId=${selectedConversation.sellerId}&userType=USER`,
        { method: 'POST' }
      )
      fetchConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    if (!userId) {
      console.error('User ID is missing')
      return
    }

    const messageToSend = messageText.trim()
    
    // Check if we have current product info from product detail page
    let productId = selectedConversation.productId
    let needsProductDetails = false
    
    if (currentProductInfoRef.current) {
      // User is sending from product detail page
      productId = currentProductInfoRef.current.productId
      
      // Check if we need to send product details first
      // - If no messages yet, send product details first
      // - If last message is about a different product, send product details for new product
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
      const isFirstMessage = messages.length === 0
      const isDifferentProduct = productId !== lastSentProductIdRef.current
      const lastMessageHasThisProduct = lastMessage && lastMessage.productId === productId
      
      needsProductDetails = (isFirstMessage || isDifferentProduct) && !lastMessageHasThisProduct
      
      if (needsProductDetails) {
        // Send product details first
        await sendProductDetailsMessage(currentProductInfoRef.current)
        // Wait a bit before sending user message
        await new Promise(resolve => setTimeout(resolve, 400))
      }
    } else {
      // No product info, use conversation's product
      productId = selectedConversation.productId || 1
    }

    if (!productId || productId === 0) {
      console.error('Product ID is missing or invalid:', productId)
      return
    }

    // Use the current userId from session, not from conversation (in case of temporary conversation)
    const currentUserId = userId

    // Optimistic update - add message immediately with temporary ID
    const tempMessage: Message = {
      id: -1,
      message: messageToSend,
      senderType: 'USER',
      createdAt: new Date().toISOString(),
      productId: productId,
    }
    setMessages((prev) => [...prev, tempMessage])
    
    // Send via WebSocket (use currentUserId to ensure correct user)
    const chatMessage = {
      productId: productId,
      userId: currentUserId, // Always use current session userId
      sellerId: selectedConversation.sellerId,
      message: messageToSend,
      senderType: 'USER',
    }
    
    // Update last sent product ID
    lastSentProductIdRef.current = productId

    console.log('Sending message:', chatMessage) // Debug log
    console.log('WebSocket status:', { hasClient: !!stompClient, connected, clientConnected: stompClient?.connected })

    // Try to send via WebSocket if connected, otherwise use REST API fallback
    if (stompClient && connected && stompClient.connected) {
      try {
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(chatMessage),
        })
        console.log('Message sent via WebSocket')
      } catch (error) {
        console.error('Error sending message via WebSocket:', error)
        // Fallback: Send via REST API if WebSocket fails
        sendMessageViaAPI(chatMessage)
      }
    } else {
      console.warn('WebSocket not connected, using REST API fallback')
      sendMessageViaAPI(chatMessage)
    }

    setMessageText('')
    // Trigger scroll to bottom when sending a message
    shouldScrollToBottomRef.current = true
    
    // Refresh conversations and messages after sending to ensure everything is in sync
    setTimeout(() => {
      fetchConversations().then(() => {
        // If we sent the first message to a vendor, update the selected conversation
        // to use the new one from the server instead of the temporary one
        if (selectedConversation && selectedConversation.lastMessageTime === null) {
          fetchConversations().then(() => {
            const updatedConversation = conversations.find(c => c.sellerId === selectedConversation.sellerId)
            if (updatedConversation) {
              setSelectedConversation(updatedConversation)
              // Refetch messages to get the saved message from database
              fetchMessages()
            }
          })
        } else {
          // Refetch messages to ensure we have the latest from database
          fetchMessages()
        }
      })
    }, 1000)
  }

  // Fallback function to send message via REST API if WebSocket fails
  const sendMessageViaAPI = async (chatMessage: any) => {
    try {
      const response = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatMessage),
      })
      
      if (response.ok) {
        const savedMessage = await response.json()
        console.log('Message sent via API:', savedMessage)
        // Update the temporary message with the real one
        setMessages((prev) => prev.map(m => 
          m.id === -1 && m.message === chatMessage.message ? savedMessage : m
        ))
        // Refresh conversations to update the list
        fetchConversations()
        // Refetch messages to ensure we have the latest
        setTimeout(() => fetchMessages(), 500)
      } else {
        console.error('Failed to send message via API:', response.statusText)
        // Remove the optimistic message if API fails
        setMessages((prev) => prev.filter(m => !(m.id === -1 && m.message === chatMessage.message)))
      }
    } catch (error) {
      console.error('Error sending message via API:', error)
      // Remove the optimistic message if API fails
      setMessages((prev) => prev.filter(m => !(m.id === -1 && m.message === chatMessage.message)))
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

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.productName.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by last message time (most recent first)
    if (!a.lastMessageTime) return 1
    if (!b.lastMessageTime) return -1
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  })

  const handleChatButtonClick = () => {
    // Check if user is logged in when button is clicked
    const currentUser = sessionUtils.getUser()
    const isUserLoggedIn = sessionUtils.isLoggedIn() && currentUser && currentUser.role === 'USER'
    
    if (!isUserLoggedIn) {
      // User not logged in, open chat to show login prompt
      setIsOpen(true)
    } else {
      // User is logged in, open chat normally
      setIsOpen(true)
    }
  }

  return (
    <>
      {/* Chat Button - Always visible */}
      {!isOpen && (
        <button
          onClick={handleChatButtonClick}
          className="fixed bottom-8 right-8 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all z-50"
          title="Messages"
        >
          <FaComments className="w-6 h-6" />
          {isLoggedIn && (() => {
            const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
            return totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )
          })()}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[800px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-200">
              <FaTimes />
            </button>
          </div>

          {!isLoggedIn ? (
            /* Login Prompt - Show when user is not logged in */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  Please login to access your messages and chat with vendors.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      navigate('/login')
                      setIsOpen(false)
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup')
                      setIsOpen(false)
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Conversations List */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={`${conversation.sellerId}`}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                          selectedConversation?.sellerId === conversation.sellerId
                            ? 'bg-red-50 border-red-200'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-gray-900">{conversation.sellerName}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{conversation.lastMessage}</p>
                        )}
                        {conversation.lastMessageTime && (
                          <p className="text-[10px] text-gray-400 mt-1">{formatTime(conversation.lastMessageTime)}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                <>
                  {/* Messages Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{selectedConversation.sellerName}</h4>
                      </div>
                      {messages.length > 0 && (
                        <div className="text-xs text-gray-400">
                          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                    onScroll={handleScroll}
                  >
                    {loadingMore && (
                      <div className="text-center text-gray-500 py-2 text-sm">Loading older messages...</div>
                    )}
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>
                    ) : (
                      messages.map((msg: Message) => {
                        // Parse message to extract image URL if present
                        const imageUrlMatch = msg.message.match(/\[Image:\s*(.+?)\]/)
                        const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null
                        const textWithoutImage = imageUrl 
                          ? msg.message.replace(/\[Image:\s*.+?\]/g, '').trim()
                          : msg.message
                        
                        return (
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
                                    msg.senderType === 'USER' ? 'text-red-100' : 'text-gray-400'
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </p>
                                {msg.senderType === 'USER' && (
                                  <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="ml-2 text-red-200 hover:text-white"
                                    title="Delete message"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!messageText.trim() || !connected}
                        className="bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </>
  )
}

export default GlobalChatWidget
