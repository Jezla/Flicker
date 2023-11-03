package com.elec5619.group14.flicker.ChatApp.controller;

import com.elec5619.group14.flicker.AuthApp.annotation.CurrentUser;
import com.elec5619.group14.flicker.AuthApp.model.CustomUserDetails;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.elec5619.group14.flicker.ChatApp.model.Message;
import com.elec5619.group14.flicker.ChatApp.model.MessageUserSetting;
import com.elec5619.group14.flicker.ChatApp.model.dto.MessageDTO;
import com.elec5619.group14.flicker.ChatApp.model.payload.EditMessageRequest;
import com.elec5619.group14.flicker.ChatApp.model.payload.SendMessageRequest;
import com.elec5619.group14.flicker.ChatApp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/message")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @MessageMapping("/send/{conversationId}/{userId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message sendMessage(@DestinationVariable(value = "conversationId") Long conversationId,
                               @DestinationVariable(value = "userId") Long userId,
                               @Payload SendMessageRequest request) {
        return messageService.sendMessage(conversationId, request, userId);
    }

    /*@PostMapping("/send/{conversationId}")
    public Message sendMessage(@PathVariable(value = "conversationId") Long conversationId,
                               @CurrentUser CustomUserDetails currentUser,
                               @RequestBody SendMessageRequest request) {
        return messageService.sendMessage(conversationId, request, currentUser.getId());
    }*/

    @PutMapping("/edit/{conversationId}/{messageId}")
    public MessageDTO editMessage(@PathVariable(value = "conversationId") Long conversationId,
                               @PathVariable(value = "messageId") Long messageId,
                               @CurrentUser CustomUserDetails currentUser,
                               @RequestBody EditMessageRequest request) {
        return messageService.editMessage(currentUser.getId(), conversationId, messageId, request);
    }

    @PutMapping("/hide/{conversationId}/{messageId}")
    public MessageUserSetting hideMessage(@PathVariable(value = "conversationId") Long conversationId,
                                    @PathVariable(value = "messageId") Long messageId,
                                    @CurrentUser CustomUserDetails currentUser) {
        return messageService.hideMessage(currentUser.getId(), conversationId, messageId);
    }

    /*@PutMapping("/delete/{conversationId}/{messageId}")
    public MessageDTO deleteMessage(@PathVariable(value = "conversationId") Long conversationId,
                               @PathVariable(value = "messageId") Long messageId,
                               @CurrentUser CustomUserDetails currentUser) {
        return messageService.deleteMessage(currentUser.getId(), conversationId, messageId);
    }*/

    @MessageMapping("/delete/{conversationId}/{userId}/{messageId}")
    @SendTo("/topic/conversation/{conversationId}/deleteMessage")
    public Message deleteMessage(@DestinationVariable(value = "conversationId") Long conversationId,
                                    @DestinationVariable(value = "userId") Long userId,
                                    @DestinationVariable(value = "messageId") Long messageId) {
        return messageService.deleteMessage(userId, conversationId, messageId);
    }

    @PutMapping("/recover/{conversationId}/{messageId}")
    public MessageDTO recoverMessage(@PathVariable(value = "conversationId") Long conversationId,
                                 @PathVariable(value = "messageId") Long messageId,
                                 @CurrentUser CustomUserDetails currentUser) {
        return messageService.recoverMessage(currentUser.getId(), conversationId, messageId);
    }

    @GetMapping(path = "/get/unseen/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> getUnseenMessages(@CurrentUser CustomUserDetails currentUser,
                                                              @PathVariable("conversationId") Long conversationId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(messageService.getUnseenMessages(currentUser.getId(), conversationId, pageable));
    }

    @PutMapping(path = "/mark/seen/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Set<MessageUserSetting>> markMessagesAsSeen(@CurrentUser CustomUserDetails currentUser,
                                                                      @PathVariable("conversationId") Long conversationId) {
        return ResponseEntity.ok(messageService.markMessagesAsSeen(currentUser.getId(), conversationId));
    }

    @GetMapping(path = "/get/latest/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MessageDTO> getLatestMessage(@CurrentUser CustomUserDetails currentUser,
                                                        @PathVariable("conversationId") Long conversationId) {
        return ResponseEntity.ok(messageService.getLatestMessage(currentUser.getId(), conversationId));
    }

    @GetMapping(path = "/get/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> getMessages(@CurrentUser CustomUserDetails currentUser,
                                                        @PathVariable("conversationId") Long conversationId,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(messageService.getMessages(currentUser.getId(), conversationId, pageable));
    }

    @GetMapping(path = "/search/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> searchMessages(@CurrentUser CustomUserDetails currentUser,
                                                                 @PathVariable("conversationId") Long conversationId,
                                                                 @RequestParam String query,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<MessageDTO> messages = messageService.getMessagesForFilter(currentUser.getId(), conversationId);
        return ResponseEntity.ok(messageService.filteredMessages(messages, query, pageable));
    }

    @GetMapping(path = "/get/hidden/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> getHiddenMessages(@CurrentUser CustomUserDetails currentUser,
                                                              @PathVariable("conversationId") Long conversationId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(messageService.getHiddenMessages(currentUser.getId(), conversationId, pageable));
    }

    /*@GetMapping(path = "/search/hidden/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> searchHiddenMessages(@CurrentUser CustomUserDetails currentUser,
                                                              @PathVariable("conversationId") Long conversationId,
                                                              @RequestParam String query,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = messageService.getHiddenMessages(currentUser.getId(), conversationId, pageable);
        return ResponseEntity.ok(messageService.filteredMessages(messages, query, pageable));
    }*/

    @GetMapping(path = "/get/archived/{archivedConversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> getArchivedMessages(@CurrentUser CustomUserDetails currentUser,
                                                                @PathVariable("archivedConversationId") Long archivedConversationId,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(messageService.getArchivedMessages(currentUser.getId(), archivedConversationId, pageable));
    }

   /* @GetMapping(path = "/search/archived/{conversationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MessageDTO>> searchArchivedMessages(@CurrentUser CustomUserDetails currentUser,
                                                                 @PathVariable("conversationId") Long conversationId,
                                                                 @RequestParam String query,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = messageService.getArchivedMessages(currentUser.getId(), conversationId, pageable);
        return ResponseEntity.ok(messageService.filteredMessages(messages, query, pageable));
    }*/
}
