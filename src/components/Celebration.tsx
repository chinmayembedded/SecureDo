import React from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';

interface CelebrationProps {
  visible: boolean;
  onClose: () => void;
}

const CELEBRATION_MESSAGES = [
  "Great job! 🎉",
  "Well done! ⭐",
  "Kudos! 🌟",
  "Bravo! 🎯",
  "Awesome! 🚀",
  "You rock! 💫",
  "Fantastic! 🌈",
  "Keep it up! 💪",
  "Brilliant! ✨",
  "Superb! 🏆"
];

export function Celebration({ visible, onClose }: CelebrationProps) {
  const [message] = React.useState(() => 
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );

  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          style={styles.content}
        >
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ loop: true, duration: 2000 }}
          >
            <Feather name="star" size={50} color={theme.colors.primary} />
          </MotiView>
          <Text style={styles.text}>{message}</Text>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
}); 