package com.elec5619.group14.flicker.ChatApp;

import com.elec5619.group14.flicker.AuthApp.model.DeviceType;
import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.payload.*;
import com.elec5619.group14.flicker.AuthApp.repository.UserRepository;
import com.elec5619.group14.flicker.AuthApp.service.AuthService;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.dto.PageDTO;
import com.elec5619.group14.flicker.ChatApp.service.ConversationService;
import com.elec5619.group14.flicker.FlickerApplication;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
public class ConversationTest extends BaseTest{
    @Test
    public void testCreatePrivateChat() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        User user2 = getOrCreateUser("NHC", "");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                MockMvcRequestBuilders
                        .post(BASE_URL + "/api/conversation/create/private-chat?userId2=" + user2.getId())
                        .header("Authorization", "Bearer " + token)  // Set the authorization header
                        .contentType(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andReturn();

        String jsonResponse = mvcResult.getResponse().getContentAsString();

        Conversation conversation = objectMapper.readValue(jsonResponse, Conversation.class);
        assertEquals(2, conversation.getUsers().size());
        assertFalse(conversation.getIsGroup());

        logout(token);
    }

    @Test
    public void testGetConversations() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/conversation/get")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<Conversation> conversations = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(2, conversations.getContent().size());
        assertEquals(10, conversations.getSize());
        assertEquals(2L, conversations.getTotalElements());

        logout(token);
    }

    @Test
    public void testSearchConversation() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        String query = "NHC";

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/conversation/search?query=" + query)
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<Conversation> conversations = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(1, conversations.getContent().size());
        assertEquals(10, conversations.getSize());
        assertEquals(1L, conversations.getTotalElements());

        logout(token);
    }
}
