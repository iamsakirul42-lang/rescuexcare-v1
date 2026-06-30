export const vehicleServicesData = {
  "vehicleCategories": [
    {
      "id": "bike",
      "label": "Bike",
      "pricingModel": "fixed",
      "services": [
        { "id": "bike_puncture", "name": "Puncture Repair", "description": "Doorstep, per tyre", "price": 569 },
        { "id": "bike_jumpstart", "name": "Battery Jump Start", "price": 279 },
        { "id": "bike_battery_replace", "name": "Battery Replacement", "description": "Labour/fitting only", "price": 229, "priceNote": "Battery unit billed separately at landed cost" },
        { "id": "bike_towing", "name": "Towing", "description": "In-city, approx 5-10km", "price": 649 },
        { "id": "bike_fuel", "name": "Emergency Fuel Delivery", "description": "Service fee only", "price": 189, "priceNote": "Fuel billed at pump price, capped around 2L" },
        { "id": "bike_lockout", "name": "Lockout / Key Unlock", "price": 279 },
        { "id": "bike_wash", "name": "Doorstep Bike Wash", "description": "Basic foam wash", "price": 279 },
        { "id": "bike_service", "name": "Periodic / General Service", "description": "Basic", "price": 749 },
        { "id": "bike_oil", "name": "Oil Change", "description": "Labour plus basic top-up", "price": 419 }
      ]
    },
    {
      "id": "car",
      "label": "Car",
      "pricingModel": "fixed",
      "services": [
        { "id": "car_puncture", "name": "Puncture Repair", "description": "Doorstep, per tyre", "price": 329 },
        { "id": "car_jumpstart", "name": "Battery Jump Start", "price": 469 },
        { "id": "car_battery_replace", "name": "Battery Replacement", "description": "Labour/fitting only", "price": 419 },
        { "id": "car_towing", "name": "Towing", "description": "Up to 10km, in-city", "price": 999, "priceNote": "Plus 15 rupees per km beyond 10km" },
        { "id": "car_fuel", "name": "Emergency Fuel Delivery", "description": "Service fee only", "price": 279 },
        { "id": "car_lockout", "name": "Lockout / Key Unlock", "price": 369 },
        { "id": "car_ac_gas", "name": "AC Gas Refill", "description": "Includes top-up and leak check", "price": 1899 },
        { "id": "car_wash", "name": "Doorstep Car Wash", "description": "Basic exterior and interior", "price": 469 },
        { "id": "car_service", "name": "Periodic Service", "description": "Basic", "price": 2249 },
        { "id": "car_oil", "name": "Oil Change / Top-up", "description": "Labour, basic oil included", "price": 649 }
      ]
    },
    {
      "id": "auto",
      "label": "Auto",
      "pricingModel": "expert",
      "expertCta": "Talk to Expert",
      "services": [
        { "id": "auto_puncture", "name": "Puncture Repair" },
        { "id": "auto_jumpstart", "name": "Battery Jump Start" },
        { "id": "auto_battery_replace", "name": "Battery Replacement", "description": "Labour only" },
        { "id": "auto_towing", "name": "Towing" },
        { "id": "auto_cng", "name": "CNG Refill Assistance", "description": "Tow-assisted, since CNG cannot be carried like petrol or diesel" },
        { "id": "auto_lockout", "name": "Lockout / Key Unlock" },
        { "id": "auto_wash", "name": "Doorstep Wash" },
        { "id": "auto_service", "name": "Periodic Service", "description": "Basic" }
      ]
    },
    {
      "id": "truck",
      "label": "Truck / Commercial",
      "pricingModel": "expert",
      "expertCta": "Talk to Expert",
      "services": [
        { "id": "truck_puncture", "name": "Tyre / Puncture Repair" },
        { "id": "truck_jumpstart", "name": "Battery Jump Start" },
        { "id": "truck_battery_replace", "name": "Battery Replacement" },
        { "id": "truck_towing", "name": "Towing", "description": "Flatbed, winch, or boom rig depending on vehicle" },
        { "id": "truck_fuel", "name": "Diesel / Fuel Delivery" },
        { "id": "truck_lockout", "name": "Lockout / Key Unlock" },
        { "id": "truck_engine", "name": "Engine Breakdown Diagnostic" },
        { "id": "truck_brakes", "name": "Brake System Repair" },
        { "id": "truck_electrical", "name": "Electrical Fault Repair" },
        { "id": "truck_ac", "name": "AC Repair", "description": "Cabin AC" },
        { "id": "truck_service", "name": "Periodic Service / Inspection" }
      ]
    }
  ]
};
