package com.localhunts.backend.service;

import com.localhunts.backend.dto.ChatMessageRequest;
import com.localhunts.backend.dto.ChatMessageResponse;
import com.localhunts.backend.dto.ConversationResponse;
import com.localhunts.backend.model.Chat;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.ChatRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public ChatMessageResponse saveMessage(ChatMessageRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Seller seller = sellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Chat chat = new Chat();
        chat.setProduct(product);
        chat.setUser(user);
        chat.setSeller(seller);
        chat.setMessage(request.getMessage());
        chat.setSenderType(request.getSenderType());

        if ("USER".equals(request.getSenderType())) {
            chat.setReadByUser(true); // Sender has read their own message
            chat.setReadBySeller(false); // Recipient hasn't read yet
        } else {
            chat.setReadBySeller(true); // Sender has read their own message
            chat.setReadByUser(false); // Recipient hasn't read yet
        }

        Chat savedChat = chatRepository.save(chat);

        return convertToResponse(savedChat);
    }

    public List<ChatMessageResponse> getChatHistoryForUser(Long userId, Long sellerId, Long beforeId, Integer limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Chat> chats;
        if (beforeId != null && limit != null && limit > 0) {
            // Pagination: get messages before the specified message ID
            Pageable pageable = PageRequest.of(0, limit);
            chats = chatRepository.findByUserAndSellerAndIdLessThanOrderByCreatedAtAsc(user, seller, beforeId, pageable);
        } else {
            // No pagination: get all messages
            chats = chatRepository.findByUserAndSellerOrderByCreatedAtAsc(user, seller);
        }

        return chats.stream()
                .filter(chat -> !chat.getDeletedByUser()) // Filter out messages deleted by user
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getChatHistoryForSeller(Long userId, Long sellerId, Long beforeId, Integer limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Chat> chats;
        if (beforeId != null && limit != null && limit > 0) {
            // Pagination: get messages before the specified message ID
            Pageable pageable = PageRequest.of(0, limit);
            chats = chatRepository.findByUserAndSellerAndIdLessThanOrderByCreatedAtAsc(user, seller, beforeId, pageable);
        } else {
            // No pagination: get all messages
            chats = chatRepository.findByUserAndSellerOrderByCreatedAtAsc(user, seller);
        }

        return chats.stream()
                .filter(chat -> !chat.getDeletedBySeller()) // Filter out messages deleted by seller
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ConversationResponse> getConversationsForSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<User> distinctUsers = chatRepository.findDistinctUsersForSeller(seller);

        return distinctUsers.stream().map(user -> {
            Chat lastMessage = chatRepository.findFirstByUserAndSellerAndDeletedByUserFalseAndDeletedBySellerFalseOrderByCreatedAtDesc(user, seller);

            // Get the most recent product from messages in this conversation
            List<Chat> allChats = chatRepository.findByUserAndSellerOrderByCreatedAtAsc(user, seller);
            Product recentProduct = allChats.isEmpty() ? null : allChats.get(allChats.size() - 1).getProduct();

            // Count unread messages for this conversation
            Long unreadCount = chatRepository.countUnreadForSellerWithUser(seller, user);

            ConversationResponse response = new ConversationResponse();
            response.setProductId(recentProduct != null ? recentProduct.getId() : null);
            response.setProductName(recentProduct != null ? recentProduct.getName() : "No product");
            response.setUserId(user.getId());
            response.setUserName(user.getFullName());
            response.setSellerId(seller.getId());
            response.setSellerName(seller.getBusinessName());
            response.setLastMessage(lastMessage != null ? lastMessage.getMessage() : "");
            response.setLastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null);
            response.setUnreadCount(unreadCount != null ? unreadCount.intValue() : 0);

            return response;
        }).sorted((a, b) -> {
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        }).collect(Collectors.toList());
    }

    public List<ConversationResponse> getConversationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Seller> distinctSellers = chatRepository.findDistinctSellersForUser(user);

        return distinctSellers.stream().map(seller -> {
            Chat lastMessage = chatRepository.findFirstByUserAndSellerAndDeletedByUserFalseAndDeletedBySellerFalseOrderByCreatedAtDesc(user, seller);

            // Get the most recent product from messages in this conversation
            List<Chat> allChats = chatRepository.findByUserAndSellerOrderByCreatedAtAsc(user, seller);
            Product recentProduct = allChats.isEmpty() ? null : allChats.get(allChats.size() - 1).getProduct();

            // Count unread messages for this conversation
            Long unreadCount = chatRepository.countUnreadForUserWithSeller(user, seller);

            ConversationResponse response = new ConversationResponse();
            response.setProductId(recentProduct != null ? recentProduct.getId() : null);
            response.setProductName(recentProduct != null ? recentProduct.getName() : "No product");
            response.setUserId(user.getId());
            response.setUserName(user.getFullName());
            response.setSellerId(seller.getId());
            response.setSellerName(seller.getBusinessName());
            response.setLastMessage(lastMessage != null ? lastMessage.getMessage() : "");
            response.setLastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null);
            response.setUnreadCount(unreadCount != null ? unreadCount.intValue() : 0);

            return response;
        }).sorted((a, b) -> {
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteMessage(Long messageId, String userType) {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if ("USER".equals(userType)) {
            chat.setDeletedByUser(true);
        } else if ("SELLER".equals(userType)) {
            chat.setDeletedBySeller(true);
        }

        chatRepository.save(chat);
    }

    @Transactional
    public void markAsRead(Long userId, Long sellerId, String userType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if ("SELLER".equals(userType)) {
            chatRepository.markAsReadBySeller(seller, user);
        } else if ("USER".equals(userType)) {
            chatRepository.markAsReadByUser(user, seller);
        }
    }

    private ChatMessageResponse convertToResponse(Chat chat) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(chat.getId());
        response.setProductId(chat.getProduct().getId());
        response.setProductName(chat.getProduct().getName());
        response.setUserId(chat.getUser().getId());
        response.setUserName(chat.getUser().getFullName());
        response.setSellerId(chat.getSeller().getId());
        response.setSellerName(chat.getSeller().getBusinessName());
        response.setMessage(chat.getMessage());
        response.setSenderType(chat.getSenderType());
        response.setCreatedAt(chat.getCreatedAt());
        response.setDeletedByUser(chat.getDeletedByUser());
        response.setDeletedBySeller(chat.getDeletedBySeller());
        return response;
    }
}
