import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SettingsItem {
  label: string;
  value: string;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
}

export function SettingsSection({ title, items }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});