package com.localhunts.backend.controller;

import com.localhunts.backend.dto.ChatMessageRequest;
import com.localhunts.backend.dto.ChatMessageResponse;
import com.localhunts.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        // Save message to database
        ChatMessageResponse response = chatService.saveMessage(request);
        return response;
    }
}
