import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Shadow } from '../../constants/theme';

interface StatCardProps {
  value: number | string;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface StatsRowProps {
  snippets: number;
  favorites: number;
  files: number;
  exports: number;
}

export function StatsRow({ snippets, favorites, files, exports: exps }: StatsRowProps) {
  return (
    <View style={styles.row}>
      <StatCard value={snippets} label="Snippets" color={Colors.primary} />
      <StatCard value={favorites} label="Favorites" color={Colors.warning} />
      <StatCard value={files} label="Files" color={Colors.info} />
      <StatCard value={exps} label="Exports" color={Colors.success} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  value: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
});
