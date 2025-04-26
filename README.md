# Decentralized E-Voting System Using Blockchain

## Project Overview

The **Decentralized E-Voting System** is a secure, transparent, and tamper-proof voting platform designed to enhance the integrity and efficiency of elections by leveraging **Blockchain Technology** (Hyperledger Fabric) and a **MERN Stack** web interface. It aims to eliminate vulnerabilities such as vote tampering, fraud, and lack of transparency found in traditional voting systems.


---

## Features

- Secure Voter Authentication (OTP and JWT)
- Blockchain-based Voting with immutability
- Real-time Election Results
- Smart Contracts (Chaincode) for voting logic
- Role-Based Access Control (RBAC)
- End-to-End Encryption (AES-256)
- REST APIs
- Responsive Frontend (React.js)

---

## Technology Stack

### Blockchain
- Hyperledger Fabric (Private, permissioned blockchain)

### Web Development
- MongoDB
- Express.js
- React.js
- Node.js

### Tools Used
- Docker
- Visual Studio Code
- MongoDB Compass
- Git and GitHub

---

## System Requirements

- Docker and Docker Compose
- Node.js (version 16+ recommended)
- Hyperledger Fabric binaries
- MongoDB

---

## Installation and Setup

### 1. Clone the Repository

- `git clone https://github.com/your-repo/Decentralized-E-Voting.git`
- `cd Decentralized-E-Voting`

### 2. Setup Hyperledger Fabric

- Install prerequisites
- Download Fabric samples:  
  `curl -sSL https://bit.ly/2ysbOFE | bash -s`
- Navigate to network folder:  
  `cd fabric-samples/test-network`
- Start the network:  
  `./network.sh down`  
  `./network.sh up createChannel -c mychannel -ca`

### 3. Deploy Chaincode

- Deploy Chaincode:
  `./network.sh deployCC -ccn voting -ccp ../EVoting/Evoting/chaincode/ -ccl javascript`

### 4. Setup Web Application

- Navigate to api folder
- Install dependencies:
  `npm install`
- Start frontend server:
  `npm run start`

---

## Major Modules

- **Voter Module**
  - Registration and Authentication
  - View Elections
  - Cast Votes

- **Admin Module**
  - Election and Candidate Management
  - Vote Counting and Results

- **Blockchain Backend**
  - Smart Contracts for Voting

---

## API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| POST | /loginUser | Voter login via OTP |
| POST | /castVote | Submit a vote |
| GET | /elections | Fetch list of elections |
| POST | /elections | Create a new election |
| GET | /results/:id | Fetch election results |
| POST | /loginElectionCommittee | Committee login |

---

## Testing

- Unit Testing for Smart Contracts
- Integration Testing for APIs and Blockchain
- Functional Testing for User Flows
- Security Testing for authentication and encryption

---


## Limitations

- Requires stable internet access
- Scalability limitations for national-scale elections
- No dedicated mobile application
- Some usability challenges for non-technical users

---

## Future Enhancements

- Mobile Application (iOS and Android)
- Zero-Knowledge Proofs for enhanced voter privacy
- AI-based Fraud Detection
- Integration with National ID Systems
- Improved Blockchain Scalability

---

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/latest/)
- [IBM Blockchain Platform](https://www.ibm.com/docs/en/blockchain-platform)
- [Hyperledger Fabric GitHub](https://github.com/hyperledger/fabric)

---

