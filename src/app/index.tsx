// step 1 check screen: fonts, tokens, mochi and pill buttons. replaced by the real splash in step 2.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Mochi } from '@/components/Mochi';
import { PillButton } from '@/components/PillButton';
import { color, type, useLayout } from '@/theme';

export default function StepOne() {
  const insets = useSafeAreaInsets();
  const { gutter, width } = useLayout();
  const [taps, setTaps] = useState(0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: gutter },
      ]}
    >
      <Text style={type.display}>
        mochi<Text style={{ color: color.pinkDeep }}>cam</Text>
      </Text>
      <Text style={[type.body, styles.sub]}>step 1 check · {Math.round(width)}dp wide</Text>

      <Mochi size={156} bob />
      <View style={styles.row}>
        <Mochi size={90} mood="wink" bob />
        <Mochi size={90} mood="sleep" />
      </View>

      <PillButton xl label="start booth ♡" onPress={() => setTaps((n) => n + 1)} />
      <PillButton label="next ♡" />
      <View style={styles.row}>
        <PillButton
          variant="secondary"
          label="share"
          icon={<Icon name="share" size={20} />}
          style={styles.flex}
        />
        <PillButton variant="ghost" label="delete" icon={<Icon name="trash" size={20} />} style={styles.flex} />
      </View>
      <PillButton label="that's me! ✨" disabled />
      <Text style={[type.caption, styles.sub]}>squished {taps} times ♡</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.cream },
  content: { alignItems: 'center', gap: 16 },
  row: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', justifyContent: 'center' },
  flex: { flex: 1 },
  sub: { color: color.plumSoft },
});
