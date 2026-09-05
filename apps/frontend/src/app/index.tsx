import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../theme';
import { useEffect, useState } from 'react';
import { scenarios } from '../../../../packages/scenarios/src/index';

export default function ScenarioLibraryScreen() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [velocity, setVelocity] = useState<number>(0);

  useEffect(() => {
    fetch('http://localhost:3000/v1/user/progression')
      .then(res => res.json())
      .then(data => {
        setUnlockedLevel(data.unlockedLevel || 1);
        setVelocity(data.averageVelocity || 0);
      })
      .catch(err => console.error('Failed to fetch progression:', err));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Practice before it matters.</Text>
        <View style={styles.progressionBadge}>
          <Text style={styles.progressionText}>Lvl {unlockedLevel}</Text>
          <Text style={styles.velocityText}>Velocity: {velocity > 0 ? '+' : ''}{velocity.toFixed(1)}</Text>
        </View>
      </View>
      
      <FlatList
        data={scenarios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isLocked = item.difficulty > unlockedLevel;
          return (
            <TouchableOpacity 
              style={[styles.card, isLocked && styles.cardLocked]}
              onPress={() => {
                if (!isLocked) router.push(`/scenario/${item.id}`);
              }}
              activeOpacity={isLocked ? 1 : 0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.category, isLocked && styles.textLocked]}>{item.category}</Text>
                {isLocked && <Text style={styles.lockIcon}>?? Lvl {item.difficulty} Required</Text>}
              </View>
              <Text style={[styles.title, isLocked && styles.textLocked]}>{item.title}</Text>
              <View style={styles.footer}>
                <Text style={[styles.difficulty, isLocked && styles.textLocked]}>Difficulty: {item.difficulty}/5</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  header: {
    ...typography.h2,
    flex: 1,
  },
  progressionBadge: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  progressionText: {
    ...typography.h3,
    color: colors.primary,
  },
  velocityText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  cardLocked: {
    opacity: 0.6,
    borderLeftColor: colors.border,
    backgroundColor: '#1a1a1a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lockIcon: {
    ...typography.caption,
    color: '#ff4444',
  },
  textLocked: {
    color: colors.textMuted,
  },
  category: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficulty: {
    ...typography.bodyMuted,
  }
});

