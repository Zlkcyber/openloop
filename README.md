# OpenLoop Decentralized bandwidth

![banner](image.png)

## OpenLoop Network is a decentralized wireless network built to enhance Internet service delivery, making it more efficient, accessible, and rewarding for everyone. 🤩

- Website [https://openloop.so/](https://openloop.so/)
- Twitter [@openloop_so](https://x.com/openloop_so)
- Telegram [@openloop_updates](https://t.me/openloop_updates)
- discord [https://discord.com/invite/75qBRaUczN](https://discord.com/invite/75qBRaUczN)

## Update
- **auto update tokens if expired**:
- fill email and pass to `accounts.txt`
   ![accounts.txt](image-2.png)


## **Features**

- **Register Accounts**
- **Load Existing Tokens**: Load pre-existing tokens if you already have account.
- **Auto Ping**
- **Auto Reff**
- **Support Multy Accounts**
- **Support Proxy**

## **Requirements**

- **Node.js**: Ensure you have Node.js installed.
- **npm**: Ensure you have npm installed.

## **make sure you have same number account and proxy**

if you already have account you can put `access-token` to `token.txt`,

put your proxy in file `proxy.txt` format `http://username:pass@ip:port`

![intro](image-1.png)

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/Zlkcyber/openloop.git
   cd openloop
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup to create accounts and get Tokens:
   ```bash
   npm run setup
   ```
4. Batch get token Run:(accounts.txt Fill in the account information to run directly here)
   ```bash
    node getToken.js
   ```
5. Run The Script:
   ```bash
   npm run start
   ```
6. Auto reff using temp mail
   ```bash
   npm run autoreff
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
