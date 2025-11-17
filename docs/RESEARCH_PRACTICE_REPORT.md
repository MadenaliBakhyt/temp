Astana IT University

School of Software Engineering

APPROVED
Director of the School of Software Engineering
_____________________K.Praveen
«____» ____________ 2025.
Minutes of the Commission Meeting
№ ____ «____» ______ 2025.






REPORT
On Research practice
                          Bakhyt Madenali                    ㅤ
       (Master's student full name)
«7M06105  - Computer Science and Engineering»

Supervisor of the Master's Thesis   [Supervisor Name] (Ph.D., Assistant Professor,
                                                            School of Software Engineering)             ㅤ
                             (full name/ academic position and degree)
Master's Thesis Topic:
In Kazakh «Блокчейн технологиясымен толық стектi децентрализацияланған қаржы қосымшасын әзірлеу және орналастыру»;
In Russian «Разработка и развёртывание полнофункционального децентрализованного финансового приложения с технологией блокчейн»;
In English «Development and Deployment of a Full-Stack Decentralized Finance Application with Blockchain Technology»;

Practice Base Supervisor:    [Supervisor Name]           ㅤ

Place of Research Practice:  School of Software Engineering, Astana IT University  ㅤ




Period of Research Practice:

from «01» September 2025  to  «17» November 2025.





Astana, 2025

---

# THE PROGRAM OF THE RESEARCH PRACTICE

**Master's student:** Bakhyt Madenali
**Program:** 7M06105 - Computer Science and Engineering
**Period of Research Practice:** From «01» September 2025 to «17» November 2025
**Place of Research Practice:** School of Software Engineering, Astana IT University

| № | Sections (stages) of the practice | Execution period | Description of activities | Note |
|---|-----------------------------------|------------------|---------------------------|------|
| 1 | Problem definition and requirements analysis | Week 1 | Analysis of decentralized finance applications; identification of key requirements for token factory and swap functionality; literature review on Web3 technologies and smart contract security | |
| 2 | Smart contract architecture design | Week 2 | Design of ERC-20 token factory pattern; design of fixed-rate DEX mechanism; security consideration analysis; development of contract specifications | |
| 3 | Smart contract implementation | Week 3 | Implementation of YourToken.sol (ERC-20 with cap); implementation of TokenFactory.sol; implementation of SimpleSwap.sol with liquidity management; integration with OpenZeppelin libraries | |
| 4 | Smart contract testing and deployment | Week 4 | Development of comprehensive test suite (50+ tests); deployment to Sepolia testnet; contract verification on Etherscan; ABI extraction for frontend integration | |
| 5 | Backend architecture and SIWE implementation | Week 5 | Design of Express.js backend architecture; implementation of Sign-In with Ethereum (SIWE) authentication; implementation of JWT session management; Prisma ORM setup with SQLite | |
| 6 | User profile management system | Week 6 | Implementation of profile CRUD operations; mock IPFS integration for avatar storage; security middleware implementation (Helmet, CORS, rate limiting); API documentation | |
| 7 | Frontend architecture and Web3 integration | Week 7 | Setup of React + Vite + TypeScript stack; integration of wagmi + viem for Ethereum interactions; implementation of wallet connection and network switching; development of custom hooks for contract interactions | |
| 8 | User interface implementation | Week 8 | Implementation of 7 pages (Home, CreateToken, Swap, Admin, Profile, Balances, Analytics); development of 6 reusable components; implementation of transaction status tracking; Tailwind CSS styling | |
| 9 | The Graph subgraph development | Week 9 | Design of GraphQL schema with 6 entities; implementation of AssemblyScript event handlers; deployment automation scripts; integration with frontend analytics | |
| 10 | System integration, testing and documentation | Week 10 | Docker containerization (production + development); end-to-end system testing; performance optimization; comprehensive documentation preparation | |
| 11 | Final deployment and report preparation | Week 11 | Production deployment guide; research practice report compilation; presentation materials preparation; code repository finalization | |

**Master's student** ______________________ Bakhyt Madenali (signature)

**Practice Base Supervisor** ______________________ [Supervisor Name] (signature)

**Supervisor of the Master's Thesis** ______________________ [Supervisor Name] (signature)

«____» ___________ 2025.

