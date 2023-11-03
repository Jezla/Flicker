package com.elec5619.group14.flicker.ChatApp;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.payload.LoginRequest;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.dto.MessageDTO;
import com.elec5619.group14.flicker.ChatApp.model.dto.PageDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
public class MessageTest extends BaseTest {

    @Test
    public void testGetMessages() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/message/get/1")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<MessageDTO> messages = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(10, messages.getContent().size());
        assertEquals(10, messages.getSize());
        assertEquals(65L, messages.getTotalElements());

        logout(token);
    }

    @Test
    public void testGetUnseenMessages() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/message/get/unseen/1")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<MessageDTO> messages = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(0, messages.getContent().size());
        assertEquals(10, messages.getSize());
        assertEquals(0, messages.getTotalElements());

        logout(token);
    }
}
