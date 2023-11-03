package com.elec5619.group14.flicker.ChatApp.controller;

import com.elec5619.group14.flicker.ChatApp.model.payload.OpenAITranslationRequest;
import com.elec5619.group14.flicker.ChatApp.model.payload.TranslationRequest;
import com.elec5619.group14.flicker.ChatApp.service.TranslationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.cloud.translate.Language;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    @PostMapping
    public ResponseEntity<String> translateText(@RequestBody TranslationRequest request) {
        String translatedText = translationService.translate(request.getText(), request.getTargetLanguage());
        return ResponseEntity.ok(translatedText);
    }

    @GetMapping(path = "/supported-languages")
    public ResponseEntity<List<Language>> getSupportedLanguages() {
        List<Language> languages = translationService.getSupportedLanguages();
        return ResponseEntity.ok(languages);
    }

    @GetMapping(path = "/supported-language-names")
    public ResponseEntity<List<String>> getSupportedLanguageNames() {
        List<String> supportedLanguageNames = translationService.getSupportedLanguageNames();
        return ResponseEntity.ok(supportedLanguageNames);
    }

    @GetMapping(path = "/supported-language-codes")
    public ResponseEntity<List<String>> getSupportedLanguageCodes() {
        List<String> supportedLanguageCodes = translationService.getSupportedLanguageCodes();
        return ResponseEntity.ok(supportedLanguageCodes);
    }

    @GetMapping(path = "/supported-language-codes-and-names")
    public ResponseEntity<Map<String, String>> getSupportedLanguageCodesAndNames() {
        Map<String, String> supportedLanguageCodesAndNames = translationService.getSupportedLanguageCodesAndNames();
        return ResponseEntity.ok(supportedLanguageCodesAndNames);
    }


    /*@PostMapping(path = "/openai")
    public ResponseEntity<String> generateText(@RequestBody OpenAITranslationRequest request) throws JsonProcessingException {
        String translatedText = translationService.generateText(request);
        return ResponseEntity.ok(translatedText);
    }*/
}
