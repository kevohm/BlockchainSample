const crypto = require("crypto")
const EC = require("elliptic").ec
const ec = new EC("secp256k1")

function createHash(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
  calculateHash(){
    return createHash(this.fromAddress + this.toAddress + this.amount)
  }
  signTransaction(signingKey){
    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')
    this.signature = sig.toDER('hex')
  }
  isValid(){
    if(this.fromAddress === null) return true
    if(!this.signature || this.signature.length === 0 ){
      throw new Error("No signature found")
    }
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.created_at = new Date(timestamp).toLocaleString();
    this.hash = this.calculateHash();
    this.nounce = 0;
  }

  calculateHash() {
    return createHash(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nounce
    ).toString();
  }
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nounce++;
      this.hash = this.calculateHash();
    }
    console.log("Block Mined: ", this.hash);
  }
  hasValidTransactions(){
    for(const tx of this.transactions){
      if(!tx.isValid()) return false
    }
    return true
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 5;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }
  createGenesisBlock() {
    return new Block(Date.now(), "Genesis Block", "0");
  }
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }
  minePendingTransactions(miningAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);
    console.log("Block successfully mined!");
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, miningAddress, this.miningReward),
    ];
  }
  addTransaction(transaction) {
    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error("Please provide transaction from and to address")
    }
    if(!transaction.isValid()){
      throw new Error("Transactions is invalid")

    }
    this.pendingTransactions.push(transaction);
  }
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if(!currentBlock.hasValidTransactions()){
        return false
      }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = {BlockChain,Transaction}