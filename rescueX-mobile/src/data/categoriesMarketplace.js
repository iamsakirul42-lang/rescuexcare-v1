import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const categoriesMarketplace = {
  vehicles: [
    {
      id: "car",
      label: "Car",
      sections: [
        {
          id: "emergency",
          title: "🚨 Emergency Services",
          services: [
            {
              id: "car_puncture",
              name: "Puncture Repair",
              rating: 4.8,
              reviews: 1240,
              price: 499,
              isStartingPrice: true,
              priceLabel: "(Per Tyre)",
              duration: "30–45 min",
              includes: ["Doorstep mechanic visit", "One tyre puncture repair", "Tyre removal & installation", "Air pressure refill", "Tyre inspection", "Labour charges"],
              notIncluded: ["New tyre", "New tube", "Alloy wheel repair"],
              illustration: "car-tire-alert"
            },
            {
              id: "car_jumpstart",
              name: "Battery Jump Start",
              rating: 4.9,
              reviews: 856,
              price: 499,
              isStartingPrice: false,
              duration: "20–30 min",
              includes: ["Doorstep visit", "Battery jump start", "Battery health check", "Charging system inspection"],
              notIncluded: ["Battery replacement", "New battery"],
              illustration: "car-battery"
            },
            {
              id: "car_battery_replace",
              name: "Battery Replacement",
              rating: 4.7,
              reviews: 512,
              price: 499,
              isStartingPrice: false,
              priceLabel: "(Labour Charge)",
              duration: "30–45 min",
              includes: ["Doorstep visit", "Remove old battery", "Install new battery", "Terminal cleaning", "Battery testing"],
              notIncluded: ["Battery cost"],
              importantNote: "Battery Price Guide\n• Hatchback: ₹4,500–8,000\n• Sedan: ₹8,000–13,000\n• SUV / MPV: ₹12,000–18,000",
              illustration: "battery-sync"
            },
            {
              id: "car_towing",
              name: "Towing",
              rating: 4.6,
              reviews: 954,
              price: 1099,
              isStartingPrice: true,
              duration: "60 mins",
              includes: ["Pickup", "Safe towing", "Up to 10 km"],
              notIncluded: ["Highway recovery", "Extra distance beyond included limit"],
              importantNote: "Extra Charge\n₹35–50/km after included distance",
              illustration: "tow-truck"
            },
            {
              id: "car_fuel",
              name: "Emergency Fuel Delivery",
              rating: 4.9,
              reviews: 423,
              price: 299,
              isStartingPrice: false,
              priceLabel: "(Service Charge)",
              duration: "30 mins",
              includes: ["Doorstep fuel delivery", "Enough fuel to reach nearest petrol pump"],
              notIncluded: ["Fuel cost (charged at actual pump price)"],
              illustration: "gas-station"
            },
            {
              id: "car_lockout",
              name: "Lockout / Key Unlock",
              rating: 4.8,
              reviews: 211,
              price: 399,
              isStartingPrice: false,
              duration: "45 mins",
              includes: ["Doorstep visit", "Safe unlocking", "Non-destructive access"],
              notIncluded: ["New key", "Smart key programming"],
              illustration: "car-key"
            }
          ]
        },
        {
          id: "maintenance",
          title: "⭐ Maintenance Services",
          services: [
            {
              id: "car_ac",
              name: "AC Gas Refill",
              rating: 4.8,
              reviews: 923,
              price: 2499,
              isStartingPrice: true,
              duration: "90 mins",
              includes: ["Leak inspection", "AC gas refill", "Cooling performance test"],
              notIncluded: ["Compressor replacement", "Condenser replacement", "Cooling coil replacement"],
              illustration: "snowflake"
            },
            {
              id: "car_wash",
              name: "Doorstep Car Wash",
              rating: 4.9,
              reviews: 3200,
              price: 499,
              isStartingPrice: false,
              duration: "60 mins",
              includes: ["Exterior wash", "Interior vacuum", "Dashboard cleaning", "Tyre cleaning"],
              notIncluded: ["Ceramic coating", "Wax polish", "Deep detailing"],
              illustration: "car-wash"
            },
            {
              id: "car_alignment",
              name: "Wheel Alignment & Balancing",
              rating: 4.7,
              reviews: 1432,
              price: 1499,
              isStartingPrice: true,
              duration: "60 mins",
              includes: ["Computerised alignment", "Four-wheel balancing", "Steering inspection"],
              notIncluded: ["Tyre replacement", "Suspension repair", "ADAS calibration"],
              importantNote: "This service may be completed at a RescueX partner workshop because specialised wheel alignment equipment cannot be transported to the customer's location.",
              illustration: "tire"
            },
            {
              id: "car_oil",
              name: "Engine Oil Change",
              rating: 4.8,
              reviews: 1845,
              price: 399,
              isStartingPrice: false,
              priceLabel: "(Labour Charge)",
              duration: "60 mins",
              includes: ["Drain old oil", "Refill new oil", "Oil filter inspection", "Basic engine inspection"],
              notIncluded: ["Engine oil", "Oil filter", "Synthetic oil upgrade"],
              illustration: "oil"
            }
          ]
        },
        {
          id: "packages",
          title: "📦 RescueX Service Packages",
          services: [
            {
              id: "car_pkg_basic",
              name: "Basic Care",
              rating: 4.7,
              reviews: 840,
              price: 2399,
              isStartingPrice: false,
              duration: "2–3 hrs",
              includes: ["Engine oil change (labour)", "Oil filter inspection", "Air filter inspection", "Fluid top-up", "Brake inspection", "25-point vehicle inspection"],
              illustration: "shield-check"
            },
            {
              id: "car_pkg_standard",
              name: "Standard Care",
              rating: 4.8,
              reviews: 620,
              price: 4999,
              isStartingPrice: false,
              duration: "3–4 hrs",
              includes: ["Everything in Basic Care", "Brake fluid replacement", "Spark plug inspection/replacement", "AC inspection", "Battery health test", "Wheel balancing"],
              illustration: "shield-star"
            },
            {
              id: "car_pkg_premium",
              name: "Premium Care",
              rating: 4.9,
              reviews: 410,
              price: 7999,
              isStartingPrice: false,
              duration: "5–6 hrs",
              includes: ["Everything in Standard Care", "All filters replacement", "Transmission oil service", "Wheel alignment", "Exterior polish", "Interior vacuum", "50-point inspection"],
              illustration: "shield-crown"
            }
          ]
        }
      ]
    },
    {
      id: "bike",
      label: "Bike",
      sections: [
        {
          id: "emergency",
          title: "🚨 Emergency Services",
          services: [
            {
              id: "bike_puncture",
              name: "Puncture Repair",
              rating: 4.8,
              reviews: 954,
              price: 599,
              isStartingPrice: true,
              priceLabel: "(Per Tyre)",
              duration: "20–30 min",
              includes: ["Doorstep mechanic visit", "One tyre puncture repair", "Tyre removal & installation", "Air pressure refill", "Tyre inspection", "Labour charges"],
              notIncluded: ["New tyre", "New tube", "Alloy wheel repair"],
              illustration: "tire"
            },
            {
              id: "bike_jumpstart",
              name: "Battery Jump Start",
              rating: 4.9,
              reviews: 732,
              price: 299,
              isStartingPrice: false,
              duration: "15–20 min",
              includes: ["Doorstep visit", "Battery jump start", "Battery health check", "Charging system inspection"],
              notIncluded: ["Battery replacement", "New battery"],
              illustration: "car-battery"
            },
            {
              id: "bike_battery_replace",
              name: "Battery Replacement",
              rating: 4.7,
              reviews: 410,
              price: 249,
              isStartingPrice: false,
              priceLabel: "(Labour Charge)",
              duration: "20–30 min",
              includes: ["Doorstep visit", "Remove old battery", "Install new battery", "Battery terminal cleaning", "Battery testing"],
              notIncluded: ["Battery cost"],
              importantNote: "Battery Price Guide\n• Standard Bike: ₹900–2,000\n• Premium Bike: ₹2,000–3,500\n\nFinal battery price depends on brand, capacity, and warranty.",
              illustration: "battery-sync"
            },
            {
              id: "bike_towing",
              name: "Towing",
              rating: 4.6,
              reviews: 820,
              price: 699,
              isStartingPrice: true,
              duration: "45–60 min",
              includes: ["Pickup", "Safe bike towing", "Up to 10 km"],
              notIncluded: ["Highway recovery", "Extra distance beyond included limit"],
              importantNote: "Extra Charge\n₹20–30/km after included distance",
              illustration: "tow-truck"
            },
            {
              id: "bike_fuel",
              name: "Emergency Fuel Delivery",
              rating: 4.9,
              reviews: 312,
              price: 199,
              isStartingPrice: false,
              priceLabel: "(Service Charge)",
              duration: "20–30 min",
              includes: ["Doorstep fuel delivery", "Up to 2 litres delivery assistance"],
              notIncluded: ["Fuel cost (charged at actual pump price)"],
              illustration: "gas-station"
            },
            {
              id: "bike_lockout",
              name: "Lockout / Key Unlock",
              rating: 4.8,
              reviews: 145,
              price: 299,
              isStartingPrice: false,
              duration: "30–45 min",
              includes: ["Doorstep visit", "Safe unlocking", "Non-destructive access"],
              notIncluded: ["Key duplication", "Smart key programming"],
              illustration: "key"
            }
          ]
        },
        {
          id: "maintenance",
          title: "⭐ Maintenance Services",
          services: [
            {
              id: "bike_wash",
              name: "Doorstep Bike Wash",
              rating: 4.8,
              reviews: 1250,
              price: 299,
              isStartingPrice: false,
              duration: "30–45 min",
              includes: ["Foam wash", "Tyre cleaning", "Body wipe", "Dashboard/meter cleaning"],
              notIncluded: ["Ceramic coating", "Wax polish", "Engine detailing"],
              illustration: "water"
            },
            {
              id: "bike_denting",
              name: "Denting & Painting",
              rating: 4.7,
              reviews: 432,
              price: 699,
              isStartingPrice: true,
              duration: "2–3 hrs",
              includes: ["Dent removal", "Colour matching", "Panel repaint", "Surface finishing"],
              notIncluded: ["Major accident repair", "Plastic body replacement", "Sticker replacement"],
              illustration: "format-paint"
            },
            {
              id: "bike_oil",
              name: "Engine Oil Change",
              rating: 4.9,
              reviews: 1845,
              price: 199,
              isStartingPrice: false,
              priceLabel: "(Labour Charge)",
              duration: "30 mins",
              includes: ["Drain old oil", "Refill new oil", "Oil filter inspection", "Basic engine inspection"],
              notIncluded: ["Engine oil", "Oil filter", "Synthetic oil upgrade"],
              illustration: "oil"
            },
            {
              id: "bike_chain",
              name: "Chain Cleaning & Lubrication",
              rating: 4.8,
              reviews: 950,
              price: 249,
              isStartingPrice: false,
              duration: "20–30 min",
              includes: ["Chain cleaning", "Chain lubrication", "Tension adjustment", "Chain inspection"],
              notIncluded: ["New chain kit", "Sprocket replacement"],
              illustration: "link"
            }
          ]
        },
        {
          id: "packages",
          title: "📦 RescueX Bike Service Packages",
          services: [
            {
              id: "bike_pkg_basic",
              name: "Basic Care",
              rating: 4.7,
              reviews: 840,
              price: 499,
              isStartingPrice: false,
              duration: "1–2 hrs",
              includes: ["General inspection", "Brake inspection", "Tyre pressure check", "Battery check", "Lights & horn inspection", "20-point bike inspection"],
              illustration: "shield-check"
            },
            {
              id: "bike_pkg_standard",
              name: "Standard Care",
              rating: 4.8,
              reviews: 620,
              price: 899,
              isStartingPrice: false,
              duration: "2–3 hrs",
              includes: ["Everything in Basic Care", "Engine oil replacement (labour)", "Chain cleaning & lubrication", "Air filter cleaning", "Spark plug cleaning", "Brake adjustment", "Complimentary foam wash"],
              illustration: "shield-star"
            },
            {
              id: "bike_pkg_premium",
              name: "Premium Care",
              rating: 4.9,
              reviews: 410,
              price: 1499,
              isStartingPrice: false,
              duration: "3–4 hrs",
              includes: ["Everything in Standard Care", "Full bike inspection", "Engine tuning", "Brake servicing", "Clutch adjustment", "Electrical inspection", "Complete foam wash & polish", "35-point inspection"],
              illustration: "shield-crown"
            }
          ]
        }
      ]
    },
    {
      id: "auto",
      label: "Auto",
      sections: [
        {
          id: "auto_cng_emergency",
          title: "🚨 Emergency Services",
          services: [
            { id: "auto_cng_puncture", name: "Puncture Repair", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "tire" },
            { id: "auto_cng_jumpstart", name: "Battery Jump Start", isQuote: true, rating: 4.9, reviews: 112, duration: "Varies", illustration: "car-battery" },
            { id: "auto_cng_battery_replace", name: "Battery Replacement", isQuote: true, rating: 4.7, reviews: 89, duration: "Varies", illustration: "battery-sync" },
            { id: "auto_cng_towing", name: "Towing", isQuote: true, rating: 4.6, reviews: 234, duration: "Varies", illustration: "tow-truck" },
            { id: "auto_cng_fuel", name: "CNG Fuel Assistance", isQuote: true, rating: 4.8, reviews: 145, duration: "Varies", illustration: "gas-station" },
            { id: "auto_cng_lockout", name: "Lockout / Key Unlock", isQuote: true, rating: 4.9, reviews: 67, duration: "Varies", illustration: "key" },
            { id: "auto_cng_electrical", name: "Electrical Fault Diagnosis", isQuote: true, rating: 4.7, reviews: 198, duration: "Varies", illustration: "lightning-bolt" },
            { id: "auto_cng_engine", name: "Engine Breakdown Assistance", isQuote: true, rating: 4.8, reviews: 121, duration: "Varies", illustration: "engine" }
          ]
        },
        {
          id: "auto_cng_maintenance",
          title: "⭐ Maintenance Services",
          services: [
            { id: "auto_cng_periodic", name: "Periodic Service", isQuote: true, rating: 4.8, reviews: 345, duration: "Varies", illustration: "wrench-clock" },
            { id: "auto_cng_oil", name: "Engine Oil Change", isQuote: true, rating: 4.9, reviews: 210, duration: "Varies", illustration: "oil" },
            { id: "auto_cng_airfilter", name: "Air Filter Replacement", isQuote: true, rating: 4.7, reviews: 88, duration: "Varies", illustration: "air-filter" },
            { id: "auto_cng_sparkplug", name: "Spark Plug Replacement", isQuote: true, rating: 4.8, reviews: 132, duration: "Varies", illustration: "lightning-bolt" },
            { id: "auto_cng_brake", name: "Brake Service", isQuote: true, rating: 4.8, reviews: 267, duration: "Varies", illustration: "car-brake-alert" },
            { id: "auto_cng_clutch", name: "Clutch Adjustment", isQuote: true, rating: 4.7, reviews: 145, duration: "Varies", illustration: "car-shift-pattern" },
            { id: "auto_cng_chain", name: "Chain & Cable Inspection", isQuote: true, rating: 4.8, reviews: 92, duration: "Varies", illustration: "link" },
            { id: "auto_cng_suspension", name: "Suspension Inspection", isQuote: true, rating: 4.6, reviews: 111, duration: "Varies", illustration: "car-traction-control" }
          ]
        },
        {
          id: "auto_cng_repair",
          title: "🔧 Repair Services",
          services: [
            { id: "auto_cng_engine_repair", name: "Engine Repair", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "engine" },
            { id: "auto_cng_clutch_repair", name: "Clutch Repair", isQuote: true, rating: 4.7, reviews: 143, duration: "Varies", illustration: "car-shift-pattern" },
            { id: "auto_cng_gearbox", name: "Gearbox Repair", isQuote: true, rating: 4.6, reviews: 89, duration: "Varies", illustration: "cog" },
            { id: "auto_cng_brake_repair", name: "Brake System Repair", isQuote: true, rating: 4.8, reviews: 211, duration: "Varies", illustration: "car-brake-alert" },
            { id: "auto_cng_suspension_repair", name: "Suspension Repair", isQuote: true, rating: 4.7, reviews: 167, duration: "Varies", illustration: "car-traction-control" },
            { id: "auto_cng_elec_repair", name: "Electrical System Repair", isQuote: true, rating: 4.8, reviews: 134, duration: "Varies", illustration: "lightning-bolt" },
            { id: "auto_cng_starter", name: "Starter Motor Repair", isQuote: true, rating: 4.7, reviews: 92, duration: "Varies", illustration: "engine-outline" },
            { id: "auto_cng_alternator", name: "Alternator Repair", isQuote: true, rating: 4.8, reviews: 78, duration: "Varies", illustration: "engine-outline" },
            { id: "auto_cng_headlight", name: "Headlight & Indicator Repair", isQuote: true, rating: 4.9, reviews: 156, duration: "Varies", illustration: "car-light-dimmed" }
          ]
        },
        {
          id: "auto_cng_care",
          title: "✨ Vehicle Care",
          services: [
            { id: "auto_cng_exterior", name: "Exterior Wash", isQuote: true, rating: 4.8, reviews: 432, duration: "Varies", illustration: "water" },
            { id: "auto_cng_interior", name: "Interior Cleaning", isQuote: true, rating: 4.7, reviews: 213, duration: "Varies", illustration: "spray-bottle" },
            { id: "auto_cng_foam", name: "Foam Wash", isQuote: true, rating: 4.9, reviews: 312, duration: "Varies", illustration: "car-wash" },
            { id: "auto_cng_dash", name: "Dashboard Cleaning", isQuote: true, rating: 4.8, reviews: 145, duration: "Varies", illustration: "spray-bottle" },
            { id: "auto_cng_seat", name: "Seat Cleaning", isQuote: true, rating: 4.7, reviews: 167, duration: "Varies", illustration: "car-seat" }
          ]
        },
        {
          id: "auto_cng_premium",
          title: "💎 Premium Services",
          services: [
            { id: "auto_cng_dent", name: "Dent & Paint", isQuote: true, rating: 4.8, reviews: 189, duration: "Varies", illustration: "format-paint" },
            { id: "auto_cng_panel", name: "Body Panel Repair", isQuote: true, rating: 4.7, reviews: 134, duration: "Varies", illustration: "hammer-wrench" },
            { id: "auto_cng_polish", name: "Rubbing & Polishing", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "auto-fix" },
            { id: "auto_cng_detail", name: "Full Detailing", isQuote: true, rating: 4.9, reviews: 211, duration: "Varies", illustration: "auto-fix" }
          ]
        },
        {
          id: "auto_ev_emergency",
          title: "🚨 Emergency Services",
          services: [
            { id: "auto_ev_puncture", name: "Puncture Repair", isQuote: true, rating: 4.8, reviews: 145, duration: "Varies", illustration: "tire" },
            { id: "auto_ev_jumpstart", name: "Battery Jump Start (12V)", isQuote: true, rating: 4.9, reviews: 89, duration: "Varies", illustration: "car-battery" },
            { id: "auto_ev_towing", name: "Towing", isQuote: true, rating: 4.7, reviews: 167, duration: "Varies", illustration: "tow-truck" },
            { id: "auto_ev_lockout", name: "Lockout / Key Unlock", isQuote: true, rating: 4.8, reviews: 56, duration: "Varies", illustration: "key" },
            { id: "auto_ev_charge", name: "Charging Assistance", isQuote: true, rating: 4.9, reviews: 211, duration: "Varies", illustration: "ev-station" },
            { id: "auto_ev_motor", name: "Motor Breakdown Assistance", isQuote: true, rating: 4.7, reviews: 134, duration: "Varies", illustration: "engine-outline" }
          ]
        },
        {
          id: "auto_ev_maintenance",
          title: "⭐ Maintenance Services",
          services: [
            { id: "auto_ev_periodic", name: "Periodic EV Inspection", isQuote: true, rating: 4.9, reviews: 234, duration: "Varies", illustration: "shield-check" },
            { id: "auto_ev_brake", name: "Brake Service", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "car-brake-alert" },
            { id: "auto_ev_suspension", name: "Suspension Inspection", isQuote: true, rating: 4.7, reviews: 112, duration: "Varies", illustration: "car-traction-control" },
            { id: "auto_ev_steering", name: "Steering Inspection", isQuote: true, rating: 4.8, reviews: 89, duration: "Varies", illustration: "steering" },
            { id: "auto_ev_tyre", name: "Tyre Inspection", isQuote: true, rating: 4.9, reviews: 145, duration: "Varies", illustration: "tire" },
            { id: "auto_ev_wiring", name: "Electrical Wiring Inspection", isQuote: true, rating: 4.8, reviews: 167, duration: "Varies", illustration: "lightning-bolt" },
            { id: "auto_ev_port", name: "Charging Port Inspection", isQuote: true, rating: 4.9, reviews: 134, duration: "Varies", illustration: "power-plug" }
          ]
        },
        {
          id: "auto_ev_repair",
          title: "🔧 Repair Services",
          services: [
            { id: "auto_ev_battery_diag", name: "Traction Battery Diagnosis", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "battery-charging-100" },
            { id: "auto_ev_motor_repair", name: "Motor Repair", isQuote: true, rating: 4.7, reviews: 112, duration: "Varies", illustration: "engine-outline" },
            { id: "auto_ev_controller", name: "Motor Controller Diagnosis", isQuote: true, rating: 4.8, reviews: 89, duration: "Varies", illustration: "memory" },
            { id: "auto_ev_dcdc", name: "DC-DC Converter Inspection", isQuote: true, rating: 4.7, reviews: 67, duration: "Varies", illustration: "current-ac" },
            { id: "auto_ev_charge_repair", name: "Charging System Repair", isQuote: true, rating: 4.8, reviews: 145, duration: "Varies", illustration: "ev-station" },
            { id: "auto_ev_elec_repair", name: "Electrical Fault Repair", isQuote: true, rating: 4.8, reviews: 123, duration: "Varies", illustration: "lightning-bolt" },
            { id: "auto_ev_brake_repair", name: "Brake System Repair", isQuote: true, rating: 4.7, reviews: 167, duration: "Varies", illustration: "car-brake-alert" },
            { id: "auto_ev_suspension_repair", name: "Suspension Repair", isQuote: true, rating: 4.6, reviews: 89, duration: "Varies", illustration: "car-traction-control" }
          ]
        },
        {
          id: "auto_ev_care",
          title: "✨ Vehicle Care",
          services: [
            { id: "auto_ev_exterior", name: "Exterior Wash", isQuote: true, rating: 4.8, reviews: 312, duration: "Varies", illustration: "water" },
            { id: "auto_ev_interior", name: "Interior Cleaning", isQuote: true, rating: 4.7, reviews: 189, duration: "Varies", illustration: "spray-bottle" },
            { id: "auto_ev_foam", name: "Foam Wash", isQuote: true, rating: 4.9, reviews: 245, duration: "Varies", illustration: "car-wash" },
            { id: "auto_ev_dash", name: "Dashboard Cleaning", isQuote: true, rating: 4.8, reviews: 112, duration: "Varies", illustration: "spray-bottle" },
            { id: "auto_ev_seat", name: "Seat Cleaning", isQuote: true, rating: 4.7, reviews: 134, duration: "Varies", illustration: "car-seat" }
          ]
        },
        {
          id: "auto_ev_premium",
          title: "💎 Premium Services",
          services: [
            { id: "auto_ev_dent", name: "Dent & Paint", isQuote: true, rating: 4.8, reviews: 156, duration: "Varies", illustration: "format-paint" },
            { id: "auto_ev_panel", name: "Body Panel Repair", isQuote: true, rating: 4.7, reviews: 89, duration: "Varies", illustration: "hammer-wrench" },
            { id: "auto_ev_polish", name: "Rubbing & Polishing", isQuote: true, rating: 4.8, reviews: 112, duration: "Varies", illustration: "auto-fix" },
            { id: "auto_ev_detail", name: "Full Detailing", isQuote: true, rating: 4.9, reviews: 167, duration: "Varies", illustration: "auto-fix" }
          ]
        }
      ]
    },
    {
      id: "truck",
      label: "Truck",
      sections: [
        {
          id: "truck_emergency",
          title: "🚨 Emergency & Breakdown",
          services: [
            {
              id: "truck_puncture",
              name: "Tyre / Puncture Repair",
              isQuote: true,
              rating: 4.8,
              reviews: 432,
              duration: "Varies",
              includes: ["Doorstep mechanic visit", "Tyre inspection", "Puncture repair (if repairable)", "Air pressure refill", "Labour charges"],
              notIncluded: ["New tyre", "New tube", "Wheel rim replacement", "Crane assistance"],
              importantNote: "The final quotation depends on tyre size, number of damaged tyres, and whether the tyre can be repaired or requires replacement.",
              illustration: "tire"
            },
            {
              id: "truck_jumpstart",
              name: "Battery Jump Start",
              isQuote: true,
              rating: 4.7,
              reviews: 310,
              duration: "Varies",
              includes: ["Doorstep visit", "Jump start", "Battery voltage check", "Charging system inspection"],
              notIncluded: ["Battery replacement", "New battery"],
              importantNote: "If the battery is damaged or unable to hold charge, replacement will be quoted separately after inspection.",
              illustration: "car-battery"
            },
            {
              id: "truck_battery_replace",
              name: "Battery Replacement",
              isQuote: true,
              rating: 4.9,
              reviews: 189,
              duration: "Varies",
              includes: ["Doorstep visit", "Remove old battery", "Install new battery", "Battery terminal cleaning", "Battery testing", "Labour charges"],
              notIncluded: ["Battery cost"],
              importantNote: "Battery prices vary depending on vehicle type, battery capacity, and brand.",
              illustration: "battery-sync"
            },
            {
              id: "truck_towing",
              name: "Heavy Vehicle Towing",
              isQuote: true,
              rating: 4.6,
              reviews: 543,
              duration: "Varies",
              includes: ["Vehicle recovery", "Safe towing", "Loading & unloading"],
              notIncluded: ["Highway tolls", "Parking charges", "Long-distance towing"],
              importantNote: "The final quotation depends on truck size, vehicle weight, towing distance, and recovery equipment required.",
              illustration: "tow-truck"
            },
            {
              id: "truck_fuel",
              name: "Emergency Fuel Delivery",
              isQuote: true,
              rating: 4.8,
              reviews: 211,
              duration: "Varies",
              includes: ["Doorstep fuel delivery", "Fuel transfer assistance"],
              notIncluded: ["Fuel cost"],
              importantNote: "Fuel is charged separately at the current market price.",
              illustration: "gas-station"
            },
            {
              id: "truck_lockout",
              name: "Lockout / Key Unlock",
              isQuote: true,
              rating: 4.7,
              reviews: 134,
              duration: "Varies",
              includes: ["Doorstep visit", "Safe unlocking", "Lock inspection"],
              notIncluded: ["Key replacement", "Lock replacement", "Smart key programming"],
              importantNote: "Service availability depends on the truck model and lock system.",
              illustration: "key"
            },
            {
              id: "truck_engine_diag",
              name: "Engine Breakdown Diagnosis",
              isQuote: true,
              rating: 4.8,
              reviews: 312,
              duration: "Varies",
              includes: ["Basic engine inspection", "Fault diagnosis", "Error code scanning (where supported)", "Labour charges"],
              notIncluded: ["Spare parts", "Engine overhaul", "Internal engine repairs"],
              importantNote: "Repair work begins only after customer approval.",
              illustration: "engine"
            }
          ]
        },
        {
          id: "truck_maintenance",
          title: "🔧 Maintenance & Repair",
          services: [
            {
              id: "truck_periodic",
              name: "Periodic Service",
              isQuote: true,
              rating: 4.9,
              reviews: 421,
              duration: "Varies",
              includes: ["Complete vehicle inspection", "Fluid level inspection", "Brake inspection", "Tyre inspection", "Battery inspection", "Air filter inspection", "Labour charges"],
              notIncluded: ["Engine oil", "Filters", "Spare parts", "Major repairs"],
              importantNote: "Additional work requires customer approval before proceeding.",
              illustration: "wrench-clock"
            },
            {
              id: "truck_brake_repair",
              name: "Brake System Repair",
              isQuote: true,
              rating: 4.8,
              reviews: 267,
              duration: "Varies",
              includes: ["Brake inspection", "Brake adjustment", "Labour charges"],
              notIncluded: ["Brake pads", "Brake drums", "Brake discs", "Brake cylinders"],
              importantNote: "Replacement parts are billed separately after inspection.",
              illustration: "car-brake-alert"
            },
            {
              id: "truck_elec_repair",
              name: "Electrical System Repair",
              isQuote: true,
              rating: 4.7,
              reviews: 189,
              duration: "Varies",
              includes: ["Electrical diagnosis", "Wiring inspection", "Fuse inspection", "Labour charges"],
              notIncluded: ["Wiring harness replacement", "Alternator", "Starter motor", "ECU replacement"],
              importantNote: "Electrical faults are diagnosed before any repair work begins.",
              illustration: "lightning-bolt"
            },
            {
              id: "truck_suspension",
              name: "Suspension Repair",
              isQuote: true,
              rating: 4.6,
              reviews: 145,
              duration: "Varies",
              includes: ["Suspension inspection", "Labour charges"],
              notIncluded: ["Leaf springs", "Shock absorbers", "Bushes", "Suspension components"],
              importantNote: "Final cost depends on damaged components.",
              illustration: "car-traction-control"
            },
            {
              id: "truck_ac",
              name: "Cabin AC Repair",
              isQuote: true,
              rating: 4.8,
              reviews: 312,
              duration: "Varies",
              includes: ["AC inspection", "Cooling performance check", "Leak inspection", "Labour charges"],
              notIncluded: ["Compressor", "Condenser", "Cooling coil", "Refrigerant gas"],
              importantNote: "Replacement parts and refrigerant are charged separately.",
              illustration: "snowflake"
            }
          ]
        }
      ]
    }
  ]
};