---

# THE CALENDAR PLAN OF THE RESEARCH PRACTICE

**Master's student:** Bakhyt Madenali
**Program:** 7M06105 - Computer Science and Engineering
**Period of Research Practice:** From «01» September 2025 to «17» November 2025
**Place of Research Practice:** School of Software Engineering, Astana IT University

| Week, Date | Name of activity/task | Specific tasks | Expected results |
|------------|----------------------|----------------|------------------|
| **1 week (01.09 – 07.09)** | Problem definition and technology research | Research DeFi applications architecture; analyze existing DEX implementations; study ERC-20 token standards; review security best practices; initialize Git repository | Research findings document; technology stack selection; project repository initialization; approved work plan |
| **2 week (08.09 – 14.09)** | Smart contract architecture design | Design token factory pattern; design fixed-rate swap mechanism; plan liquidity management; define security requirements; create contract specifications | Detailed architecture diagrams; contract interface specifications; security checklist; UML diagrams |
| **3 week (15.09 – 21.09)** | Smart contract implementation | Implement YourToken.sol with OpenZeppelin; implement TokenFactory.sol; implement SimpleSwap.sol; integrate SafeERC20 and ReentrancyGuard; write inline documentation | Complete smart contract code (3 contracts, ~450 lines); integration with OpenZeppelin 5.0; documented contract interfaces |
| **4 week (22.09 – 28.09)** | Testing and deployment | Write comprehensive test suite; test all contract functions; deploy to Sepolia testnet; verify contracts on Etherscan; extract ABIs | 50+ passing tests; deployed contracts on Sepolia; verified contracts; ABIs exported; deployments.json created |
| **5 week (29.09 – 05.10)** | Backend architecture implementation | Set up Express.js + TypeScript; implement SIWE authentication flow; configure Prisma ORM; set up SQLite database; implement JWT token generation | Working backend server; SIWE authentication endpoint; database schema; JWT middleware; health check endpoint |
| **6 week (06.10 – 12.10)** | Profile management system | Implement profile CRUD operations; add avatar upload (mock IPFS); configure security middleware; implement rate limiting; write API tests | Complete profile management API; secure endpoints; rate limiting active; CORS configured; API documentation |
| **7 week (13.10 – 19.10)** | Frontend Web3 integration | Set up React + Vite project; configure wagmi + viem; implement wallet connection; create network guard; develop useAuth hook | Working React app; wallet connection; network switching; SIWE sign-in; wagmi configuration |
| **8 week (20.10 – 26.10)** | UI/UX implementation | Implement CreateToken page; implement Swap page with buy/sell; implement Admin liquidity management; implement Profile page; create reusable components | 7 complete pages; 6 reusable components; Tailwind CSS styling; responsive design; transaction tracking |
| **9 week (27.10 – 02.11)** | The Graph subgraph development | Design GraphQL schema; implement event handlers (TokenCreated, Listed, Bought, Sold); create deployment scripts; test subgraph queries | Complete subgraph with 6 entities; 8 event handlers; deployment automation; GraphQL API; query examples |
| **10 week (03.11 – 09.11)** | System integration and containerization | Create Docker configurations; implement docker-compose; write deployment documentation; perform end-to-end testing; optimize performance | Working Docker setup; production + dev compose files; deployment guide; tested full stack; performance metrics |
| **11 week (10.11 – 17.11)** | Documentation and finalization | Complete research practice report; finalize code documentation; prepare presentation materials; conduct final code review; archive deliverables | Final research report; complete codebase (130+ files); deployment guide; presentation slides; published repository |

**Master's student** ______________________ Bakhyt Madenali (signature)

**Practice Base Supervisor** ______________________ [Supervisor Name] (signature)

**Supervisor of the Master's Thesis** ______________________ [Supervisor Name] (signature)

«____» ___________ 2025.

---

# Content

