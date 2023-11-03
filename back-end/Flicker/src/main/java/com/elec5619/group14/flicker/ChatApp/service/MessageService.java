package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.elec5619.group14.flicker.ChatApp.model.*;
import com.elec5619.group14.flicker.ChatApp.model.dto.MessageDTO;
import com.elec5619.group14.flicker.ChatApp.model.payload.EditMessageRequest;
import com.elec5619.group14.flicker.ChatApp.model.payload.SendMessageRequest;
import com.elec5619.group14.flicker.ChatApp.repository.MessageRepository;
import com.elec5619.group14.flicker.ChatApp.util.DataStructuresHandle;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    private ArchivedConversationService archivedConversationService;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageUserSettingService messageUserSettingService;

    @Autowired
    private FileService fileService;

    @Autowired
    private ModelMapper modelMapper;


    private DataStructuresHandle handle = new DataStructuresHandle();

    public Message sendMessage(Long conversationId, SendMessageRequest request, Long userId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = conversationService.validateUserInConversation(user, conversationId);

        Message message = Message.builder()
                .content(request.getContent())
                .messageType(request.getMessageType())
                .sender(user)
                .status(Message.Status.SENT)
                .conversation(conversation)
                .deleted(false)
                .build();

        conversation.setUpdatedAt(Instant.now());
        Conversation savedConversation = conversationService.save(conversation);

        Set<File> files = new HashSet<>();

        if(request.getFileIds() != null && request.getFileIds().size() != 0) {
            for(Long fileId: request.getFileIds()) {
                File file = fileService.findById(fileId).orElseThrow(() -> new IllegalArgumentException("File id: " + fileId + " not found"));
                files.add(file);
            }
        }

        Message savedMessage = save(message);

        files.forEach(file -> {
            file.setMessage(savedMessage);
            fileService.save(file);
        });

        for(User currUser: conversation.getUsers()) {
            MessageUserSetting mus = MessageUserSetting.builder()
                    .user(currUser)
                    .message(savedMessage)
                    .conversation(conversation)
                    .status(Message.Status.RECEIVED)
                    .hidden(false)
                    .build();
            messageUserSettingService.save(mus);
        }

        Message mess = messageRepository.findById(savedMessage.getId()).orElseThrow(() -> new IllegalArgumentException("No message found"));

        notificationService.sendNotificationToTopic(savedConversation, mess);

        return mess;
    }

    public MessageDTO editMessage(Long userId, Long conversationId, Long messageId, EditMessageRequest request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = conversationService.validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in specified conversation id: " + conversationId));

        if(message.getSender().getId() != userId) {
            throw new IllegalArgumentException("Cannot edit message that was not sent by you");
        }
        else {
            if(message.getDeleted())
                throw new IllegalArgumentException("Cannot edit message that was deleted");
            else if(message.getMessageType() == MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                throw new IllegalArgumentException("Cannot edit message that was not typed by user");
            else {
                message.setContent(request.getContent());
                return modelMapper.map(messageRepository.save(message), MessageDTO.class);
            }
        }
    }

    public MessageUserSetting hideMessage(Long userId, Long conversationId, Long messageId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = conversationService.validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in specified conversation id: " + conversationId));
        MessageUserSetting mus = messageUserSettingService.findByUserIdAndMessageIdAndConversationId(userId, messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Setting for message with id: " + messageId + " not found in specified conversation id: " + conversationId));

        if (mus.getHidden())
            throw new IllegalArgumentException("Message already hidden");
        else if(message.getMessageType() == MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
            throw new IllegalArgumentException("Cannot hide message that was not typed by user");
        else {
            mus.setHidden(true);
            return messageUserSettingService.save(mus);
        }

    }

    public Message deleteMessage(Long userId, Long conversationId, Long messageId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = conversationService.validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in specified conversation id: " + conversationId));

        if(message.getSender().getId() != userId) {
            throw new IllegalArgumentException("Cannot completely delete message that was not sent by you. You can only hide it");
        }
        else {
            if (message.getDeleted())
                throw new IllegalArgumentException("Message already deleted");
            else if(message.getMessageType() == MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                throw new IllegalArgumentException("Cannot completely delete message that was not typed by user");
            else {
                message.setDeleted(true);
                Message savedMessage = messageRepository.save(message);

               notificationService.sendNotificationToTopic(conversation, savedMessage);

                return savedMessage;
            }
        }
    }

    public MessageDTO recoverMessage(Long userId, Long conversationId, Long messageId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = conversationService.validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in specified conversation id: " + conversationId));

        if(message.getSender().getId() != userId) {
            throw new IllegalArgumentException("Cannot completely delete message that was not sent by you. You can only hide it");
        }
        else {
            if (!message.getDeleted())
                throw new IllegalArgumentException("Message not deleted yet. No need to recover");
            else if(message.getMessageType() == MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                throw new IllegalArgumentException("Cannot recover message that was not typed by user");
            else {
                message.setDeleted(false);
                return modelMapper.map(messageRepository.save(message), MessageDTO.class);
            }
        }
    }

    public Page<MessageDTO> getUnseenMessages(Long userId, Long conversationId, Pageable pageable) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        conversationService.validateUserInConversation(user, conversationId);
        Page<Message> messages = messageRepository.findUnseenMessages(pageable, conversationId, userId);
        Page<MessageDTO> messageList = messages.map(message -> modelMapper.map(message, MessageDTO.class));
        return messageList;
    }

    public Set<MessageUserSetting> markMessagesAsSeen(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        conversationService.validateUserInConversation(user, conversationId);
        Set<MessageUserSetting> musS = messageUserSettingService.findUnseenMessages(userId, conversationId);
        musS.stream().forEach(mus -> {
            mus.setStatus(Message.Status.SEEN);
            mus.setDateSeen(Instant.now());
            messageUserSettingService.save(mus);
        });

        Set<MessageUserSetting> set = messageUserSettingService.findByUserIdAndConversationId(userId, conversationId);
        return set;
    }

    public MessageDTO getLatestMessage(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        conversationService.validateUserInConversation(user, conversationId);
        Message message = messageRepository.findLatestMessageByConversationId(conversationId).orElseThrow(() -> new IllegalArgumentException("Message or conversation not found"));
        MessageDTO messageDTO = modelMapper.map(message, MessageDTO.class);
        return messageDTO;
    }

    public Page<MessageDTO> getHiddenMessages(Long userId, Long conversationId, Pageable pageable) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        conversationService.validateUserInConversation(user, conversationId);
        Page<Message> messages = messageRepository.findAllBeforeLeft(pageable, userId, conversationId);
        Page<MessageDTO> messageList = messages.map(message -> modelMapper.map(message, MessageDTO.class));
        return messageList;
    }

    public Page<MessageDTO> getMessages(Long userId, Long conversationId, Pageable pageable) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(conversationService.userWasInConversation(userId, conversationId)) {
            Optional<ArchivedConversation> archivedConversation = archivedConversationService.findByUserIdAndConversationId(userId, conversationId);
            if (!archivedConversation.isPresent()) {
                Page<Message> messages = messageRepository.findAllBeforeLeft(pageable, userId, conversationId);
                Page<MessageDTO> messageList = messages.map(message -> modelMapper.map(message, MessageDTO.class));
                return messageList;
            } else {
                Page<Message> messages = messageRepository.findMessagesAfterArchiveAndBeforeLeft(pageable, userId, conversationId);
                Page<MessageDTO> messageList = messages.map(message -> modelMapper.map(message, MessageDTO.class));
                return messageList;
            }
        }
        return null;
    }

    public Set<MessageDTO> getMessagesForFilter(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(conversationService.userWasInConversation(userId, conversationId)) {
            Optional<ArchivedConversation> archivedConversation = archivedConversationService.findByUserIdAndConversationId(userId, conversationId);
            if (!archivedConversation.isPresent()) {
                Set<Message> messages = messageRepository.findAllBeforeLeftForFilter(userId, conversationId);
                Set<MessageDTO> messageList = messages.stream().map(message -> modelMapper.map(message, MessageDTO.class)).collect(Collectors.toSet());
                return messageList;
            } else {
                Set<Message> messages = messageRepository.findMessagesAfterArchiveAndBeforeLeftForFilter(userId, conversationId);
                Set<MessageDTO> messageList = messages.stream().map(message -> modelMapper.map(message, MessageDTO.class)).collect(Collectors.toSet());
                return messageList;
            }
        }
        return null;
    }

    public Page<MessageDTO> getArchivedMessages(Long userId, Long archivedConversationId, Pageable pageable) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ArchivedConversation archivedConversation = archivedConversationService.findByIdAndIsRemoved(archivedConversationId, false).orElseThrow(() -> new IllegalArgumentException("Archived conversation not found for id: " + archivedConversationId + " Or it has been removed"));
        Page<Message> messages = messageRepository.findMessagesBeforeArchiveAndBeforeLeft(pageable, userId, archivedConversationId);
        Page<MessageDTO> messageList = messages.map(message -> modelMapper.map(message, MessageDTO.class));
        return messageList;
    }

    public Message save (Message message) {
        return messageRepository.save(message);
    }

    public Page<MessageDTO> filteredMessages(Set<MessageDTO> messages, String query, Pageable pageable) {
        Set<MessageDTO> messageSet = messages.stream()
                .filter(m -> {
                    if(m.getContent() != null)
                        return m.getContent().toLowerCase().contains(query.toLowerCase());
                    else
                        return false;})
                .collect(Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(MessageDTO::getCreatedAt).reversed())));

        return handle.setToPage(messageSet, pageable);
    }
}
