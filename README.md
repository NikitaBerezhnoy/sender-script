# Setup
Just use npm to install packages:
```
npm install
```

# Configure
This script parses data from distribution.csv and uses setting from the .env file. You can look at the example.env for the reference.

- PRIVATE_KEY - pass there the private key for the account which must be used for the tx sending
- ACCOUNT_ADDRESS -  pass there the account address from which tx must be sent
- PROVIDER - put there provider link, like infura link.
- VAULT_ADDRESS - check that that is the right vault contract address
- START_AT - this is the pointer from which address to start sending. Must be 0 for the first time and if sending will fail at some point, you can choose the start point to continue sending
- BATCH_SIZE - how many addresses must be sent with the contract call. On testnet optimal value was 50.

# Launch
Launch index.js with the node:
```
node index.js
```