1. [Introduction](#introduction)
   - 1.1 [Selecting the Research Topic and Justifying Relevance](#11-selecting-the-research-topic-and-justifying-relevance)
   - 1.2 [Setting Goals and Objectives](#12-setting-goals-and-objectives-defining-the-object-and-subject-of-the-study)
2. [Literature Review](#2-literature-review)
   - 2.1 [Decentralized Finance and Token Standards](#21-decentralized-finance-and-token-standards)
   - 2.2 [Smart Contract Security Patterns](#22-smart-contract-security-patterns)
   - 2.3 [Web3 Authentication Methods](#23-web3-authentication-methods)
   - 2.4 [Blockchain Data Indexing Solutions](#24-blockchain-data-indexing-solutions)
3. [System Design and Architecture](#3-system-design-and-architecture)
   - 3.1 [Overall System Architecture](#31-overall-system-architecture)
   - 3.2 [Smart Contract Layer Design](#32-smart-contract-layer-design)
   - 3.3 [Backend Architecture](#33-backend-architecture)
   - 3.4 [Frontend Architecture](#34-frontend-architecture)
   - 3.5 [Indexing Layer with The Graph](#35-indexing-layer-with-the-graph)
4. [Implementation](#4-implementation)
   - 4.1 [Smart Contract Development](#41-smart-contract-development)
   - 4.2 [Backend Implementation](#42-backend-implementation)
   - 4.3 [Frontend Development](#43-frontend-development)
   - 4.4 [Subgraph Implementation](#44-subgraph-implementation)
   - 4.5 [DevOps and Deployment](#45-devops-and-deployment)
5. [Testing and Evaluation](#5-testing-and-evaluation)
   - 5.1 [Smart Contract Testing](#51-smart-contract-testing)
   - 5.2 [Integration Testing](#52-integration-testing)
   - 5.3 [Performance Evaluation](#53-performance-evaluation)
   - 5.4 [Security Analysis](#54-security-analysis)
6. [Results and Discussion](#6-results-and-discussion)
   - 6.1 [Achieved Functionality](#61-achieved-functionality)
   - 6.2 [Performance Metrics](#62-performance-metrics)
   - 6.3 [Security Assessment](#63-security-assessment)
   - 6.4 [Comparison with Existing Solutions](#64-comparison-with-existing-solutions)
7. [Conclusion](#7-conclusion)
8. [Bibliography](#8-bibliography)

---

# 1. Introduction

## 1.1. Selecting the Research Topic and Justifying Relevance

The rapid evolution of blockchain technology and decentralized finance (DeFi) has fundamentally transformed the landscape of financial services and digital asset management. Traditional centralized financial systems face inherent challenges including single points of failure, limited transparency, restricted access, and dependency on intermediary institutions. Blockchain-based decentralized applications (dApps) address these limitations by providing trustless, transparent, and permissionless financial infrastructure that operates without central authority.

The emergence of Ethereum and smart contract platforms has enabled the creation of programmable financial protocols that automate complex transactions, enforce agreements through code, and eliminate intermediaries. Within this ecosystem, token factories and decentralized exchanges (DEXs) represent foundational primitives that enable users to create custom digital assets and exchange them in a peer-to-peer manner without relying on centralized exchanges or custodial services.

Despite the proliferation of DeFi protocols, several critical challenges persist in the current landscape:

**1. Complexity and Accessibility:** Most existing DeFi platforms present steep learning curves for new users, with complex interfaces, technical jargon, and fragmented user experiences across multiple protocols. The process of creating tokens often requires deep technical knowledge of smart contract development, deployment, and verification.

**2. Security Vulnerabilities:** Smart contract exploits have resulted in billions of dollars in losses, with common vulnerabilities including reentrancy attacks, integer overflows, access control failures, and economic manipulation. Many projects lack comprehensive security audits and fail to implement established security patterns.

**3. Lack of Transparency and Auditability:** While blockchain transactions are public, understanding protocol behavior, token economics, and historical activity patterns requires specialized tools and technical expertise. Users cannot easily verify the fairness of exchange rates, track liquidity changes, or audit protocol operations without external indexing services.

**4. Privacy and Authentication Challenges:** Traditional Web2 authentication models conflict with Web3 principles of self-sovereignty and privacy. Users face challenges in managing decentralized identities while maintaining control over personal data. Most DeFi protocols lack integrated user profile systems that respect privacy while enabling personalized experiences.

**5. Centralization in Deployment and Infrastructure:** Many supposedly decentralized applications rely heavily on centralized cloud services, third-party RPC providers, and proprietary infrastructure. This creates single points of failure, vendor lock-in, and compromises the core promise of decentralization.

The relevance of this research lies in addressing these challenges through the development of a comprehensive, production-ready full-stack decentralized finance application that integrates:

- **Secure Smart Contracts:** Implementation of token creation and exchange mechanisms using battle-tested security patterns from OpenZeppelin, including ReentrancyGuard, SafeERC20, and Ownable access control.

- **User-Centric Authentication:** Integration of Sign-In with Ethereum (SIWE) for cryptographically secure, privacy-preserving authentication that eliminates password vulnerabilities and gives users full control over their identities.

- **Transparent On-Chain Analytics:** Deployment of The Graph subgraph for real-time indexing and querying of blockchain events, enabling users to analyze trading patterns, liquidity movements, and protocol statistics without centralized dependencies.

- **Self-Hosted Infrastructure:** Complete containerization and deployment automation enabling institutions and developers to run the entire stack independently, reducing reliance on third-party services and enhancing data sovereignty.

For Kazakhstan's emerging blockchain ecosystem, this research contributes to the national strategy of digital transformation and technological independence. As educational institutions and enterprises seek to adopt blockchain technologies, locally developed, well-documented, and security-audited solutions become essential. The project demonstrates how modern Web3 technologies can be integrated into a cohesive system suitable for academic research, entrepreneurial ventures, and institutional deployment.

Globally, the development of transparent, secure, and accessible DeFi infrastructure aligns with the broader movement toward financial inclusion and democratization of financial services. By providing a reference implementation that combines smart contract development, Web3 authentication, decentralized indexing, and modern DevOps practices, this research contributes to the body of knowledge on full-stack blockchain application development.

The technical novelty of this work lies in its holistic approach: rather than focusing on isolated components, the research integrates four distinct technological layers (smart contracts, backend services, frontend interfaces, and blockchain indexing) into a unified, interoperable system. This integration demonstrates how different Web3 primitives can work together to create user-friendly, secure, and transparent financial applications.

Furthermore, the emphasis on explainability, documentation, and reproducibility makes this research valuable for both academic and practical purposes. The complete source code, comprehensive testing suite, deployment automation, and detailed documentation enable others to learn from, extend, and deploy similar systems in diverse contexts.

## 1.2. Setting Goals and Objectives, Defining the Object and Subject of the Study

The **overall goal** of this research practice is to design, implement, test, and deploy a complete full-stack decentralized finance application that enables users to create ERC-20 tokens and exchange them through a simple decentralized exchange mechanism, while maintaining high standards of security, transparency, and usability.

### Primary Objectives

The research practice pursues the following specific objectives:

**1. Smart Contract Layer Development**
   - Design and implement three production-ready smart contracts:
     - **YourToken.sol**: An ERC-20 token with configurable decimals, initial supply, and maximum cap
     - **TokenFactory.sol**: A factory contract using the factory pattern to deploy token instances
     - **SimpleSwap.sol**: A decentralized exchange with fixed exchange rates and liquidity management
   - Integrate security best practices including OpenZeppelin 5.0 libraries, ReentrancyGuard, SafeERC20, and access control mechanisms
   - Develop comprehensive test coverage with at least 50 unit and integration tests
   - Deploy contracts to Sepolia testnet and verify on Etherscan

**2. Backend Service Implementation**
   - Implement Sign-In with Ethereum (SIWE) authentication protocol for cryptographic user authentication
   - Develop JWT-based session management system with configurable expiration
   - Create user profile management API with nickname and avatar storage
   - Integrate Prisma ORM with SQLite database for data persistence
   - Implement security middleware including Helmet, CORS, rate limiting, and input validation

**3. Frontend Application Development**
   - Build React 18 application using Vite build tool and TypeScript
   - Integrate wagmi 2.5+ and viem 2.7+ libraries for Ethereum interactions
   - Implement wallet connection supporting MetaMask and WalletConnect
   - Create seven functional pages: Home, CreateToken, Swap, Admin, Profile, Balances, Analytics
   - Develop custom React hooks for contract interactions and authentication
   - Apply Tailwind CSS for responsive, modern user interface design

**4. Blockchain Data Indexing**
   - Design GraphQL schema with six entity types for comprehensive event tracking
   - Implement AssemblyScript event handlers for TokenFactory and SimpleSwap events
   - Deploy subgraph to The Graph Studio for decentralized data indexing
   - Create automated deployment scripts for multi-network support
   - Develop example queries demonstrating analytics capabilities

**5. DevOps and Deployment Automation**
   - Containerize all services using Docker with multi-stage builds
   - Create docker-compose configurations for development and production environments
   - Write comprehensive deployment documentation
   - Implement automated ABI extraction and configuration management
   - Develop production-ready deployment guides for Sepolia testnet

**6. Documentation and Knowledge Transfer**
   - Produce detailed technical documentation for each system component
   - Create step-by-step setup guides for developers
   - Write API reference documentation
   - Prepare research practice report following academic standards
   - Publish complete codebase with permissive open-source license

### Research Object and Subject

The **object** of this research is the complete full-stack decentralized application ecosystem, comprising smart contracts, backend services, frontend interfaces, and blockchain indexing infrastructure that together enable trustless token creation and exchange.

The **subject** of this research is the integration methodology, architectural patterns, and implementation techniques that combine Web3 technologies (smart contracts, SIWE authentication, The Graph indexing) with traditional web development practices (REST APIs, React frameworks, containerization) to create a secure, user-friendly, and production-ready DeFi application.

### Scope and Boundaries

This research practice focuses specifically on:

**In Scope:**
- ERC-20 token standard implementation with factory pattern
- Fixed-rate DEX mechanism (not automated market maker)
- Sepolia testnet deployment (not mainnet)
- Self-hosted infrastructure (not managed cloud services)
- Mock IPFS implementation (not full IPFS network integration)
- Single-chain deployment (Ethereum Sepolia)

**Out of Scope:**
- Automated market maker (AMM) algorithms
- Cross-chain bridge implementation
- Mainnet deployment and economic security analysis
- Governance token mechanisms
- Advanced DeFi primitives (lending, yield farming, etc.)
- Mobile application development

### Expected Outcomes

Upon completion of the research practice, the following deliverables are expected:

1. **Functional Software System:**
   - Three deployed and verified smart contracts on Sepolia testnet
   - Running backend server with authentication and profile management
   - Deployed frontend application accessible via web browser
   - Active subgraph indexing on-chain events

2. **Technical Documentation:**
   - Complete README files for each component
   - API documentation with request/response examples
   - Deployment guides for local and testnet environments
   - Architecture diagrams and data flow illustrations

3. **Testing Artifacts:**
   - Smart contract test suite with >50 tests and detailed coverage reports
   - Integration test scenarios demonstrating end-to-end workflows
   - Security analysis documenting potential vulnerabilities and mitigations

4. **Research Outputs:**
   - Comprehensive research practice report following academic format
   - Technical presentation materials
   - Published GitHub repository with complete source code

### Methodological Approach

The research follows an iterative development methodology combining elements of agile software development with rigorous academic research standards:

1. **Literature Review Phase:** Systematic review of existing DeFi protocols, smart contract security patterns, Web3 authentication methods, and blockchain indexing solutions.

2. **Design Phase:** Architecture design following separation of concerns, defining interfaces between components, and planning security measures.

3. **Implementation Phase:** Incremental development with continuous integration, following test-driven development practices where applicable.

4. **Testing Phase:** Comprehensive testing at unit, integration, and system levels, including security audits and performance benchmarking.

5. **Deployment Phase:** Progressive deployment from local environment to testnet, with monitoring and validation of system behavior.

6. **Documentation Phase:** Continuous documentation throughout development, culminating in final report preparation and knowledge transfer.

The success criteria for this research practice include:
- All smart contracts pass comprehensive test suites and are deployed to Sepolia testnet
- Backend API responds to all defined endpoints with proper authentication and error handling
- Frontend application successfully connects to MetaMask and executes all core workflows
- Subgraph indexes all relevant events and responds to GraphQL queries
- Complete documentation enables independent reproduction of the system
- Final report meets academic standards for research practice documentation

By achieving these objectives, the research practice contributes both practical software artifacts and theoretical insights into full-stack blockchain application development, serving as a reference implementation for future Web3 projects in Kazakhstan and beyond.

