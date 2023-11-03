package com.elec5619.group14.flicker.ChatApp;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.payload.LoginRequest;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.payload.TranslationRequest;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
public class TranslationTest extends BaseTest{
    @Test
    public void testTranslate() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        TranslationRequest translationRequest = new TranslationRequest();
        translationRequest.setText("Bonjour");
        translationRequest.setTargetLanguage("en");

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = gson.toJson(translationRequest);

        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .post(BASE_URL + "/api/translate")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonOutput))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        assertTrue(responseContent.contains("Good morning"));

        logout(token);
    }
}
