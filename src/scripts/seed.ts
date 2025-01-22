import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { sequelize } from '../config/database.config';
import { UserModel } from '../models/user.model';
import { SongModel } from '../models/song.model';
import { QueueModel } from '../models/queue.model';
import { SuggestionModel } from '../models/suggestion.model';
import { VoteModel } from '../models/vote.model';
import { PlaylistModel } from '../models/playlist.model';
import { PlaylistSongModel } from '../models/playlist-song.model';
import { LikedSongModel } from '../models/liked-song.model';
import { SongStatsModel } from '../models/song-stats.model';

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

    // Song metadata
    const songsMetadata = [
      {
        title: 'A La Noss Elil',
        artist: 'Unknown',
        filename: 'a-l-a-noss-elil.mp3',
        duration: 320,
      },
      {
        title: 'If We Have Each Other',
        artist: 'Alec Benjamin',
        filename: 'alec-benjamin-if-we-have-each-other.mp3',
        duration: 187,
      },
      {
        title: 'Sigma Boy',
        artist: 'Betsy Sigma',
        filename: 'betsy-sigma-sigma-boy.mp3',
        duration: 195,
      },
      {
        title: 'Hope',
        artist: 'The Chainsmokers',
        filename: 'chainsmokers-hope.mp3',
        duration: 213,
      },
      {
        title: 'A Sky Full of Stars',
        artist: 'Coldplay',
        filename: 'coldplay-a-sky-full-of-stars.mp3',
        duration: 267,
      },
      {
        title: 'Sun',
        artist: 'Derik Fein',
        filename: 'derik-fein-sun.mp3',
        duration: 231,
      },
      {
        title: "I Wouldn't Mind",
        artist: 'He Is We',
        filename: 'he-is-we-i-wouldn-t-mind.mp3',
        duration: 240,
      },
      {
        title: 'Netfakarna Sghar',
        artist: 'Kaso',
        filename: 'kaso-netfakarna-sghar.mp3',
        duration: 285,
      },
      {
        title: 'Sada9tha',
        artist: 'Kaso',
        filename: 'kaso-sada9tha.mp3',
        duration: 256,
      },
      {
        title: "Don't Worry",
        artist: 'Madcon',
        filename: 'madcon-don-t-worry.mp3',
        duration: 199,
      },
      {
        title: 'Ya Lil',
        artist: 'Mortadha Ftiti',
        filename: 'mortadha-ftiti-ya-lil.mp3',
        duration: 274,
      },
      {
        title: 'Stacy',
        artist: 'Quinn XCII',
        filename: 'quinn-xcii-stacy.mp3',
        duration: 218,
      },
      {
        title: "It Ain't Me",
        artist: 'Selena Gomez',
        filename: 'selena-gomez-it-ain-t-me.mp3',
        duration: 220,
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd',
        filename: 'the-weekend-starboy.mp3',
        duration: 230,
      },
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        filename: 'the-weeknd-blinding-lights.mp3',
        duration: 203,
      },
      {
        title: 'Push 2 Start',
        artist: 'Tyla',
        filename: 'tyla-push-2-start.mp3',
        duration: 189,
      },
    ];

    // Create songs
    const songRecords = await Promise.all(
      songsMetadata.map(async (song) => {
        const songId = uuidv4();
        await SongModel.create({
          id: songId,
          title: song.title,
          artist: song.artist,
          duration: song.duration,
          path: `songs/${song.filename}`,
          uploadedBy: adminId,
          size: Math.floor(Math.random() * 5000000) + 3000000, // Random size between 3-8MB
        });
        return { id: songId, ...song };
      })
    );

    // Create song stats for each song
    await Promise.all(
      songRecords.map((song) =>
        SongStatsModel.create({
          id: uuidv4(),
          songId: song.id,
          playCount: Math.floor(Math.random() * 100),
          lastPlayedAt: new Date(),
        })
      )
    );

    // Create some liked songs
    await Promise.all(
      songRecords.slice(0, 5).map((song) =>
        LikedSongModel.create({
          id: uuidv4(),
          userId: userId1,
          songId: song.id,
        })
      )
    );

    // Create playlists
    const playlist1Id = uuidv4();
    const playlist2Id = uuidv4();

    await PlaylistModel.bulkCreate([
      {
        id: playlist1Id,
        name: 'My Favorites',
        description: 'Collection of my favorite songs',
        createdBy: userId1,
      },
      {
        id: playlist2Id,
        name: 'Chill Vibes',
        description: 'Perfect for relaxing',
        createdBy: userId2,
      },
    ]);

    // Add songs to playlists
    await Promise.all(
      songRecords.slice(0, 4).map((song, index) =>
        PlaylistSongModel.create({
          id: uuidv4(),
          playlistId: playlist1Id,
          songId: song.id,
          position: index + 1,
          addedBy: userId1,
        })
      )
    );

    // Create queue items (using the first two songs)
    await QueueModel.bulkCreate([
      {
        id: uuidv4(),
        songId: songRecords[0].id,
        addedBy: userId1,
        position: 1,
      },
      {
        id: uuidv4(),
        songId: songRecords[1].id,
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
