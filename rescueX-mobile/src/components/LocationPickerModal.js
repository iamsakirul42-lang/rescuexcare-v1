import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { KOLKATA_LOCATIONS } from '../data/locations';

export default function LocationPickerModal({ visible, onClose, onSelect, selectedLocation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = KOLKATA_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (location) => {
    onSelect(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search area or city..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Location List */}
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item === selectedLocation;
              return (
                <TouchableOpacity 
                  style={[styles.locationItem, isSelected && styles.locationItemSelected]} 
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons 
                      name="map-marker-outline" 
                      size={20} 
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    <Text style={[styles.locationText, isSelected && styles.locationTextSelected]}>
                      {item}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  locationItemSelected: {
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderBottomWidth: 0,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  locationTextSelected: {
    color: theme.colors.primary,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
  },
});
