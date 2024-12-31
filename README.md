# Braindotfun
Decentralize Science + Meme
Smart contract for creating and managing research-based meme tokens on the Flow EVM testnet.

## Overview

Each research paper gets its own ERC20 token with:
- PDF and image storage via IPFS
- Customizable meme descriptions
- Configurable token price
- Direct token sales

## Deployed Contracts (Flow EVM Testnet)

- Factory Contract: `0xd18D1D3a8912c054BC0f2DCFb68B9795cC58DD6F`
- View on FlowScan: [Link](https://evm-testnet.flowscan.io/address/0xd18D1D3a8912c054BC0f2DCFb68B9795cC58DD6F)

## Features

- Create research-specific tokens
- Upload research papers with IPFS
- Add meme descriptions
- Manage token prices
- Toggle token sales
- Track research tokens by researcher

## Usage

### Create Research Token
```solidity
factory.createResearchToken(
    "Token Name",
    "SYMBOL",
    "ipfs_pdf_hash",
    "ipfs_image_hash",
    "Meme description",
    tokenPrice,
    initialSupply
)
```

### Buy Tokens
```solidity
token.buyTokens(amount, { value: price * amount })
```

### Update Token Price
```solidity
token.updateTokenPrice(newPrice)
```

## Development

### Install
```bash
npm install
```

### Test
```bash
npx hardhat test
```

### Deploy
```bash
npx hardhat run scripts/deploy.js --network flowTestnet
```

### Verify Contract
```bash
npx hardhat verify --network flowTestnet 0xd18D1D3a8912c054BC0f2DCFb68B9795cC58DD6F
```

## Contract Architecture

- `DesciMemeFactory`: Manages token creation and tracking
- `ResearchToken`: Individual ERC20 token for each research

## License

MIT
