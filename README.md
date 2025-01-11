# EduChain Faucet

EduChain Faucet is a web-based application for distributing testnet tokens to users for educational or testing purposes. This faucet allows users to request tokens in a secure and controlled way, supporting blockchain-based applications and learning.

## Features

- Distributes testnet tokens to verified users.
- Stores user requests securely in a JSON file.
- Easy setup with environment configuration using `.env`.
- Built with a user-friendly interface using HTML, CSS, and JavaScript.
- API-backed backend using Node.js for secure token distribution.

## Project Structure

- **`.env`**: Holds environment variables.
- **`.gitignore`**: Lists files and directories to be ignored by version control.
- **`app.js`**: Contains server-side logic to handle requests and token distribution.
- **`claims.json`**: Stores user request data, including claims for tokens.
- **`package.json`**: Specifies project dependencies and script commands.
- **`public/index.html`**: The main front-end page where users interact with the faucet.
- **`public/style.css`**: Stylesheet for the front-end interface.

## Installation and Usage

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/EnesKeremAYDIN/educhain-faucet.git
   cd educhain-faucet
   ```

2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Define necessary environment variables, such as API keys.

4. **Run the Application**:
   - Start the server:
     ```bash
     npm start
     ```

## Requirements

- Node.js and npm for the backend.
- A web browser for accessing the front-end interface.

## Disclaimer

This faucet is intended for educational or testing purposes on test networks only.
