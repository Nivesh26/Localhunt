package com.localhunts.backend.controller;

import com.localhunts.backend.dto.ChatMessageRequest;
import com.localhunts.backend.dto.ChatMessageResponse;
import com.localhunts.backend.dto.ConversationResponse;
import com.localhunts.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @RequestParam Long userId,
            @RequestParam Long sellerId,
            @RequestParam(required = false, defaultValue = "USER") String userType,
            @RequestParam(required = false) Long beforeId,
            @RequestParam(required = false) Integer limit) {
        
        List<ChatMessageResponse> history;
        if ("SELLER".equals(userType)) {
            history = chatService.getChatHistoryForSeller(userId, sellerId, beforeId, limit);
        } else {
            history = chatService.getChatHistoryForUser(userId, sellerId, beforeId, limit);
        }
        return ResponseEntity.ok(history);
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<List<ConversationResponse>> getUserConversations(@PathVariable Long userId) {
        List<ConversationResponse> conversations = chatService.getConversationsForUser(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/seller/{sellerId}")
    public ResponseEntity<List<ConversationResponse>> getSellerConversations(@PathVariable Long sellerId) {
        List<ConversationResponse> conversations = chatService.getConversationsForSeller(sellerId);
        return ResponseEntity.ok(conversations);
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam String userType) {
        try {
            chatService.deleteMessage(messageId, userType);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @RequestParam Long userId,
            @RequestParam Long sellerId,
            @RequestParam String userType) {
        try {
            chatService.markAsRead(userId, sellerId, userType);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Messages marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            ChatMessageResponse response = chatService.saveMessage(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
