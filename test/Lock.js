const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeSci Meme Tokens", function () {
  let DesciMemeFactory, factory, owner, researcher, buyer;
  const TOKEN_NAME = "Test Research";
  const TOKEN_SYMBOL = "TEST";
  const PDF_HASH = "QmPdfHash123";
  const IMAGE_HASH = "QmImageHash456";
  const MEME_DESC = "Test meme description";
  const TOKEN_PRICE = ethers.parseEther("0.1");
  const INITIAL_SUPPLY = 1000;

  beforeEach(async function () {
    [owner, researcher, buyer] = await ethers.getSigners();
    DesciMemeFactory = await ethers.getContractFactory("DesciMemeFactory");
    factory = await DesciMemeFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("DesciMemeFactory", function () {
    it("Should deploy factory with correct owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should create new research token", async function () {
      const tx = await factory.connect(researcher).createResearchToken(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        PDF_HASH,
        IMAGE_HASH,
        MEME_DESC,
        TOKEN_PRICE,
        INITIAL_SUPPLY
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[receipt.logs.length - 1];
      const tokenAddress = event.args.tokenAddress;

      const research = await factory.getResearchToken(0);
      expect(research.researcher).to.equal(researcher.address);
      expect(research.tokenAddress).to.equal(tokenAddress);
    });

    it("Should fail with empty PDF hash", async function () {
      await expect(
        factory.connect(researcher).createResearchToken(
          TOKEN_NAME,
          TOKEN_SYMBOL,
          "",
          IMAGE_HASH,
          MEME_DESC,
          TOKEN_PRICE,
          INITIAL_SUPPLY
        )
      ).to.be.revertedWith("PDF hash required");
    });

    it("Should track researcher tokens", async function () {
      await factory.connect(researcher).createResearchToken(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        PDF_HASH,
        IMAGE_HASH,
        MEME_DESC,
        TOKEN_PRICE,
        INITIAL_SUPPLY
      );

      const tokens = await factory.getResearcherTokens(researcher.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(0);
    });
  });

  describe("ResearchToken", function () {
    let tokenAddress, token;

    beforeEach(async function () {
      const tx = await factory.connect(researcher).createResearchToken(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        PDF_HASH,
        IMAGE_HASH,
        MEME_DESC,
        TOKEN_PRICE,
        INITIAL_SUPPLY
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[receipt.logs.length - 1];
      tokenAddress = event.args.tokenAddress;
      
      const ResearchToken = await ethers.getContractFactory("ResearchToken");
      token = ResearchToken.attach(tokenAddress);
    });

    it("Should initialize token with correct parameters", async function () {
      expect(await token.name()).to.equal(TOKEN_NAME);
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await token.researcher()).to.equal(researcher.address);
      expect(await token.pdfHash()).to.equal(PDF_HASH);
      expect(await token.imageHash()).to.equal(IMAGE_HASH);
      expect(await token.memeDescription()).to.equal(MEME_DESC);
      expect(await token.tokenPrice()).to.equal(TOKEN_PRICE);
      expect(await token.isActive()).to.be.true;
    });

    it("Should allow token purchase", async function () {
      const amount = 1;
      const payment = TOKEN_PRICE;
      
      const initialBalance = await ethers.provider.getBalance(researcher.address);
      await token.connect(buyer).buyTokens(amount, { value: payment });
      const finalBalance = await ethers.provider.getBalance(researcher.address);
      
      expect(finalBalance - initialBalance).to.equal(payment);
      
      const buyerBalance = await token.balanceOf(buyer.address);
      expect(buyerBalance).to.equal(ethers.parseUnits("1", 18));
    });

    it("Should fail purchase with incorrect payment", async function () {
      const amount = 1;
      const incorrectPayment = TOKEN_PRICE - 1n;
      
      await expect(
        token.connect(buyer).buyTokens(amount, { value: incorrectPayment })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should allow researcher to update price", async function () {
      const newPrice = ethers.parseEther("0.2");
      await token.connect(researcher).updateTokenPrice(newPrice);
      expect(await token.tokenPrice()).to.equal(newPrice);
    });

    it("Should prevent non-researcher from updating price", async function () {
      const newPrice = ethers.parseEther("0.2");
      await expect(
        token.connect(buyer).updateTokenPrice(newPrice)
      ).to.be.revertedWith("Only researcher can update price");
    });

    it("Should toggle active status", async function () {
      await token.connect(researcher).toggleActive();
      expect(await token.isActive()).to.be.false;
      
      await expect(
        token.connect(buyer).buyTokens(1, { value: TOKEN_PRICE })
      ).to.be.revertedWith("Token sale is not active");
    });
  });
});