import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenFactory, YourToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenFactory", function () {
  let factory: TokenFactory;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    factory = await TokenFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Token Creation", function () {
    it("Should create a new token successfully", async function () {
      const tx = await factory.connect(user1).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => {
          try {
            return factory.interface.parseLog(log)?.name === "TokenCreated";
          } catch {
            return false;
          }
        }
      );

      expect(event).to.not.be.undefined;

      const allTokens = await factory.getAllTokens();
      expect(allTokens.length).to.equal(1);
    });

    it("Should emit TokenCreated event with correct parameters", async function () {
      await expect(
        factory.connect(user1).createToken(
          "Test Token",
          "TEST",
          18,
          ethers.parseEther("1000"),
          ethers.parseEther("10000")
        )
      )
        .to.emit(factory, "TokenCreated")
        .withArgs(
          user1.address,
          (value: any) => typeof value === "string" && value.startsWith("0x"),
          "Test Token",
          "TEST",
          ethers.parseEther("1000")
        );
    });

    it("Should set msg.sender as the token owner", async function () {
      const tx = await factory.connect(user1).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      const receipt = await tx.wait();
      const tokenAddress = await factory.allTokens(0);

      const token = await ethers.getContractAt("YourToken", tokenAddress);
      expect(await token.owner()).to.equal(user1.address);
    });

    it("Should mint initial supply to token owner", async function () {
      const initialSupply = ethers.parseEther("1000");

      await factory.connect(user1).createToken(
        "Test Token",
        "TEST",
        18,
        initialSupply,
        ethers.parseEther("10000")
      );

      const tokenAddress = await factory.allTokens(0);
      const token = await ethers.getContractAt("YourToken", tokenAddress);

      expect(await token.balanceOf(user1.address)).to.equal(initialSupply);
    });

    it("Should revert if name is empty", async function () {
      await expect(
        factory.connect(user1).createToken(
          "",
          "TEST",
          18,
          ethers.parseEther("1000"),
          ethers.parseEther("10000")
        )
      ).to.be.revertedWith("TokenFactory: name cannot be empty");
    });

    it("Should revert if symbol is empty", async function () {
      await expect(
        factory.connect(user1).createToken(
          "Test Token",
          "",
          18,
          ethers.parseEther("1000"),
          ethers.parseEther("10000")
        )
      ).to.be.revertedWith("TokenFactory: symbol cannot be empty");
    });

    it("Should revert if cap is less than initial supply", async function () {
      await expect(
        factory.connect(user1).createToken(
          "Test Token",
          "TEST",
          18,
          ethers.parseEther("10000"),
          ethers.parseEther("1000")
        )
      ).to.be.revertedWith("YourToken: cap must be >= initialSupply");
    });

    it("Should create token with custom decimals", async function () {
      await factory.connect(user1).createToken(
        "Test Token",
        "TEST",
        6,
        1000000n, // 1 token with 6 decimals
        10000000n // 10 tokens with 6 decimals
      );

      const tokenAddress = await factory.allTokens(0);
      const token = await ethers.getContractAt("YourToken", tokenAddress);

      expect(await token.decimals()).to.equal(6);
    });
  });

  describe("Token Tracking", function () {
    beforeEach(async function () {
      // Create tokens from different users
      await factory.connect(user1).createToken(
        "Token 1",
        "TK1",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      await factory.connect(user1).createToken(
        "Token 2",
        "TK2",
        18,
        ethers.parseEther("2000"),
        ethers.parseEther("20000")
      );

      await factory.connect(user2).createToken(
        "Token 3",
        "TK3",
        18,
        ethers.parseEther("3000"),
        ethers.parseEther("30000")
      );
    });

    it("Should track all created tokens", async function () {
      const allTokens = await factory.getAllTokens();
      expect(allTokens.length).to.equal(3);
    });

    it("Should track tokens by owner", async function () {
      const user1Tokens = await factory.getMyTokens(user1.address);
      const user2Tokens = await factory.getMyTokens(user2.address);

      expect(user1Tokens.length).to.equal(2);
      expect(user2Tokens.length).to.equal(1);
    });

    it("Should return correct total tokens count", async function () {
      expect(await factory.totalTokens()).to.equal(3);
    });

    it("Should allow accessing tokens by index", async function () {
      const token0 = await factory.allTokens(0);
      const token1 = await factory.allTokens(1);
      const token2 = await factory.allTokens(2);

      expect(token0).to.be.properAddress;
      expect(token1).to.be.properAddress;
      expect(token2).to.be.properAddress;
    });
  });

  describe("Multiple Users", function () {
    it("Should allow multiple users to create tokens independently", async function () {
      await factory.connect(user1).createToken(
        "User1 Token",
        "U1T",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      await factory.connect(user2).createToken(
        "User2 Token",
        "U2T",
        18,
        ethers.parseEther("2000"),
        ethers.parseEther("20000")
      );

      const user1Tokens = await factory.getMyTokens(user1.address);
      const user2Tokens = await factory.getMyTokens(user2.address);

      expect(user1Tokens.length).to.equal(1);
      expect(user2Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.not.equal(user2Tokens[0]);
    });

    it("Should maintain separate ownership for each token", async function () {
      await factory.connect(user1).createToken(
        "Token 1",
        "TK1",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      await factory.connect(user2).createToken(
        "Token 2",
        "TK2",
        18,
        ethers.parseEther("2000"),
        ethers.parseEther("20000")
      );

      const token1Address = await factory.allTokens(0);
      const token2Address = await factory.allTokens(1);

      const token1 = await ethers.getContractAt("YourToken", token1Address);
      const token2 = await ethers.getContractAt("YourToken", token2Address);

      expect(await token1.owner()).to.equal(user1.address);
      expect(await token2.owner()).to.equal(user2.address);
    });
  });

  describe("YourToken Functionality", function () {
    let token: YourToken;

    beforeEach(async function () {
      await factory.connect(user1).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      const tokenAddress = await factory.allTokens(0);
      token = await ethers.getContractAt("YourToken", tokenAddress);
    });

    it("Should allow owner to mint tokens within cap", async function () {
      await token.connect(user1).mint(user2.address, ethers.parseEther("500"));

      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("500"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("1500"));
    });

    it("Should revert when minting exceeds cap", async function () {
      await expect(
        token.connect(user1).mint(user2.address, ethers.parseEther("9001"))
      ).to.be.revertedWith("YourToken: cap exceeded");
    });

    it("Should revert when non-owner tries to mint", async function () {
      await expect(
        token.connect(user2).mint(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should allow anyone to burn their own tokens", async function () {
      await token.connect(user1).burn(ethers.parseEther("100"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("900"));
    });

    it("Should allow burning tokens from approved address", async function () {
      await token.connect(user1).approve(user2.address, ethers.parseEther("100"));
      await token.connect(user2).burnFrom(user1.address, ethers.parseEther("100"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
    });

    it("Should have correct token metadata", async function () {
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TEST");
      expect(await token.decimals()).to.equal(18);
      expect(await token.cap()).to.equal(ethers.parseEther("10000"));
    });
  });
});
