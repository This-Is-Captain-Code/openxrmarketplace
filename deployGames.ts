import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Import ABI and config
const abiPath = path.join(__dirname, 'client/src/lib/gameABI.json');
const gameABI = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

const RONIN_SAIGON_RPC = 'https://saigon-testnet.roninchain.com/rpc';
const CONTRACT_ADDRESS = '0xe29Eb65EE3Dda606E9f2e0aD6D2D4f73AEF83846';

// Items to create (12 lenses + 1 game)
const itemsToCreate = [
  { id: 1, name: 'Cosmic Vibes', description: 'Neon holographic digital art lens', price: '0.1' },
  { id: 2, name: 'Rainbow Blast', description: 'Neon holographic digital art lens', price: '0.12' },
  { id: 3, name: 'Pixel Paradise', description: 'Neon holographic digital art lens', price: '0.13' },
  { id: 4, name: 'Electric Dreams', description: 'Neon holographic digital art lens', price: '0.15' },
  { id: 5, name: 'Prism Party', description: 'Abstract colorful neon lens', price: '0.14' },
  { id: 6, name: 'Neon Nights', description: 'Abstract colorful neon lens', price: '0.16' },
  { id: 7, name: 'Retro Wave', description: 'Abstract colorful neon lens', price: '0.18' },
  { id: 8, name: 'Glitch Mode', description: 'Abstract colorful neon lens', price: '0.2' },
  { id: 9, name: 'Crystal Burst', description: 'Abstract colorful neon lens', price: '0.22' },
  { id: 10, name: 'Vapor Dreams', description: 'Abstract colorful neon lens', price: '0.25' },
  { id: 11, name: 'Cyber Glow', description: 'Abstract colorful neon lens', price: '0.28' },
  { id: 12, name: 'Laser Lights', description: 'Abstract colorful neon lens', price: '0.3' },
  { id: 13, name: 'UEEAAUUEEAA', description: 'Immersive AR gaming experience', price: '0.25' },
];

async function deployGames(privateKey: string) {
  try {
    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(RONIN_SAIGON_RPC);
    const signer = new ethers.Wallet(privateKey, provider);
    
    console.log('📝 Deployer address:', signer.address);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    const balanceRON = ethers.formatEther(balance);
    console.log('💰 Wallet balance:', balanceRON, 'RON');
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, gameABI, signer);
    
    console.log('\n🚀 Creating', itemsToCreate.length, 'items on contract...\n');
    
    for (const item of itemsToCreate) {
      try {
        const priceWei = ethers.parseEther(item.price);
        console.log(`Creating item ${item.id}: "${item.name}" (${item.price} RON)...`);
        
        const tx = await contract.listGame(
          item.name,
          item.description,
          priceWei
        );
        
        console.log(`  ✓ Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait(1);
        if (receipt && receipt.status === 1) {
          console.log(`  ✅ Confirmed! Item ${item.id} created successfully\n`);
        } else {
          console.log(`  ❌ Transaction failed for item ${item.id}\n`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error creating item ${item.id}:`, error.message, '\n');
      }
    }
    
    console.log('✨ Deployment complete!');
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Get private key from command line argument
const privateKey = process.argv[2];
if (!privateKey) {
  console.error('Error: Private key required as command line argument');
  console.error('Usage: npx tsx deployGames.ts <PRIVATE_KEY>');
  process.exit(1);
}

deployGames(privateKey);
