import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../theme';

export default function EvaluationScreen() {
  const { id, evaluationData } = useLocalSearchParams();
  const router = useRouter();

  let evaluation = {
    score: 0,
    evaluationDegraded: false,
    falsifiedAssumptions: [] as { assumption: string; reality: string; turnIndex: number | null }[],
    feedback: {
      strengths: ["Unknown"],
      weaknesses: ["Unknown"],
      turningPoint: "Unknown",
      nextAttemptGoal: "Unknown"
    }
  };

  if (evaluationData) {
    try {
      const parsed = JSON.parse(evaluationData as string);
      evaluation = parsed;
    } catch (e) {
      console.error("Failed to parse eval data", e);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>EVALUATION</Text>
      
      {evaluation.evaluationDegraded && (
        <View style={styles.degradedBanner}>
          <Text style={styles.degradedTitle}>⚠️ DEGRADED EVALUATION</Text>
          <Text style={styles.degradedText}>
            Our AI analysis service is currently unavailable (network timeout or limit reached). 
            A baseline deterministic score has been calculated, but detailed narrative feedback could not be generated for this attempt.
          </Text>
        </View>
      )}
      
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreText}>{evaluation.score}</Text>
      </View>

      <Text style={styles.verdict}>
        {evaluation.score > 80 ? 'WELL DONE' : 'ROOM FOR IMPROVEMENT'}
      </Text>

      {!evaluation.evaluationDegraded && evaluation.falsifiedAssumptions && evaluation.falsifiedAssumptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>FALSIFIED ASSUMPTIONS</Text>
          {evaluation.falsifiedAssumptions.map((fa, i) => (
            <View key={i} style={styles.falsifiedBlock}>
              <Text style={styles.body}>
                <Text style={styles.crossIcon}>✗</Text> {fa.assumption}
              </Text>
              <Text style={styles.body}>
                <Text style={styles.checkIcon}>✓</Text> {fa.reality}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>WHAT WORKED</Text>
        {evaluation.feedback.strengths.map((s: string, i: number) => (
          <Text key={i} style={styles.body}>• {s}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>BIGGEST WEAKNESS</Text>
        {evaluation.feedback.weaknesses.map((w: string, i: number) => (
          <Text key={i} style={styles.body}>• {w}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>THE TURNING POINT</Text>
        <Text style={styles.body}>{evaluation.feedback.turningPoint}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>NEXT ATTEMPT GOAL</Text>
        <Text style={styles.goalText}>{evaluation.feedback.nextAttemptGoal}</Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => router.navigate('/')}
      >
        <Text style={styles.retryButtonText}>TRY AGAIN (HARDER)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  degradedBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  degradedTitle: {
    ...typography.h3,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  degradedText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  falsifiedBlock: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.sm,
    borderRadius: 6,
  },
  crossIcon: {
    fontWeight: 'bold',
    color: colors.danger,
  },
  checkIcon: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreCircle: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreText: {
    ...typography.h1,
    fontSize: 48,
  },
  verdict: {
    ...typography.h3,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  label: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  goalText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  spacer: {
    height: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.text,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.h3,
    color: colors.background,
  }
});
