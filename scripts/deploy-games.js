/**
 * Deploy AR Lens Games Script
 * 
 * This script lists games 2-12 on the GameLicensing contract.
 * Game 1 is already deployed, so we start from game 2.
 * 
 * Requirements:
 * - Contract owner wallet with private key
 * - XRT tokens for gas fees (estimated ~0.05 XRT total for 11 transactions)
 * - Node.js with ethers installed
 * 
 * Usage:
 * PRIVATE_KEY=your_owner_wallet_private_key node scripts/deploy-games.js
 */

const ethers = require('ethers');
const gameABI = require('../client/src/lib/gameABI.json');

const CONTRACT_ADDRESS = '0x91C7B6f8905060D6aE711878020DB15E90C697E0';
const RPC_URL = 'https://openxr-2763783314764000-1.jsonrpc.sagarpc.io';
const CHAIN_ID = 2763783314764000;
const GAME_PRICE = '2324'; // 2324 XRT per license

// AR Lens game data (games 2-12, game 1 already exists)
const games = [
  { id: 2, name: 'AR Lens 02 - Rainbow Blast', description: 'Vibrant rainbow AR effects' },
  { id: 3, name: 'AR Lens 03 - Pixel Paradise', description: 'Retro pixel art filters' },
  { id: 4, name: 'AR Lens 04 - Electric Dreams', description: 'Neon electric visuals' },
  { id: 5, name: 'AR Lens 05 - Prism Party', description: 'Prismatic light effects' },
  { id: 6, name: 'AR Lens 06 - Neon Nights', description: 'Dark neon aesthetics' },
  { id: 7, name: 'AR Lens 07 - Retro Wave', description: 'Synthwave retrowave vibes' },
  { id: 8, name: 'AR Lens 08 - Glitch Mode', description: 'Digital glitch effects' },
  { id: 9, name: 'AR Lens 09 - Crystal Burst', description: 'Crystalline visual effects' },
  { id: 10, name: 'AR Lens 10 - Vapor Dreams', description: 'Vaporwave aesthetic' },
  { id: 11, name: 'AR Lens 11 - Cyber Glow', description: 'Cyberpunk glow effects' },
  { id: 12, name: 'AR Lens 12 - Laser Lights', description: 'Laser light show effects' }
];

async function deployGames() {
  console.log('=== AR Lens Games Deployment ===\n');
  
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY environment variable not set');
    console.error('Usage: PRIVATE_KEY=your_key node scripts/deploy-games.js');
    process.exit(1);
  }

  try {
    // Connect to Saga chainlet
    console.log('📡 Connecting to Saga chainlet...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, gameABI, wallet);
    
    console.log('✓ Connected');
    console.log('  Wallet:', wallet.address);
    console.log('  Chain ID:', CHAIN_ID);
    console.log('  Contract:', CONTRACT_ADDRESS);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceXRT = ethers.formatEther(balance);
    console.log(`  Balance: ${balanceXRT} XRT\n`);
    
    if (parseFloat(balanceXRT) < 0.1) {
      console.error('⚠️  Warning: Low balance. You may need at least ~0.05 XRT for gas fees');
    }

    // Check if game 1 exists (it should)
    try {
      const game1 = await contract.getGame(1);
      console.log('✓ Game 1 exists:', game1.name);
    } catch (err) {
      console.error('❌ Game 1 does not exist on contract. Please deploy game 1 first.');
      process.exit(1);
    }

    console.log('\n📝 Listing games 2-12...\n');

    const priceInWei = ethers.parseEther(GAME_PRICE);
    const deployedGames = [];
    
    for (const game of games) {
      try {
        // Check if game already exists
        try {
          const existingGame = await contract.getGame(game.id);
          if (existingGame.isActive) {
            console.log(`⏭️  Game ${game.id} already exists, skipping`);
            deployedGames.push(game.id);
            continue;
          }
        } catch (err) {
          // Game doesn't exist, proceed with listing
        }

        console.log(`  Listing game ${game.id}: ${game.name}...`);
        
        const tx = await contract.listGame(
          game.name,
          game.description,
          priceInWei
        );
        
        console.log(`  Transaction sent: ${tx.hash}`);
        console.log(`  Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log(`  ✓ Game ${game.id} deployed successfully!\n`);
          deployedGames.push(game.id);
        } else {
          console.log(`  ❌ Game ${game.id} deployment failed\n`);
        }
        
        // Wait 2 seconds between transactions to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error(`  ❌ Error deploying game ${game.id}:`, err.message);
        console.error(`     Continuing with next game...\n`);
      }
    }

    console.log('\n=== Deployment Complete ===');
    console.log(`✓ Successfully deployed ${deployedGames.length} games`);
    console.log('Deployed game IDs:', deployedGames.join(', '));
    
    // Verify all games
    console.log('\n📋 Verifying all games...\n');
    for (let i = 1; i <= 12; i++) {
      try {
        const game = await contract.getGame(i);
        const priceXRT = ethers.formatEther(game.price);
        console.log(`Game ${i}: ${game.name} - ${priceXRT} XRT - Active: ${game.isActive}`);
      } catch (err) {
        console.log(`Game ${i}: NOT DEPLOYED ❌`);
      }
    }
    
  } catch (err) {
    console.error('\n❌ Deployment failed');
    if (err instanceof Error) {
      console.error('Error:', err.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

deployGames();
