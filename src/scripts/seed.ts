import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { sequelize } from '../config/database.config';
import { UserModel } from '../models/user.model';
import { SongModel } from '../models/song.model';
import { QueueModel } from '../models/queue.model';
import { SuggestionModel } from '../models/suggestion.model';

async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables

    // Create users
    const adminId = uuidv4();
    const userId1 = uuidv4();
    const userId2 = uuidv4();

    const hashedPassword = await hash('password123', 10);

    const users = await UserModel.bulkCreate([
      {
        id: adminId,
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      },
      {
        id: userId1,
        username: 'amine',
        email: 'amine@gmail.com',
        password: hashedPassword,
        role: 'user',
      },
      {
        id: userId2,
        username: 'mesaoud',
        email: 'mesaoud@gmail.com',
        password: hashedPassword,
        role: 'user',
      },
    ]);

    // Create songs
    const songs = await SongModel.bulkCreate([
      {
        id: uuidv4(),
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        duration: 354,
        path: '/music/bohemian-rhapsody.mp3',
        uploadedBy: adminId,
        size: 8400000,
      },
      {
        id: uuidv4(),
        title: 'Hotel California',
        artist: 'Eagles',
        duration: 391,
        path: '/music/hotel-california.mp3',
        uploadedBy: adminId,
        size: 7800000,
      },
      {
        id: uuidv4(),
        title: 'Sweet Child O Mine',
        artist: 'Guns N Roses',
        duration: 356,
        path: '/music/sweet-child-o-mine.mp3',
        uploadedBy: userId1,
        size: 8100000,
      },
    ]);

    // Create queue items
    await QueueModel.bulkCreate([
      {
        id: uuidv4(),
        songId: songs[0].id,
        addedBy: userId1,
        position: 1,
      },
      {
        id: uuidv4(),
        songId: songs[1].id,
        addedBy: userId2,
        position: 2,
      },
    ]);

    // Create suggestions
    await SuggestionModel.bulkCreate([
      {
        id: uuidv4(),
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        suggestedBy: userId1,
        votes: 5,
        status: 'pending',
      },
      {
        id: uuidv4(),
        title: 'Sweet Home Alabama',
        artist: 'Lynyrd Skynyrd',
        suggestedBy: userId2,
        votes: 3,
        status: 'approved',
      },
      {
        id: uuidv4(),
        title: 'November Rain',
        artist: 'Guns N Roses',
        suggestedBy: userId2,
        votes: 1,
        status: 'rejected',
      },
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
