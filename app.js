const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const faucetWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const dbFile = './claims.json';

if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({}));
}

const readDatabase = () => {
    const data = fs.readFileSync(dbFile);
    return JSON.parse(data);
};

const writeDatabase = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

const checkLastClaim = (walletAddress) => {
    const db = readDatabase();
    const currentTime = Math.floor(Date.now() / 1000);

    if (db[walletAddress]) {
        const lastClaimTime = db[walletAddress].lastClaimTime;

        if (currentTime - lastClaimTime < 86400) {
            const timeLeft = 86400 - (currentTime - lastClaimTime);
            return { canClaim: false, timeLeft };
        }
    }

    return { canClaim: true };
};

const verifyTurnstile = async (token) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    
    try {
        const response = await axios.post(url, `secret=${secretKey}&response=${token}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.success;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
};

app.get('/wallet-address', (req, res) => {
    res.json({ walletAddress: process.env.WALLET_ADDRESS });
});

app.get('/balance', async (req, res) => {
    try {
        const balance = await provider.getBalance(process.env.WALLET_ADDRESS);
        const eduBalance = ethers.formatEther(balance);
        res.json({ eduBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/faucet', async (req, res) => {
    const { walletAddress, turnstileToken } = req.body;

    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const isTurnstileValid = await verifyTurnstile(turnstileToken);
    if (!isTurnstileValid) {
        return res.status(400).json({ error: 'Turnstile verification failed' });
    }

    const claimStatus = checkLastClaim(walletAddress);

    if (!claimStatus.canClaim) {
        const hours = Math.floor(claimStatus.timeLeft / 3600);
        const minutes = Math.floor((claimStatus.timeLeft % 3600) / 60);
        const seconds = claimStatus.timeLeft % 60;
        return res.status(400).json({
            error: `You have already claimed. Please wait ${hours}h ${minutes}m ${seconds}s before claiming again.`
        });
    }

    try {
        const tx = await faucetWallet.sendTransaction({
            to: walletAddress,
            value: ethers.parseEther(process.env.FAUCET_AMOUNT),
        });

        await tx.wait();

        const db = readDatabase();
        db[walletAddress] = { lastClaimTime: Math.floor(Date.now() / 1000) };
        writeDatabase(db);

        res.json({
            message: `Sent ${process.env.FAUCET_AMOUNT} EDU to ${walletAddress}`,
            txHash: tx.hash
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Faucet system running on port ${PORT}`);
});
