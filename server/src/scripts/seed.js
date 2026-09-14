import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    // Create test users
    console.log('Creating test users...');
    const users = await User.create([
      {
        name: 'Alice Johnson',
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'Password123',
        bio: 'Love chatting with friends!',
        isOnline: true,
      },
      {
        name: 'Bob Smith',
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: 'Password123',
        bio: 'Tech enthusiast and coffee lover ☕',
        isOnline: false,
      },
      {
        name: 'Charlie Davis',
        username: 'charlie',
        email: 'charlie@example.com',
        passwordHash: 'Password123',
        bio: 'Always up for a good conversation',
        isOnline: true,
      },
      {
        name: 'Diana Prince',
        username: 'diana',
        email: 'diana@example.com',
        passwordHash: 'Password123',
        bio: 'Designer and nature lover 🌿',
        isOnline: false,
      },
    ]);

    console.log(`Created ${users.length} users`);

    // Create conversations
    console.log('Creating conversations...');
    const conversation1 = await Conversation.create({
      participants: [users[0]._id, users[1]._id],
    });

    const conversation2 = await Conversation.create({
      participants: [users[0]._id, users[2]._id],
    });

    const conversation3 = await Conversation.create({
      participants: [users[1]._id, users[2]._id],
    });

    console.log('Created 3 conversations');

    // Create messages
    console.log('Creating messages...');
    const messages = [];

    // Conversation 1: Alice and Bob
    messages.push(
      await Message.create({
        conversationId: conversation1._id,
        senderId: users[0]._id,
        text: 'Hey Bob! How are you doing?',
        status: 'seen',
      })
    );

    messages.push(
      await Message.create({
        conversationId: conversation1._id,
        senderId: users[1]._id,
        text: "Hi Alice! I'm doing great, thanks for asking!",
        status: 'seen',
      })
    );

    messages.push(
      await Message.create({
        conversationId: conversation1._id,
        senderId: users[0]._id,
        text: 'Want to grab coffee later? ☕',
        status: 'delivered',
      })
    );

    // Conversation 2: Alice and Charlie
    messages.push(
      await Message.create({
        conversationId: conversation2._id,
        senderId: users[2]._id,
        text: 'Alice! Did you see the new project requirements?',
        status: 'seen',
      })
    );

    messages.push(
      await Message.create({
        conversationId: conversation2._id,
        senderId: users[0]._id,
        text: 'Yes! They look pretty interesting. Want to discuss them?',
        status: 'seen',
      })
    );

    messages.push(
      await Message.create({
        conversationId: conversation2._id,
        senderId: users[2]._id,
        text: "Definitely! Let's meet tomorrow morning.",
        status: 'seen',
      })
    );

    // Conversation 3: Bob and Charlie
    messages.push(
      await Message.create({
        conversationId: conversation3._id,
        senderId: users[1]._id,
        text: 'Charlie, have you finished the design mockups?',
        status: 'delivered',
      })
    );

    messages.push(
      await Message.create({
        conversationId: conversation3._id,
        senderId: users[2]._id,
        text: "Almost done! I'll send them over by end of day.",
        status: 'seen',
      })
    );

    console.log(`Created ${messages.length} messages`);

    // Update last messages in conversations
    conversation1.lastMessage = messages[2]._id;
    await conversation1.save();

    conversation2.lastMessage = messages[5]._id;
    await conversation2.save();

    conversation3.lastMessage = messages[7]._id;
    await conversation3.save();

    console.log('✅ Database seeded successfully!');
    console.log('\nTest Users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.username}) - ${user.email}`);
      console.log(`    Password: Password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
