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
