package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.ConversationUserSetting;
import com.elec5619.group14.flicker.ChatApp.model.payload.PushNotificationRequest;
import com.elec5619.group14.flicker.ChatApp.model.payload.SubscriptionRequest;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private ConversationUserSettingService conversationUserSettingService;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    public String sendMessageToToken(PushNotificationRequest request) throws ExecutionException, InterruptedException {
        Message message = getPreconfiguredMessageToToken(request);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = ((Gson) gson).toJson(message);
        String response = sendAndGetResponse(message);
        System.out.println("Sent message to token. Device token: " + request.getToken() + ", " + response + " msg " + jsonOutput);
        return response;
    }

    public String sendMessageToTopic(Map<String, String> data, PushNotificationRequest request) throws ExecutionException, InterruptedException {
        Message message = getPreconfiguredMessageToTopic(data, request);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = ((Gson) gson).toJson(message);
        String response = sendAndGetResponse(message);
        System.out.println("Sent message to topic. Topic: " + request.getTopic() + ", " + response + " msg " + jsonOutput);
        return response;
    }

    public String subscribeToTopic(SubscriptionRequest request) {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(request.getTokens(), request.getTopic());
            return "Subscription Successful";
        } catch (Exception e) {
            e.printStackTrace();
            return "Subscription Failed: " + e.getMessage();
        }
    }

    public String unsubscribeFromTopic(SubscriptionRequest request) {
        try {
            FirebaseMessaging.getInstance().unsubscribeFromTopic(request.getTokens(), request.getTopic());
            return "Unsubscription Successful";
        } catch (Exception e) {
            e.printStackTrace();
            return "Unsubscription Failed: " + e.getMessage();
        }
    }

    private Message getPreconfiguredMessageToToken(PushNotificationRequest request) {
        return getPreconfiguredMessageBuilder(request).setToken(request.getToken())
                .build();
    }

    private Message getPreconfiguredMessageToTopic(Map<String, String> data, PushNotificationRequest request) {
        return getPreconfiguredMessageBuilder(request).putAllData(data).setTopic(request.getTopic())
                .build();
    }

    private Message.Builder getPreconfiguredMessageBuilder(PushNotificationRequest request) {
        AndroidConfig androidConfig = getAndroidConfig(request.getTopic() != null ? request.getTopic() : "");
        com.google.firebase.messaging.ApnsConfig apnsConfig = getApnsConfig(request.getTopic() != null ? request.getTopic() : "");
        return Message.builder()
                .setApnsConfig(apnsConfig).setAndroidConfig(androidConfig)
                .setNotification(Notification.builder().setTitle(request.getTitle()).setBody(request.getMessage()).build());
    }

    private AndroidConfig getAndroidConfig(String topic) {
        return AndroidConfig.builder()
                .setTtl(Duration.ofMinutes(2).toMillis()).setCollapseKey(topic)
                .setPriority(AndroidConfig.Priority.HIGH)
                .setNotification(AndroidNotification.builder().setSound("default")
                        .setColor("#FFFF00").setTag(topic).build()).build();
    }

    private ApnsConfig getApnsConfig(String topic){
        return ApnsConfig.builder()
                .setAps(Aps.builder().setCategory(topic).setThreadId(topic).build()).build();
    }

    private String sendAndGetResponse(Message message) throws ExecutionException, InterruptedException {
        return FirebaseMessaging.getInstance().sendAsync(message).get();
    }

    public void sendNotificationToTopic(Conversation conversation, com.elec5619.group14.flicker.ChatApp.model.Message message) {
        Set<User> usersSubscribed = conversation.getUsers().stream().filter(u -> {
            if (u.getNotification() != null)
                return u.getNotification();
            else
                return false;
        }).collect(Collectors.toSet());

        Set<Long> userIdsSubscribed = new HashSet<>();

        usersSubscribed.forEach(us -> userIdsSubscribed.add(us.getId()));

        Set<ConversationUserSetting> cus = conversationUserSettingService.findByConversationId(conversation.getId());

        Set<ConversationUserSetting> filteredCus = cus.stream().filter(c -> {
            if (c.getNotification() != null)
                return userIdsSubscribed.contains(c.getUser().getId()) && c.getNotification();
            else
                return false;
        }).collect(Collectors.toSet());

        filteredCus.forEach(c -> {
            simpMessagingTemplate.convertAndSend("/topic/notification/user/" + c.getUser().getId() + "/conversation/" + conversation.getId(), message);
        });
    }
}
