import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../theme';

type Message = {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
};

export default function ConversationScreen() {
  const { id, openingLine } = useLocalSearchParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'AI', text: (openingLine as string) || "I need you to log on this weekend." }
  ]);
  const [inputText, setInputText] = useState('');
  const [pressureLevel, setPressureLevel] = useState<number>(2); // 1-5
  const [isTyping, setIsTyping] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || isEvaluating) return;

    const userText = inputText.trim();
    const newMsg: Message = { id: Date.now().toString(), sender: 'USER', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:3000/v1/simulation/${id}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, turn_number: messages.length + 1 })
      });
      const data = await res.json();
      
      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), sender: 'AI', text: data.ai_response }
      ]);
      setPressureLevel(data.new_pressure);
      
      if (data.is_terminated) {
        handleEvaluate();
      }
    } catch (error) {
      console.error('Error sending turn:', error);
      alert('Failed to connect to backend server.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleEvaluate = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch(`http://localhost:3000/v1/simulation/${id}/evaluate`, {
        method: 'POST'
      });
      const data = await res.json();
      
      setIsEvaluating(false); // Reset sebelum navigasi untuk cegah nyangkut
      
      router.push({
        pathname: `/evaluation/[id]`,
        params: { 
          id: id as string,
          evaluationData: JSON.stringify(data)
        }
      });
    } catch (error) {
      console.error('Error evaluating:', error);
      alert('Failed to evaluate conversation.');
      setIsEvaluating(false);
    }
  };

  const pressureColor = (colors.pressureColors as any)[pressureLevel] || colors.pressureColors[1];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.pressureBar, { backgroundColor: pressureColor }]} />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <Text style={styles.scenarioTitle}>SAY NO TO WEEKEND WORK</Text>
        <Text style={styles.aiRoleLabel}>YOUR BOSS</Text>
        
        {messages.map((msg, idx) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'USER' ? styles.messageUser : styles.messageAI]}>
            <Text style={[styles.messageText, msg.sender === 'USER' ? styles.textUser : styles.textAI]}>
              {msg.text}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageWrapper, styles.messageAI]}>
            <Text style={[styles.messageText, styles.textAI, { opacity: 0.5 }]}>typing...</Text>
          </View>
        )}
      </ScrollView>

      {isEvaluating && (
        <View style={styles.evaluatingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.evaluatingText}>EVALUATING RESPONSES...</Text>
        </View>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, (isTyping || isEvaluating) && styles.inputDisabled]}
          placeholder="Type your response..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isTyping && !isEvaluating}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (isTyping || isEvaluating) && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={isTyping || isEvaluating}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.evalButton, isEvaluating && styles.evalButtonDisabled]} 
        onPress={handleEvaluate}
        disabled={isEvaluating}
      >
        {isEvaluating ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.evalButtonText}>END & EVALUATE</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressureBar: {
    height: 3,
    width: '100%',
    opacity: 0.8,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  scenarioTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  aiRoleLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  messageWrapper: {
    marginBottom: spacing.xl,
    maxWidth: '85%',
  },
  messageAI: {
    alignSelf: 'flex-start',
  },
  messageUser: {
    alignSelf: 'flex-end',
  },
  messageText: {
    ...typography.body,
    fontSize: 18, // Slightly larger for cinematic reading
    lineHeight: 28,
  },
  textAI: {
    color: colors.text,
  },
  textUser: {
    color: colors.textMuted,
  },
  inputArea: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceHighlight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: spacing.md,
    padding: spacing.md,
  },
  sendButtonText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  evalButton: {
    padding: spacing.md,
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  evalButtonText: {
    ...typography.caption,
    color: colors.danger,
  },
  inputDisabled: { opacity: 0.5 },
  sendButtonDisabled: { opacity: 0.5 },
  evalButtonDisabled: { opacity: 0.7 },
  evaluatingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  evaluatingText: { color: colors.accent, marginTop: spacing.md }
});
