# DataChain - Blockchain-Powered Dataset Ownership & Provenance Tracker

DataChain is a revolutionary platform that registers, verifies, and tracks datasets on-chain using Aptos smart contracts. Think of it as **"GitHub for datasets, but with blockchain-backed trust."**

## Core Idea

DataChain ensures that:
- **Every dataset has a verifiable origin** (creator)
- **Ownership transfers are transparent and immutable**
- **Any unauthorized use or modification can be detected cryptographically**

Unlike typical data repositories (like Kaggle or Hugging Face), DataChain makes datasets:
- **Tamper-proof**: each version is hashed and stored on-chain
- **Verifiable**: users can prove dataset authorship or authenticity  
- **Traceable**: every fork, modification, or sale leaves an on-chain trail

## Features

### **Modern Homepage**
- Stunning hero section with interactive RippleGrid background
- Feature showcase with icons and descriptions
- Use cases for different industries
- Tech stack overview
- Responsive design with smooth animations

### **Explore Datasets**
- Advanced search and filtering capabilities
- Grid and list view modes
- Trust score visualization
- Dataset statistics and metadata
- Tag-based filtering system

### **User Dashboard**
- Personal dataset management
- Upload statistics and analytics
- Activity timeline
- Trust score tracking
- Quick actions panel

### **Dataset Upload**
- Multi-step upload wizard
- Drag & drop file interface
- Comprehensive metadata forms
- License selection
- Blockchain registration preview

### **Dataset Details**
- Complete dataset information
- Version history with timeline
- Blockchain verification data
- Similar dataset recommendations
- Owner profile integration

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Aptos (Move smart contracts) |
| **Storage** | IPFS / Filecoin / Arweave |
| **Frontend** | Next.js 14 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Wallet** | Aptos Wallet Adapter |
| **Animations** | Custom WebGL shaders (RippleGrid) |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Aptos CLI (for smart contracts)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd datachain
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up blockchain (Required)**
```bash
# Automated setup (recommended)
npm run setup-blockchain

# OR manual setup - see BLOCKCHAIN_SETUP.md
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── dashboard/         # User dashboard
│   ├── datasets/[id]/     # Dataset detail pages
│   ├── explore/           # Dataset exploration
│   ├── upload/            # Dataset upload wizard
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── DatasetCard.tsx   # Dataset display card
│   ├── Header.tsx        # Navigation header
│   ├── Footer.tsx        # Site footer
│   └── RippleGrid.tsx    # WebGL background animation
├── lib/                  # Utility functions
└── utils/                # Helper functions

contract/                 # Move smart contracts
├── sources/             # Contract source files
└── tests/               # Contract tests
```

## Design System

### Color Palette
- **Primary**: Purple (#8741FF)
- **Background**: Dark gradient (Gray-900 to Black)
- **Cards**: Semi-transparent gray with glassmorphism
- **Text**: White primary, Gray-400 secondary
- **Accents**: Green (success), Red (error), Yellow (warning)

### Typography
- **Headings**: Bold, large sizes with gradient text effects
- **Body**: Clean, readable with proper contrast
- **Code**: Monospace font for hashes and addresses

### Components
- **Rounded corners**: Large radius (2xl, 3xl) for modern look
- **Glassmorphism**: Semi-transparent backgrounds with blur
- **Animations**: Smooth transitions and hover effects
- **Icons**: Lucide React icons throughout

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Blockchain Setup
- `npm run setup-blockchain` - Complete blockchain setup (recommended)
- `npm run deploy-contract` - Deploy smart contract only
- `npm run init-contract` - Initialize deployed contract

### Smart Contracts
- `npm run move:compile` - Compile Move contracts
- `npm run move:test` - Run Move unit tests
- `npm run move:publish` - Publish contracts to blockchain
- `npm run move:upgrade` - Upgrade existing contracts

## Key Features Implemented

### **Homepage**
- Interactive hero section with WebGL background
- Feature showcase with animations
- Responsive design for all devices
- Call-to-action sections

### **Dataset Explorer** 
- Search functionality with real-time filtering
- Grid/list view toggle
- Advanced filtering by tags, trust score, etc.
- Sorting options (downloads, trust score, date)
- Statistics dashboard

### **User Dashboard**
- Personal dataset management
- Upload statistics and analytics  
- Activity timeline
- Quick action buttons
- Wallet integration

### **Upload Wizard**
- Multi-step form with validation
- File drag & drop interface
- Metadata collection
- License selection
- Preview and confirmation

### **Dataset Details**
- Comprehensive dataset information
- Version history timeline
- Blockchain verification data
- Similar dataset recommendations
- Download and sharing options

## Future Enhancements

- [ ] **AI Similarity Detection** - Detect copied/modified datasets
- [ ] **NFT Integration** - Dataset ownership as NFTs
- [ ] **Marketplace** - Buy/sell dataset access rights
- [ ] **API Access** - Programmatic dataset access
- [ ] **Collaboration Tools** - Team dataset management
- [ ] **Analytics Dashboard** - Advanced usage analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Aptos Foundation** - For the blockchain infrastructure
- **shadcn/ui** - For the beautiful UI components  
- **Lucide** - For the icon system
- **Next.js Team** - For the amazing React framework

---

**Built for the future of data ownership and provenance tracking.**
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:upgrade` - a command to upgrade the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.
