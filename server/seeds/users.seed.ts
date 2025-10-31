import { supabase } from '../config/database';
import { hashPassword } from '../utils/auth';

/**
 * Seed 50 test users with realistic trading/crypto profiles
 */

const firstNames = [
  'Alexander', 'Maria', 'Dmitry', 'Elena', 'Sergey', 'Olga', 'Ivan', 'Anna',
  'Mikhail', 'Tatiana', 'Vladimir', 'Natalia', 'Andrey', 'Irina', 'Alexey',
  'Svetlana', 'Nikolay', 'Ekaterina', 'Pavel', 'Victoria', 'Roman', 'Julia',
  'Igor', 'Anastasia', 'Yuri', 'Oksana', 'Maxim', 'Marina', 'Anton', 'Daria',
  'Konstantin', 'Valeria', 'Evgeny', 'Vera', 'Artem', 'Lyudmila', 'Denis',
  'Larisa', 'Stanislav', 'Galina', 'Vyacheslav', 'Nadezhda', 'Oleg', 'Inna',
  'Ruslan', 'Tamara', 'Kirill', 'Raisa', 'Vadim', 'Zinaida'
];

const lastNames = [
  'Ivanov', 'Petrov', 'Sidorov', 'Volkov', 'Sokolov', 'Lebedev', 'Kozlov',
  'Novikov', 'Morozov', 'Popov', 'Vasiliev', 'Soloviev', 'Mikhailov', 'Fedorov',
  'Semenov', 'Egorov', 'Pavlov', 'Kuznetsov', 'Andreev', 'Alexeev', 'Orlov',
  'Konstantinov', 'Dmitriev', 'Stepanov', 'Grigoriev', 'Romanov', 'Vladimirov',
  'Nikolaev', 'Sergeev', 'Antonov', 'Maximov', 'Denisov', 'Artemov', 'Yuryev',
  'Igorev', 'Kirillovich', 'Stanislavov', 'Konstantinovich', 'Evgeniev',
  'Pavlovich', 'Mikhailovich', 'Alexandrovich', 'Dmitrievich', 'Andreevich',
  'Vladimirovich', 'Nikolaevich', 'Sergeevich', 'Petrovich', 'Ivanovnich', 'Fedorovich'
];

const tradingStyles = [
  'Day Trader', 'Swing Trader', 'Scalper', 'Position Trader', 'Algorithmic Trader',
  'Quant Analyst', 'Technical Analyst', 'Fundamental Analyst', 'Options Trader',
  'Forex Trader', 'Crypto Trader', 'NFT Trader', 'DeFi Specialist', 'Market Maker'
];

const specializations = [
  'Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs', 'Derivatives', 'Spot Trading',
  'Futures', 'Options', 'Technical Analysis', 'On-chain Analysis', 'Market Making',
  'Arbitrage', 'MEV', 'Liquidity Mining', 'Yield Farming'
];

const bios = [
  'Professional crypto trader with 5+ years of experience. Sharing signals and market insights.',
  'Quantitative analyst focused on algorithmic trading strategies. Math + Markets = Profits.',
  'Full-time trader documenting my journey. Transparency is key. Risk management first.',
  'On-chain data analyst. Following the smart money. Blockchain never lies.',
  'Day trader specializing in high-volatility altcoins. Fast execution, quick profits.',
  'Long-term investor with a focus on fundamentals. Building generational wealth.',
  'Options trader exploring various strategies. Greeks are my friends.',
  'DeFi enthusiast sharing yield farming opportunities. APY hunter.',
  'Technical analysis expert. Charts tell the story. Price action is king.',
  'Market maker providing liquidity across multiple DEXs. Orderbook wizard.',
  'Swing trader capturing multi-day moves. Patience pays off.',
  'Scalper focusing on 1-5 minute timeframes. Speed is everything.',
  'Position trader holding for weeks/months. Big picture perspective.',
  'Algorithmic trader building automated systems. Code > Emotions.',
  'News trader capitalizing on market events. Speed and accuracy matter.',
  'Contrarian investor going against the crowd. When others fear, I buy.',
  'Momentum trader riding the trends. The trend is your friend.',
  'Mean reversion specialist. Everything returns to the mean eventually.',
  'Breakout trader catching explosive moves. Volume confirms direction.',
  'Range trader profiting from sideways markets. Patience in consolidation.',
  'Arbitrage hunter finding price discrepancies. Free money exists.',
  'ICO/IDO analyst evaluating new projects. Early bird gets the worm.',
  'NFT trader flipping digital collectibles. Art meets finance.',
  'Staking rewards optimizer. Passive income maximalist.',
  'Liquidity provider earning fees. DeFi building blocks.',
  'MEV researcher extracting blockchain value. Front-running legally.',
  'Risk management consultant. Protecting your capital is #1.',
  'Portfolio manager diversifying across assets. Don\'t put eggs in one basket.',
  'Macro analyst connecting global events to markets. Big picture thinking.',
  'Sentiment analyzer gauging market psychology. Fear and greed drive prices.'
];

