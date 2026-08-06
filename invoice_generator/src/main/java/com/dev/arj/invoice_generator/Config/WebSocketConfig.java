package com.dev.arj.invoice_generator.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

    @Configuration
    @EnableWebSocketMessageBroker
    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

        @Override
        public void registerStompEndpoints(StompEndpointRegistry registry) {
            // Handshake endpoint for React client
            registry.addEndpoint("/ws-ledger")
                    .setAllowedOriginPatterns("*") // Configure origin patterns for CORS
                    .withSockJS();
        }

        @Override
        public void configureMessageBroker(MessageBrokerRegistry registry) {
            // Destinations for client subscriptions
            registry.enableSimpleBroker("/topic", "/queue");
            // Prefix for client-to-server mappings
            registry.setApplicationDestinationPrefixes("/app");
            // Prefix for user-targeted private channels
            registry.setUserDestinationPrefix("/user");
        }
    }

