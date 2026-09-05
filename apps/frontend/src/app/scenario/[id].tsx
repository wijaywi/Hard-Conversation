import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../theme';
import { useState } from 'react';

import { scenarios } from '../../../../../packages/scenarios/src/index';

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const scenario = scenarios.find(s => s.id === id);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/v1/simulation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: id, difficulty: 2 })
      });
      const data = await res.json();
      
      router.push({
        pathname: `/conversation/[id]`,
        params: { 
          id: data.conversation_id, 
          openingLine: data.opening_line 
        }
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to connect to backend server. Is it running on port 3000?');
    } finally {
      setLoading(false);
    }
  };

  if (!scenario) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{scenario.title}</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>CONTEXT</Text>
        <Text style={styles.body}>{scenario.context}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>YOUR ROLE</Text>
        <Text style={styles.body}>{scenario.userRole}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>THEIR ROLE</Text>
        <Text style={styles.body}>{scenario.aiRole}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>YOUR OBJECTIVE</Text>
        <Text style={styles.objective}>{scenario.userObjective}</Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleStart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>START SIMULATION</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.bodyMuted,
  },
  objective: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.h3,
    color: colors.background,
  }
});
