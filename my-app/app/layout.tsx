import React from 'react';
import { SafeAreaView } from 'react-native';
import TabOneScreen from "./(tabs)/index"; // Adjusted the import path if necessary

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TabOneScreen />
    </SafeAreaView>
  );
}