const avatars = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
  'https://i.pravatar.cc/150?img=9',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=13',
  'https://i.pravatar.cc/150?img=14',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=16',
  'https://i.pravatar.cc/150?img=17',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=19',
  'https://i.pravatar.cc/150?img=20',
  'https://i.pravatar.cc/150?img=21',
  'https://i.pravatar.cc/150?img=22',
  'https://i.pravatar.cc/150?img=23',
  'https://i.pravatar.cc/150?img=24',
  'https://i.pravatar.cc/150?img=25',
  'https://i.pravatar.cc/150?img=26',
  'https://i.pravatar.cc/150?img=27',
  'https://i.pravatar.cc/150?img=28',
  'https://i.pravatar.cc/150?img=29',
  'https://i.pravatar.cc/150?img=30',
  'https://i.pravatar.cc/150?img=31',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=34',
  'https://i.pravatar.cc/150?img=35',
  'https://i.pravatar.cc/150?img=36',
  'https://i.pravatar.cc/150?img=37',
  'https://i.pravatar.cc/150?img=38',
  'https://i.pravatar.cc/150?img=39',
  'https://i.pravatar.cc/150?img=40',
  'https://i.pravatar.cc/150?img=41',
  'https://i.pravatar.cc/150?img=42',
  'https://i.pravatar.cc/150?img=43',
  'https://i.pravatar.cc/150?img=44',
  'https://i.pravatar.cc/150?img=45',
  'https://i.pravatar.cc/150?img=46',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=48',
  'https://i.pravatar.cc/150?img=49',
  'https://i.pravatar.cc/150?img=50'
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername(firstName: string, lastName: string, index: number): string {
  const styles = [
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 999)}`,
    `${firstName.toLowerCase()}_trader`,
    `crypto_${firstName.toLowerCase()}`,
    `${lastName.toLowerCase()}_trading`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}`,
    `trader_${firstName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${randomInt(100, 9999)}`
  ];
  
  return index < 2 ? ['tyrian_trade', 'crypto_analyst'][index] : randomElement(styles);
}

export async function seedUsers() {
  console.log('🌱 Starting user seeding...');

  const passwordHash = await hashPassword('Test123!@#'); // Default password for all test users

  const users = [];
  
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const username = generateUsername(firstName, lastName, i);
    const email = `${username}@tradingplatform.io`;
    
    const user = {
      email,
      phone: null,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      username,
      avatar_url: avatars[i],
      bio: randomElement(bios),
      trading_style: randomElement(tradingStyles),
      specialization: randomElement(specializations),
      email_verified: true,
      phone_verified: false,
      // Additional profile fields
      followers_count: randomInt(50, 50000),
      following_count: randomInt(20, 2000),
      posts_count: randomInt(10, 1000),
      accuracy_rate: randomInt(60, 95),
      win_rate: randomInt(55, 85),
      total_trades: randomInt(100, 10000),
      verified: i < 20, // First 20 users are verified
      premium: i < 10, // First 10 users have premium
      joined_date: new Date(Date.now() - randomInt(1, 730) * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 2 years
    };
    
    users.push(user);
  }

  try {
    // Insert users in batches
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('users')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} users)`);
      }
    }

    console.log('🎉 User seeding completed!');
    console.log(`📊 Total users created: ${users.length}`);
    console.log('\n📝 Test credentials:');
    console.log('Email: any_username@tradingplatform.io');
    console.log('Password: Test123!@#');
    console.log('\nExamples:');
    console.log('- tyrian_trade@tradingplatform.io');
    console.log('- crypto_analyst@tradingplatform.io');
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✨ Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
