# AR Lens Games Deployment Instructions

## Overview
You need to deploy games 2-12 on the GameLicensing smart contract so each AR lens can be purchased separately.

**Current Status:**
- ✅ Game 1 is already deployed (you purchased this one)
- ❌ Games 2-12 need to be deployed

## Prerequisites

1. **Contract Owner Wallet**
   - You need the private key for the wallet that owns the GameLicensing contract
   - This wallet must have XRT tokens for gas fees (estimated ~0.05 XRT total)

2. **Network Details**
   - Chain: Saga Chainlet (OpenXR)
   - Chain ID: 2763783314764000
   - RPC: https://openxr-2763783314764000-1.jsonrpc.sagarpc.io
   - Contract: 0x91C7B6f8905060D6aE711878020DB15E90C697E0

## Deployment Steps

### Option 1: Using the Provided Script (Recommended)

1. **Install Dependencies** (if not already installed)
   ```bash
   npm install ethers
   ```

2. **Set Your Private Key**
   ```bash
   export PRIVATE_KEY="your_contract_owner_private_key_here"
   ```

3. **Run the Deployment Script**
   ```bash
   node scripts/deploy-games.js
   ```

4. **Expected Output**
   ```
   === AR Lens Games Deployment ===
   
   📡 Connecting to Saga chainlet...
   ✓ Connected
     Wallet: 0x...
     Chain ID: 2763783314764000
     Contract: 0x91C7B6f8905060D6aE711878020DB15E90C697E0
     Balance: 10000.0 XRT
   
   ✓ Game 1 exists: AR Lens 01 - Cosmic Vibes
   
   📝 Listing games 2-12...
   
     Listing game 2: AR Lens 02 - Rainbow Blast...
     Transaction sent: 0x...
     Waiting for confirmation...
     ✓ Game 2 deployed successfully!
   
   ... (continues for games 3-12)
   
   === Deployment Complete ===
   ✓ Successfully deployed 11 games
   Deployed game IDs: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
   ```

### Option 2: Manual Deployment via Etherscan/Block Explorer

1. **Go to Contract on Block Explorer**
   - Visit: https://openxr-2763783314764000-1.sagaexplorer.io/address/0x91C7B6f8905060D6aE711878020DB15E90C697E0
   - Click "Write Contract"
   - Connect your owner wallet

2. **Call `listGame` for Each Lens**
   - For each game (2-12), call:
   ```
   Function: listGame
   Parameters:
   - name: "AR Lens 02 - Rainbow Blast" (change number/name for each)
   - description: "Vibrant rainbow AR effects" (customize per lens)
   - price: 2324000000000000000000 (2324 XRT in wei - 18 decimals)
   ```

3. **Game Details for Manual Entry**
   ```
   Game 2:  AR Lens 02 - Rainbow Blast - Vibrant rainbow AR effects
   Game 3:  AR Lens 03 - Pixel Paradise - Retro pixel art filters
   Game 4:  AR Lens 04 - Electric Dreams - Neon electric visuals
   Game 5:  AR Lens 05 - Prism Party - Prismatic light effects
   Game 6:  AR Lens 06 - Neon Nights - Dark neon aesthetics
   Game 7:  AR Lens 07 - Retro Wave - Synthwave retrowave vibes
   Game 8:  AR Lens 08 - Glitch Mode - Digital glitch effects
   Game 9:  AR Lens 09 - Crystal Burst - Crystalline visual effects
   Game 10: AR Lens 10 - Vapor Dreams - Vaporwave aesthetic
   Game 11: AR Lens 11 - Cyber Glow - Cyberpunk glow effects
   Game 12: AR Lens 12 - Laser Lights - Laser light show effects
   ```

## Verification

After deployment, verify all games exist:

```bash
# Check a specific game
curl -X POST https://openxr-2763783314764000-1.jsonrpc.sagarpc.io \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{
      "to": "0x91C7B6f8905060D6aE711878020DB15E90C697E0",
      "data": "0x78a89567000000000000000000000000000000000000000000000000000000000000000X"
    }, "latest"],
    "id": 1
  }'
```
Replace the last `X` with game ID (1-12 in hex: 1=01, 2=02, etc.)

## Cost Estimate

- **Gas per transaction**: ~0.004-0.005 XRT
- **Total transactions**: 11 (games 2-12)
- **Total estimated cost**: ~0.05 XRT
- **Buffer recommended**: Have at least 0.1 XRT in owner wallet

## After Deployment

Once all games are deployed:
1. Refresh the o7.xr application
2. Each lens should now show "Purchase" if not owned
3. Each lens can be purchased individually for 2324 XRT
4. Total cost to unlock all 12 lenses: 27,888 XRT (12 × 2324)

## Troubleshooting

**Error: "Insufficient funds"**
- Add more XRT to your owner wallet for gas fees

**Error: "Game already exists"**
- Skip that game ID, it's already deployed
- The script automatically handles this

**Error: "Unauthorized" or "Only owner"**
- Make sure you're using the contract owner's private key
- Verify the owner address matches the contract owner

**Transaction stuck/pending**
- Wait a few minutes for confirmation
- Check block explorer for transaction status
- May need to increase gas price in congested network

## Need Help?

Check the Saga block explorer for your transactions:
https://openxr-2763783314764000-1.sagaexplorer.io/address/0x91C7B6f8905060D6aE711878020DB15E90C697E0
