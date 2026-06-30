import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { cart, updateQuantity, removeFromCart, cartTotal } = useBooking();

  if (cart.length === 0) {
    return (
      <View style={styles.mainContainer}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Looks like you haven't added any services yet.</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {cart.map((item, index) => (
          <View key={index} style={styles.cartItemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.service.illustration} size={28} color="#ff5e2c" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.service.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{item.service.price} {item.service.priceLabel ? item.service.priceLabel : ''}
                </Text>
              </View>
            </View>
            
            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromCart(item.service.id)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>

              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.service.id, item.quantity - 1)}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#ff5e2c" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity 
                  style={[styles.qtyButton, { backgroundColor: '#ff5e2c' + '10' }]}
                  onPress={() => updateQuantity(item.service.id, item.quantity + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#ff5e2c" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.billingSection}>
          <Text style={styles.billingTitle}>Billing Details</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Subtotal</Text>
            <Text style={styles.billingValue}>₹{cartTotal}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billingRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{cartTotal}</Text>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomTotalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>₹{cartTotal}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('CheckoutAddressScreen')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#ff5e2c',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#ff5e2c',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  browseButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 94, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#4B5563',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  removeText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ff5e2c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    marginHorizontal: 16,
  },
  billingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  billingTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billingLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#4B5563',
  },
  billingValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#1A1A1A',
  },
  totalValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#ff5e2c',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomTotalContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#6B7280',
  },
  bottomTotalValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 22,
    color: '#1A1A1A',
  },
  checkoutButton: {
    backgroundColor: '#ff5e2c',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  checkoutButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  }
});
