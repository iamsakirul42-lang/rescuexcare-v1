import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function RatingScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    navigation.replace('BookingCompleted');
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate Experience</Text>
        <Text style={styles.headerSubtitle}>How was your expert?</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={{ alignItems: 'center', width: '100%', marginBottom: -20 }}>
            <LottieView
              source={require('../../../assets/animations/business-target.json')}
              autoPlay
              loop
              style={{ width: width, height: width * 0.7, resizeMode: 'cover' }}
            />
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.questionText}>Tap to rate your experience</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <MaterialCommunityIcons 
                    name={rating >= star ? 'star' : 'star-outline'} 
                    size={48} 
                    color={rating >= star ? '#EAB308' : '#D1D5DB'} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Optional Review</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Write a short review..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={review}
                onChangeText={setReview}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, rating > 0 ? { backgroundColor: '#F97316' } : { backgroundColor: '#D1D5DB' }]} 
              onPress={handleSubmit}
              disabled={rating === 0}
            >
              <Text style={styles.primaryButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    zIndex: 10,
  },
  glassCard: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 120,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
});