const listeners = [];

export const onPricingUpdated = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(cb => cb());
};

let isSubscribed = false;

export const syncServicePricing = async () => {
  try {
    // 1. Load from cache first for immediate UI updates
    const cached = await AsyncStorage.getItem('service_pricing_cache');
    if (cached) {
      applyPricingUpdate(JSON.parse(cached));
      notifyListeners();
    }
    
    // 2. Fetch fresh from DB
    const { data, error } = await supabase.from('service_pricing').select('*');
    if (error) throw error;
    
    if (data && data.length > 0) {
      applyPricingUpdate(data);
      notifyListeners();
      await AsyncStorage.setItem('service_pricing_cache', JSON.stringify(data));
    }

    // 3. Subscribe to real-time changes
    if (!isSubscribed) {
      isSubscribed = true;
      supabase
        .channel('public:service_pricing')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_pricing' }, async () => {
          const { data: freshData } = await supabase.from('service_pricing').select('*');
          if (freshData && freshData.length > 0) {
            applyPricingUpdate(freshData);
            notifyListeners();
            await AsyncStorage.setItem('service_pricing_cache', JSON.stringify(freshData));
          }
        })
        .subscribe();
    }
  } catch (err) {
    console.log('Failed to sync service pricing', err);
  }
};

const applyPricingUpdate = (pricingData) => {
  const pricingMap = {};
  pricingData.forEach(p => {
    pricingMap[p.service_id] = p;
  });

  categoriesMarketplace.vehicles.forEach(vehicle => {
    vehicle.sections.forEach(section => {
      section.services.forEach(service => {
        const p = pricingMap[service.id];
        if (p) {
          service.price = p.base_price;
          service.isQuote = p.pricing_type === 'quote';
          service.isHidden = p.is_active === false; // Hide inactive services
          service.displayOrder = p.display_order || 0;
          
          if (p.estimated_duration_minutes) {
             const hrs = Math.floor(p.estimated_duration_minutes / 60);
             const mins = p.estimated_duration_minutes % 60;
             if (hrs > 0 && mins === 0) service.duration = `${hrs} hr${hrs > 1 ? 's' : ''}`;
             else if (hrs > 0) service.duration = `${hrs} hr ${mins} min`;
             else service.duration = `${mins} mins`;
          }
        } else if (service.displayOrder === undefined) {
          service.displayOrder = 999;
        }
      });

      // Sort services based on displayOrder
      section.services.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });
  });
};
