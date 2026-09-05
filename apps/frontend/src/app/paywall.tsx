import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { colors, typography, spacing } from '../theme';

export default function PaywallScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLoading(false);
      return;
    }
    
    // Fetch available packages from RevenueCat
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e: any) {
        console.error("Error fetching offerings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        // Unlock premium features
        Alert.alert("Success", "You are now a Premium member!");
        router.back();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Failed", e.message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        Alert.alert("Success", "Purchases restored!");
        router.back();
      } else {
        Alert.alert("Notice", "No active premium subscription found.");
      }
    } catch (e: any) {
      Alert.alert("Restore Failed", e.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PRACTICE BEFORE IT MATTERS</Text>
      
      <Text style={styles.title}>Unlock Unlimited Mastery</Text>
      
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>• Unlimited Conversation Practice</Text>
        <Text style={styles.featureItem}>• Brutal Mode (Level 5 Pressure)</Text>
        <Text style={styles.featureItem}>• Detailed Advanced Feedback</Text>
        <Text style={styles.featureItem}>• High-Stakes Scenarios (Salary, Firing)</Text>
      </View>

      <View style={styles.spacer} />

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={styles.packagesContainer}>
          {packages.length === 0 ? (
            <Text style={styles.errorText}>No subscriptions available at this time.</Text>
          ) : (
            packages.map((pkg) => (
              <TouchableOpacity 
                key={pkg.identifier} 
                style={styles.packageCard}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
              >
                <View>
                  <Text style={styles.packageTitle}>{pkg.product.title.replace('(Hard Conversation)', '')}</Text>
                  <Text style={styles.packageDesc}>{pkg.product.description}</Text>
                </View>
                <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {purchasing && (
        <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} />
      )}

      <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={purchasing}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} disabled={purchasing}>
        <Text style={styles.cancelText}>Not Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  header: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  featureList: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  featureItem: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  packagesContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  packageCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageTitle: {
    ...typography.h3,
  },
  packageDesc: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  packagePrice: {
    ...typography.h2,
    color: colors.accent,
  },
  restoreBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  restoreText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cancelBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.bodyMuted,
    textAlign: 'center',
  }
});
