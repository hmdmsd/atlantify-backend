import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { sequelize } from '../config/database.config';
import { UserModel } from '../models/user.model';
import { SongModel } from '../models/song.model';
import { QueueModel } from '../models/queue.model';
import { SuggestionModel } from '../models/suggestion.model';
import { VoteModel } from '../models/vote.model';

async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables and recreate them

    // Create users
    const adminId = uuidv4();
    const userId1 = uuidv4();
    const userId2 = uuidv4();

    const hashedPassword = await hash('password', 10);

    await UserModel.bulkCreate([
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
    const song1Id = uuidv4();
    const song2Id = uuidv4();

    await SongModel.bulkCreate([
      {
        id: song1Id,
        title: 'starboy',
        artist: 'the weekend',
        duration: 354,
        path: 'songs/the-weekend-starboy.mp3',
        uploadedBy: adminId,
        size: 8400000,
      },
      {
        id: song2Id,
        title: 'a sky full of stars',
        artist: 'coldplay',
        duration: 391,
        path: 'songs/coldplay-a-sky-full-of-stars.mp3',
        uploadedBy: adminId,
        size: 7800000,
      },
    ]);

    // Create queue items
    await QueueModel.bulkCreate([
      {
        id: uuidv4(),
        songId: song1Id,
        addedBy: userId1,
        position: 1,
      },
      {
        id: uuidv4(),
        songId: song2Id,
        addedBy: userId2,
        position: 2,
      },
    ]);

    // Create suggestions
    const suggestion1Id = uuidv4();
    const suggestion2Id = uuidv4();
    const suggestion3Id = uuidv4();

    await SuggestionModel.bulkCreate([
      {
        id: suggestion1Id,
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        suggestedBy: userId1,
        voteCount: 5,
        status: 'pending',
      },
      {
        id: suggestion2Id,
        title: 'Sweet Home Alabama',
        artist: 'Lynyrd Skynyrd',
        suggestedBy: userId2,
        voteCount: 3,
        status: 'approved',
      },
      {
        id: suggestion3Id,
        title: 'November Rain',
        artist: 'Guns N Roses',
        suggestedBy: userId2,
        voteCount: 1,
        status: 'rejected',
      },
    ]);

    // Create votes
    await VoteModel.bulkCreate([
      {
        suggestionId: suggestion1Id,
        userId: userId1,
      },
      {
        suggestionId: suggestion1Id,
        userId: userId2,
      },
      {
        suggestionId: suggestion2Id,
        userId: userId1,
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
