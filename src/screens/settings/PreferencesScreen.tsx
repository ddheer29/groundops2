import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/common/ScreenHeader';
import Icon from '../../components/common/Icon';

export const PreferencesScreen = () => {
  const { colors, spacing, borderRadius, themeSetting, setThemeSetting } = useTheme();
  const insets = useSafeAreaInsets();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'>('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Display & Preferences" showBack />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        {/* Theme Mode Toggle */}
        <AppText variant="caption" color="secondary" weight="700" style={{ marginBottom: spacing.xs }}>
          VISUAL THEME INTERFACE
        </AppText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
              padding: spacing.md,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <View style={styles.themeRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setThemeSetting('light')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeSetting === 'light' ? colors.primary : colors.surfaceSubtle,
                  borderRadius: borderRadius.lg,
                  borderColor: themeSetting === 'light' ? colors.primary : colors.border,
                },
              ]}
            >
              <Icon
                name="sun"
                size={22}
                color={themeSetting === 'light' ? '#FFFFFF' : colors.textPrimary}
              />
              <AppText
                variant="bodySmall"
                weight="700"
                style={{
                  color: themeSetting === 'light' ? '#FFFFFF' : colors.textPrimary,
                  marginTop: 6,
                }}
              >
                Light
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setThemeSetting('dark')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeSetting === 'dark' ? colors.primary : colors.surfaceSubtle,
                  borderRadius: borderRadius.lg,
                  borderColor: themeSetting === 'dark' ? colors.primary : colors.border,
                },
              ]}
            >
              <Icon
                name="moon"
                size={22}
                color={themeSetting === 'dark' ? '#FFFFFF' : colors.textPrimary}
              />
              <AppText
                variant="bodySmall"
                weight="700"
                style={{
                  color: themeSetting === 'dark' ? '#FFFFFF' : colors.textPrimary,
                  marginTop: 6,
                }}
              >
                Dark
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setThemeSetting('system')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeSetting === 'system' ? colors.primary : colors.surfaceSubtle,
                  borderRadius: borderRadius.lg,
                  borderColor: themeSetting === 'system' ? colors.primary : colors.border,
                },
              ]}
            >
              <Icon
                name="smartphone"
                size={22}
                color={themeSetting === 'system' ? '#FFFFFF' : colors.textPrimary}
              />
              <AppText
                variant="bodySmall"
                weight="700"
                style={{
                  color: themeSetting === 'system' ? '#FFFFFF' : colors.textPrimary,
                  marginTop: 6,
                }}
              >
                System
              </AppText>
            </TouchableOpacity>
          </View>

          {themeSetting === 'system' && (
            <AppText
              variant="caption"
              color="secondary"
              style={{ textAlign: 'center', marginTop: spacing.sm }}
            >
              System theme automatically matches your device appearance (Light / Dark).
            </AppText>
          )}
        </View>

        {/* Language Selection */}
        <AppText variant="caption" color="secondary" weight="700" style={{ marginBottom: spacing.xs }}>
          LOCALE & LANGUAGE
        </AppText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <RadioItem
            label="English (United States)"
            isSelected={language === 'en'}
            onSelect={() => setLanguage('en')}
          />
          <RadioItem
            label="Español (América Latina)"
            isSelected={language === 'es'}
            onSelect={() => setLanguage('es')}
          />
          <RadioItem
            label="Français (Canada)"
            isSelected={language === 'fr'}
            onSelect={() => setLanguage('fr')}
            isLast
          />
        </View>

        {/* Date and Time Formats */}
        <AppText variant="caption" color="secondary" weight="700" style={{ marginBottom: spacing.xs }}>
          DATE & TIME STANDARDS
        </AppText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
            },
          ]}
        >
          <RadioItem
            label="ISO Standard (YYYY-MM-DD)"
            isSelected={dateFormat === 'YYYY-MM-DD'}
            onSelect={() => setDateFormat('YYYY-MM-DD')}
          />
          <RadioItem
            label="European (DD/MM/YYYY)"
            isSelected={dateFormat === 'DD/MM/YYYY'}
            onSelect={() => setDateFormat('DD/MM/YYYY')}
          />
          <RadioItem
            label="12-Hour Clock (e.g. 09:30 AM)"
            isSelected={timeFormat === '12h'}
            onSelect={() => setTimeFormat('12h')}
          />
          <RadioItem
            label="24-Hour Military (e.g. 09:30, 21:30)"
            isSelected={timeFormat === '24h'}
            onSelect={() => setTimeFormat('24h')}
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
};

const RadioItem = ({
  label,
  isSelected,
  onSelect,
  isLast = false,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  isLast?: boolean;
}) => {
  const { colors, spacing } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      style={[
        styles.radioRow,
        {
          padding: spacing.md,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <AppText variant="bodySmall" weight={isSelected ? '700' : '500'} style={{ flex: 1 }}>
        {label}
      </AppText>

      <View
        style={[
          styles.radioCircle,
          {
            borderColor: isSelected ? colors.secondary : colors.border,
            backgroundColor: isSelected ? colors.secondary : 'transparent',
          },
        ]}
      >
        {isSelected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  card: {
    width: '100%',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBtn: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 1.5,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});

export default PreferencesScreen;
