import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { HomeScreen } from '../src/components/HomeScreen';
import { TodoList } from '../src/components/TodoList';

export default function DailyHabits() {
  const [hasOnboarded, setHasOnboarded] = useState(false);

  if (!hasOnboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <HomeScreen onGetStarted={() => setHasOnboarded(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <TodoList />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  content: {
    flex: 1
  }
}); 