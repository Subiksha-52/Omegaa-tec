const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'HOME THEATRE' },
  { name: 'DISPLAY' },
  { name: 'SECURITY' },
  { name: 'ACCESS CONTROL' },
  { name: 'NETWORKING' },
  { name: 'GAMING' },
  { name: 'HOME AUTOMATION' }
];

const products = [
  {
    name: "5.1 Home Theatre System",
    category: "HOME THEATRE",
    stock: 10,
    price: 35000,
    description: "Premium 5.1 channel home theatre system with surround sound.",
    image: "/images/5.1-home-theatre.webp",
    images: ["/images/5.1-home-theatre.webp"],
    features: ["5.1 Channel", "Surround Sound", "Wireless"],
    specifications: { "brand": "Sony", "model": "HT-S20R" },
    rating: 4.5,
    sold: 5
  },
  {
    name: "Matrix Display",
    category: "DISPLAY",
    stock: 15,
    price: 25000,
    description: "High-resolution matrix display for professional use.",
    image: "/images/1760262304750-matrix.jpg",
    images: ["/images/1760262304750-matrix.jpg"],
    features: ["High Resolution", "Professional Grade"],
    specifications: { "brand": "Generic", "model": "Matrix Pro" },
    rating: 4.2,
    sold: 3
  },
  {
    name: "Bullet Camera",
    category: "SECURITY",
    stock: 20,
    price: 5000,
    description: "High-definition bullet camera for outdoor surveillance.",
    image: "/images/bullet.jpg",
    images: ["/images/bullet.jpg"],
    features: ["HD Resolution", "Weatherproof", "Night Vision"],
    specifications: { "brand": "Generic", "model": "Bullet HD" },
    rating: 4.0,
    sold: 10
  },
  {
    name: "Dome Camera",
    category: "SECURITY",
    stock: 18,
    price: 6000,
    description: "Dome camera for indoor security monitoring.",
    image: "/images/dome-camera.jpg",
    images: ["/images/dome-camera.jpg"],
    features: ["360° View", "Motion Detection", "Wireless"],
    specifications: { "brand": "Generic", "model": "Dome Pro" },
    rating: 4.3,
    sold: 8
  },
  {
    name: "Intruder Alarm",
    category: "SECURITY",
    stock: 12,
    price: 8000,
    description: "Advanced intruder alarm system with sensors.",
    image: "/images/intruder-alarm.jpg",
    images: ["/images/intruder-alarm.jpg"],
    features: ["Motion Sensors", "Siren", "Remote Alert"],
    specifications: { "brand": "Generic", "model": "Alarm Pro" },
    rating: 4.1,
    sold: 6
  },
  {
    name: "Fingerprint Reader",
    category: "ACCESS CONTROL",
    stock: 25,
    price: 12000,
    description: "Biometric fingerprint reader for secure access.",
    image: "/images/fingerprint-reader.webp",
    images: ["/images/fingerprint-reader.webp"],
    features: ["Biometric", "Fast Recognition", "Touchless"],
    specifications: { "brand": "Generic", "model": "FP Reader" },
    rating: 4.4,
    sold: 12
  },
  {
    name: "RFID Reader",
    category: "ACCESS CONTROL",
    stock: 30,
    price: 7000,
    description: "RFID card reader for access control systems.",
    image: "/images/rfid-reader.webp",
    images: ["/images/rfid-reader.webp"],
    features: ["RFID Compatible", "Fast Read", "Durable"],
    specifications: { "brand": "Generic", "model": "RFID Pro" },
    rating: 4.2,
    sold: 15
  },
  {
    name: "Smoke Detector",
    category: "SECURITY",
    stock: 40,
    price: 1500,
    description: "Smoke detector with alarm for fire safety.",
    image: "/images/smoke-detector.jpg",
    images: ["/images/smoke-detector.jpg"],
    features: ["Early Detection", "Battery Backup", "Loud Alarm"],
    specifications: { "brand": "Generic", "model": "Smoke Guard" },
    rating: 4.0,
    sold: 20
  },
  {
    name: "Video Doorbell",
    category: "SECURITY",
    stock: 15,
    price: 10000,
    description: "Smart video doorbell with camera and intercom.",
    image: "/images/video-doorbell.jpg",
    images: ["/images/video-doorbell.jpg"],
    features: ["HD Video", "Two-Way Audio", "Motion Alert"],
    specifications: { "brand": "Generic", "model": "DoorBell Pro" },
    rating: 4.5,
    sold: 9
  },
  {
    name: "Biometric Clock",
    category: "ACCESS CONTROL",
    stock: 10,
    price: 15000,
    description: "Biometric time clock for attendance tracking.",
    image: "/images/biometric-clock.jpg",
    images: ["/images/biometric-clock.jpg"],
    features: ["Fingerprint", "Time Tracking", "Data Export"],
    specifications: { "brand": "Generic", "model": "Bio Clock" },
    rating: 4.3,
    sold: 5
  },
  {
    name: "Intercom System",
    category: "HOME AUTOMATION",
    stock: 8,
    price: 20000,
    description: "Advanced intercom system for home communication.",
    image: "/images/intercom.jpg",
    images: ["/images/intercom.jpg"],
    features: ["Video Call", "Door Unlock", "Integration"],
    specifications: { "brand": "Generic", "model": "Intercom Pro" },
    rating: 4.4,
    sold: 4
  },
  {
    name: "Heat Detector",
    category: "SECURITY",
    stock: 22,
    price: 2000,
    description: "Heat detector for fire prevention.",
    image: "/images/heat-detector.png",
    images: ["/images/heat-detector.png"],
    features: ["Heat Sensing", "Reliable", "Easy Install"],
    specifications: { "brand": "Generic", "model": "Heat Sense" },
    rating: 4.1,
    sold: 11
  },
  {
    name: "Card Access System",
    category: "ACCESS CONTROL",
    stock: 35,
    price: 9000,
    description: "Card access system for secure entry.",
    image: "/images/card-access.webp",
    images: ["/images/card-access.webp"],
    features: ["Card Reader", "Access Logs", "Multi-User"],
    specifications: { "brand": "Generic", "model": "Card Access" },
    rating: 4.2,
    sold: 18
  },
  {
    name: "CCTV Cable Roll",
    category: "NETWORKING",
    stock: 50,
    price: 1000,
    description: "High-quality CCTV cable for surveillance systems.",
    image: "/images/cctv-cable-roll.jpg",
    images: ["/images/cctv-cable-roll.jpg"],
    features: ["Durable", "High Conductivity", "Flexible"],
    specifications: { "brand": "Generic", "model": "CCTV Cable" },
    rating: 4.0,
    sold: 25
  },
  {
    name: "Combo Detector",
    category: "SECURITY",
    stock: 28,
    price: 3000,
    description: "Combo smoke and heat detector.",
    image: "/images/combo-detector.jpg",
    images: ["/images/combo-detector.jpg"],
    features: ["Dual Detection", "Battery Operated", "Compact"],
    specifications: { "brand": "Generic", "model": "Combo Det" },
    rating: 4.3,
    sold: 14
  },
  {
    name: "HD Bullet Camera",
    category: "SECURITY",
    stock: 16,
    price: 8000,
    description: "High-definition bullet camera with advanced features.",
    image: "/images/hd-bullet-camera.webp",
    images: ["/images/hd-bullet-camera.webp"],
    features: ["4K Resolution", "IR Night Vision", "Weatherproof"],
    specifications: { "brand": "Generic", "model": "HD Bullet" },
    rating: 4.6,
    sold: 8
  },
  {
    name: "HDMI Cable",
    category: "NETWORKING",
    stock: 60,
    price: 500,
    description: "High-speed HDMI cable for video transmission.",
    image: "/images/hdmi-cable.jpg",
    images: ["/images/hdmi-cable.jpg"],
    features: ["4K Support", "Gold Plated", "Durable"],
    specifications: { "brand": "Generic", "model": "HDMI Pro" },
    rating: 4.1,
    sold: 30
  },
  {
    name: "IP Camera",
    category: "SECURITY",
    stock: 14,
    price: 12000,
    description: "IP camera for network-based surveillance.",
    image: "/images/ip-camera.jpg",
    images: ["/images/ip-camera.jpg"],
    features: ["IP Network", "Remote Access", "High Resolution"],
    specifications: { "brand": "Generic", "model": "IP Cam" },
    rating: 4.4,
    sold: 7
  },
  {
    name: "Motion Sensor",
    category: "HOME AUTOMATION",
    stock: 32,
    price: 2500,
    description: "Motion sensor for automated lighting and security.",
    image: "/images/motion-sensor.webp",
    images: ["/images/motion-sensor.webp"],
    features: ["Motion Detection", "Energy Saving", "Wireless"],
    specifications: { "brand": "Generic", "model": "Motion Sense" },
    rating: 4.2,
    sold: 16
  },
  {
    name: "Power Adapter",
    category: "NETWORKING",
    stock: 45,
    price: 800,
    description: "Universal power adapter for electronic devices.",
    image: "/images/power-adapter.webp",
    images: ["/images/power-adapter.webp"],
    features: ["Universal", "Multiple Outputs", "Safe"],
    specifications: { "brand": "Generic", "model": "Power Adapt" },
    rating: 4.0,
    sold: 22
  },
  {
    name: "RFID Lock",
    category: "ACCESS CONTROL",
    stock: 12,
    price: 18000,
    description: "RFID-based smart door lock.",
    image: "/images/rfid-lock.jpg",
    images: ["/images/rfid-lock.jpg"],
    features: ["RFID Unlock", "Keyless", "Secure"],
    specifications: { "brand": "Generic", "model": "RFID Lock" },
    rating: 4.5,
    sold: 6
  },
  {
    name: "RFID Time Logger",
    category: "ACCESS CONTROL",
    stock: 20,
    price: 14000,
    description: "RFID time logger for attendance management.",
    image: "/images/rfid-time-logger.jpg",
    images: ["/images/rfid-time-logger.jpg"],
    features: ["RFID Tracking", "Time Logs", "Reports"],
    specifications: { "brand": "Generic", "model": "Time Logger" },
    rating: 4.3,
    sold: 10
  },
  {
    name: "Smart Door Lock",
    category: "HOME AUTOMATION",
    stock: 10,
    price: 25000,
    description: "Smart door lock with app control.",
    image: "/images/smart-door-lock.webp",
    images: ["/images/smart-door-lock.webp"],
    features: ["App Control", "Biometric", "Remote Access"],
    specifications: { "brand": "Generic", "model": "Smart Lock" },
    rating: 4.7,
    sold: 5
  },
  {
    name: "Soundbar",
    category: "HOME THEATRE",
    stock: 25,
    price: 15000,
    description: "Wireless soundbar for enhanced audio.",
    image: "/images/soundbar.jpg",
    images: ["/images/soundbar.jpg"],
    features: ["Wireless", "Surround Sound", "Bluetooth"],
    specifications: { "brand": "Generic", "model": "Sound Bar" },
    rating: 4.4,
    sold: 12
  },
  {
    name: "Wall Mount",
    category: "NETWORKING",
    stock: 40,
    price: 600,
    description: "Wall mount for cameras and displays.",
    image: "/images/wall-mount.jpg",
    images: ["/images/wall-mount.jpg"],
    features: ["Adjustable", "Sturdy", "Easy Install"],
    specifications: { "brand": "Generic", "model": "Wall Mount" },
    rating: 4.1,
    sold: 20
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert categories
    await Category.insertMany(categories);
    console.log('✅ Categories inserted');

    // Insert products
    await Product.insertMany(products);
    console.log('✅ Products inserted');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
