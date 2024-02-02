const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/getTokens", async (req, res) => {
  const { address, chain } = req.query;

  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: chain,
    address: address,
  });

  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: chain,
    address: address,
    mediaItems: true,
  });

  console.log(nfts.raw.result);

  const myNfts = nfts.raw.result.map((e, i) => {
    if (
      e?.media?.media_collection?.high?.url &&
      !e.possible_spam &&
      e?.media?.category !== "video"
    ) {
      return e["media"]["media_collection"]["high"]["url"];
    }
  });

  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    chain: chain,
    address: address,
  });

  const jsonResponse = {
    tokens: tokens.raw,
    nfts: myNfts,
    balance: balance.raw.balance / 10 ** 18,
  };

  return res.status(200).json(jsonResponse);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
