/**
 * Database seeder — creates initial admin user, demo services, settings, and demo content.
 * Run: node seeder.js
 * Run: node seeder.js --destroy  (to clear all data)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Service = require('./models/Service');
const Doctor = require('./models/Doctor');
const Testimonial = require('./models/Testimonial');
const ClinicSettings = require('./models/ClinicSettings');
const WebsiteContent = require('./models/WebsiteContent');

const seedData = async (options = {}) => {
  const { destroy = false } = options;

  if (destroy) {
    await Promise.all([
      User.deleteMany(),
      Service.deleteMany(),
      Doctor.deleteMany(),
      Testimonial.deleteMany(),
      ClinicSettings.deleteMany(),
      WebsiteContent.deleteMany(),
    ]);
    console.log('✅ All data cleared');
    return;
  }

  // Admin user
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@smilecraft.demo' });
  if (!existing) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 12);
    await User.create({
      name: 'SmileCraft Admin',
      email: process.env.ADMIN_EMAIL || 'admin@smilecraft.demo',
      passwordHash,
      role: 'superadmin',
    });
    console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL || 'admin@smilecraft.demo'}`);
  }

  // Clinic settings (singleton)
  const settingsExist = await ClinicSettings.findOne();
  if (!settingsExist) {
    await ClinicSettings.create({
      clinicName: 'SmileCraft Dental Clinic',
      tagline: 'Precision Dentistry, Compassionate Care',
      phone: '+1 (234) 567-8900',
      email: 'info@smilecraft.demo',
      address: '123 Smile Boulevard, Suite 400, Dental Care Plaza',
      city: 'Metropolis',
      state: 'NY',
      pincode: '10001',
      slotDurationMinutes: 30,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 1,
      workingHours: [
        { day: 'Monday', open: '09:00', close: '18:00', closed: false },
        { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
        { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
        { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
        { day: 'Friday', open: '09:00', close: '18:00', closed: false },
        { day: 'Saturday', open: '09:00', close: '14:00', closed: false },
        { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
      ],
    });
    console.log('✅ Clinic settings created');
  }

  // Demo services
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    const services = [
      {
        title: 'Teeth Cleaning & Whitening',
        slug: 'teeth-cleaning-whitening',
        category: 'General',
        shortDescription: 'Professional ultrasonic scaling and high-grade cosmetic whitening.',
        fullDescription: 'Our gentle dental cleaning removes persistent plaque and tartar while laser whitening brightens your natural shade by up to 8 tones in one session.',
        price: '$120 - $250',
        duration: '45 mins',
        displayOrder: 1,
        published: true,
        featured: true,
      },
      {
        title: 'Root Canal Treatment',
        slug: 'root-canal-treatment',
        category: 'Surgery',
        shortDescription: 'Modern, pain-free endodontic therapy designed to preserve your natural tooth.',
        fullDescription: 'State-of-the-art micro-endodontics with advanced anesthesia ensure a completely comfortable, pain-free procedure with fast recovery.',
        price: '$350 - $600',
        duration: '60 mins',
        displayOrder: 2,
        published: true,
        featured: true,
      },
      {
        title: 'Dental Implants',
        slug: 'dental-implants',
        category: 'Surgery',
        shortDescription: 'Permanent titanium tooth replacements matching your natural bite and aesthetics.',
        fullDescription: 'Precision 3D guided implant placement offering lifelong durability, natural sensation, and restoration of complete chewing function.',
        price: '$800 - $1,500',
        duration: '90 mins',
        displayOrder: 3,
        published: true,
        featured: true,
      },
      {
        title: 'Clear Aligners & Orthodontics',
        slug: 'clear-aligners-orthodontics',
        category: 'Orthodontics',
        shortDescription: 'Invisible teeth aligners and custom orthodontics for a perfectly aligned smile.',
        fullDescription: 'Discreet, removable clear aligners customized to your digital dental scan, offering gentle teeth alignment in as few as 6 months.',
        price: '$1,200 - $3,000',
        duration: '30 mins',
        displayOrder: 4,
        published: true,
        featured: true,
      },
      {
        title: 'Pediatric Dentistry',
        slug: 'pediatric-dentistry',
        category: 'Pediatric',
        shortDescription: 'Warm, fun, and fear-free dental visits for infants, children, and teens.',
        fullDescription: 'Child-centered preventive dental care, dental sealants, and cavity treatments in a friendly, gentle environment.',
        price: '$80 - $150',
        duration: '30 mins',
        displayOrder: 5,
        published: true,
        featured: false,
      },
      {
        title: 'Porcelain Veneers',
        slug: 'porcelain-veneers',
        category: 'Cosmetic',
        shortDescription: 'Ultra-thin, custom ceramic shells designed to perfect your smile line.',
        fullDescription: 'Handcrafted porcelain shells bonded to the front of teeth to fix chips, gaps, and severe discoloration for a red-carpet smile.',
        price: '$450 / tooth',
        duration: '60 mins',
        displayOrder: 6,
        published: true,
        featured: false,
      },
    ];
    await Service.insertMany(services);
    console.log('✅ Demo services created');
  }

  // Demo doctors
  const doctorCount = await Doctor.countDocuments();
  if (doctorCount === 0) {
    await Doctor.insertMany([
      {
        name: 'Elena Rostova',
        qualifications: 'DDS, Harvard School of Dental Medicine',
        specialization: 'Chief Dental Surgeon & Cosmetic Specialist',
        experience: 14,
        biography: 'With over 14 years of clinical excellence, Dr. Rostova specializes in smile makeovers, advanced veneers, and gentle patient care.',
        displayOrder: 1,
        active: true,
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'thursday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'friday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'saturday', startTime: '09:00', endTime: '14:00', available: true },
        ],
      },
      {
        name: 'Marcus Sterling',
        qualifications: 'BDS, MDS (Orthodontics & Dentofacial Orthopedics)',
        specialization: 'Orthodontics & Clear Aligners',
        experience: 10,
        biography: 'Dr. Sterling is a recognized clear aligner specialist having guided over 2,000 successful smile transformations.',
        displayOrder: 2,
        active: true,
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'thursday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'friday', startTime: '09:00', endTime: '18:00', available: true },
        ],
      },
      {
        name: 'Aria Chen',
        qualifications: 'DMD, MS Pediatric Dentistry',
        specialization: 'Pediatric & Preventive Care',
        experience: 8,
        biography: 'Dr. Chen specializes in pediatric dentistry, making dental appointments enjoyable, stress-free, and educational for young smiles.',
        displayOrder: 3,
        active: true,
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'friday', startTime: '09:00', endTime: '18:00', available: true },
          { day: 'saturday', startTime: '09:00', endTime: '14:00', available: true },
        ],
      },
    ]);
    console.log('✅ Demo doctors created');
  }

  // Demo testimonials
  const testCount = await Testimonial.countDocuments();
  if (testCount === 0) {
    await Testimonial.insertMany([
      {
        displayName: 'Sophia Martinez',
        treatment: 'Teeth Whitening & Veneers',
        content: 'The team at SmileCraft completely transformed my confidence. The procedure was gentle, painless, and the results exceeded my expectations!',
        rating: 5,
        approved: true,
        published: true,
        displayOrder: 1,
      },
      {
        displayName: 'David Reynolds',
        treatment: 'Dental Implants',
        content: 'From the initial 3D scan to the final crown placement, Dr. Rostova was attentive, knowledgeable, and exceptionally kind.',
        rating: 5,
        approved: true,
        published: true,
        displayOrder: 2,
      },
      {
        displayName: 'Emily Watson',
        treatment: 'Clear Aligners',
        content: 'Straightening my teeth took only 7 months with their clear aligners. Scheduling appointments was seamless and the clinic environment is world-class.',
        rating: 5,
        approved: true,
        published: true,
        displayOrder: 3,
      },
    ]);
    console.log('✅ Demo testimonials created');
  }

  // Website CMS content
  const contentCount = await WebsiteContent.countDocuments();
  if (contentCount === 0) {
    await WebsiteContent.insertMany([
      {
        key: 'home-hero',
        section: 'home',
        title: 'Precision Dentistry. Radiant Smiles.',
        subtitle: 'Experience modern, gentle dental care backed by advanced digital diagnostics and dedicated specialists.',
        ctaText: 'Book Appointment',
        ctaLink: '/book-appointment',
        published: true,
      },
      {
        key: 'why-choose-us',
        section: 'home',
        title: 'Why Choose SmileCraft?',
        items: [
          { title: 'Digital Dentistry', description: 'Zero-radiation 3D intraoral scans and computerized smile preview.' },
          { title: 'Gentle, Pain-Free', description: 'State-of-the-art painless anesthesia and relaxed spa-like environment.' },
          { title: 'Certified Specialists', description: 'Experienced board-certified dentists across all dental disciplines.' },
          { title: 'Transparent Pricing', description: 'Upfront fee breakdown with no hidden charges or surprise costs.' },
        ],
        published: true,
      },
      {
        key: 'about-overview',
        section: 'about',
        title: 'About SmileCraft Dental Clinic',
        body: 'At SmileCraft Dental Clinic, we believe every patient deserves a healthy, radiant smile created with comfort and clinical precision. Established with a vision to revolutionize modern dentistry, our clinic combines cutting-edge dental technology with an empathetic patient-first philosophy.',
        published: true,
      },
    ]);
    console.log('✅ Demo website content created');
  }
};

module.exports = { seedData };

// If executed directly
if (require.main === module) {
  const connectDB = require('./config/db');
  const destroy = process.argv.includes('--destroy');
  (async () => {
    await connectDB();
    await seedData({ destroy });
    console.log('🎉 Seeding finished.');
    process.exit(0);
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
