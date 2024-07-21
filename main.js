const {BlockChain,Transaction} = require("./src/blockchain")
let tyrantCoin = new BlockChain();

tyrantCoin.createTransaction(new Transaction("address1", "address2", 100));
tyrantCoin.createTransaction(new Transaction("address2", "address1", 50));
console.log("Starting Miner");
tyrantCoin.minePendingTransactions("tyrantx-address");
console.log("Starting Miner2");
tyrantCoin.minePendingTransactions("tyrantx-address");
console.log(
  "Balance of Tyrantx is : ",
  tyrantCoin.getBalanceOfAddress("tyrantx-address")
);