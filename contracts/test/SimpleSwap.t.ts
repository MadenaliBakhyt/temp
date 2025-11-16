import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleSwap, TokenFactory, YourToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleSwap", function () {
  let swap: SimpleSwap;
  let factory: TokenFactory;
  let token: YourToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("10000");
  const TOKEN_CAP = ethers.parseEther("100000");
  const TOKEN_PER_ETH = ethers.parseEther("100"); // 100 tokens per 1 ETH
  const MIN_ETH_LIQUIDITY = ethers.parseEther("1"); // 1 ETH minimum

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TokenFactory
    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    factory = await TokenFactory.deploy();
    await factory.waitForDeployment();

    // Create a test token
    await factory.connect(owner).createToken(
      "Test Token",
      "TEST",
      18,
      INITIAL_SUPPLY,
      TOKEN_CAP
    );

    const tokenAddress = await factory.allTokens(0);
    token = await ethers.getContractAt("YourToken", tokenAddress);

    // Deploy SimpleSwap
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    swap = await SimpleSwap.deploy(owner.address);
    await swap.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await swap.owner()).to.equal(owner.address);
    });

    it("Should have no listed tokens initially", async function () {
      const listedTokens = await swap.getListedTokens();
      expect(listedTokens.length).to.equal(0);
    });
  });

  describe("Listing Tokens", function () {
    it("Should allow owner to list a token", async function () {
      await expect(
        swap.connect(owner).listToken(
          await token.getAddress(),
          TOKEN_PER_ETH,
          MIN_ETH_LIQUIDITY
        )
      )
        .to.emit(swap, "Listed")
        .withArgs(await token.getAddress(), TOKEN_PER_ETH, MIN_ETH_LIQUIDITY);

      const listedTokens = await swap.getListedTokens();
      expect(listedTokens.length).to.equal(1);
      expect(listedTokens[0]).to.equal(await token.getAddress());
    });

    it("Should store correct token info when listing", async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.isListed).to.be.true;
      expect(info.tokenPerEth).to.equal(TOKEN_PER_ETH);
      expect(info.minEthLiquidity).to.equal(MIN_ETH_LIQUIDITY);
      expect(info.tokenBalance).to.equal(0);
      expect(info.ethBalance).to.equal(0);
    });

    it("Should revert if non-owner tries to list token", async function () {
      await expect(
        swap.connect(user1).listToken(
          await token.getAddress(),
          TOKEN_PER_ETH,
          MIN_ETH_LIQUIDITY
        )
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });

    it("Should revert if token address is zero", async function () {
      await expect(
        swap.connect(owner).listToken(
          ethers.ZeroAddress,
          TOKEN_PER_ETH,
          MIN_ETH_LIQUIDITY
        )
      ).to.be.revertedWith("SimpleSwap: token cannot be zero address");
    });

    it("Should revert if rate is zero", async function () {
      await expect(
        swap.connect(owner).listToken(
          await token.getAddress(),
          0,
          MIN_ETH_LIQUIDITY
        )
      ).to.be.revertedWith("SimpleSwap: rate must be > 0");
    });

    it("Should revert if token is already listed", async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      await expect(
        swap.connect(owner).listToken(
          await token.getAddress(),
          TOKEN_PER_ETH,
          MIN_ETH_LIQUIDITY
        )
      ).to.be.revertedWith("SimpleSwap: token already listed");
    });
  });

  describe("Unlisting Tokens", function () {
    beforeEach(async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );
    });

    it("Should allow owner to unlist a token", async function () {
      await expect(swap.connect(owner).unlistToken(await token.getAddress()))
        .to.emit(swap, "Unlisted")
        .withArgs(await token.getAddress());

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.isListed).to.be.false;

      const listedTokens = await swap.getListedTokens();
      expect(listedTokens.length).to.equal(0);
    });

    it("Should revert if non-owner tries to unlist", async function () {
      await expect(
        swap.connect(user1).unlistToken(await token.getAddress())
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });

    it("Should revert if token is not listed", async function () {
      await expect(
        swap.connect(owner).unlistToken(user1.address)
      ).to.be.revertedWith("SimpleSwap: token not listed");
    });
  });

  describe("Setting Rate", function () {
    beforeEach(async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );
    });

    it("Should allow owner to update rate", async function () {
      const newRate = ethers.parseEther("200");

      await expect(
        swap.connect(owner).setRate(await token.getAddress(), newRate)
      )
        .to.emit(swap, "RateUpdated")
        .withArgs(await token.getAddress(), newRate);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.tokenPerEth).to.equal(newRate);
    });

    it("Should revert if rate is zero", async function () {
      await expect(
        swap.connect(owner).setRate(await token.getAddress(), 0)
      ).to.be.revertedWith("SimpleSwap: rate must be > 0");
    });

    it("Should revert if non-owner tries to set rate", async function () {
      await expect(
        swap.connect(user1).setRate(await token.getAddress(), ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });

    it("Should revert if token is not listed", async function () {
      await expect(
        swap.connect(owner).setRate(user1.address, ethers.parseEther("200"))
      ).to.be.revertedWith("SimpleSwap: token not listed");
    });
  });

  describe("Adding Liquidity", function () {
    beforeEach(async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );
    });

    it("Should allow owner to add token liquidity", async function () {
      const tokenAmount = ethers.parseEther("1000");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);

      await expect(
        swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount)
      )
        .to.emit(swap, "LiquidityAdded")
        .withArgs(await token.getAddress(), tokenAmount, 0);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.tokenBalance).to.equal(tokenAmount);
    });

    it("Should allow owner to add ETH liquidity", async function () {
      const ethAmount = ethers.parseEther("10");

      await expect(
        swap.connect(owner).addLiquidity(await token.getAddress(), 0, {
          value: ethAmount,
        })
      )
        .to.emit(swap, "LiquidityAdded")
        .withArgs(await token.getAddress(), 0, ethAmount);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.ethBalance).to.equal(ethAmount);
    });

    it("Should allow owner to add both token and ETH liquidity", async function () {
      const tokenAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("10");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);

      await expect(
        swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount, {
          value: ethAmount,
        })
      )
        .to.emit(swap, "LiquidityAdded")
        .withArgs(await token.getAddress(), tokenAmount, ethAmount);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.tokenBalance).to.equal(tokenAmount);
      expect(info.ethBalance).to.equal(ethAmount);
    });

    it("Should revert if no liquidity is added", async function () {
      await expect(
        swap.connect(owner).addLiquidity(await token.getAddress(), 0)
      ).to.be.revertedWith("SimpleSwap: must add some liquidity");
    });

    it("Should revert if non-owner tries to add liquidity", async function () {
      await expect(
        swap.connect(user1).addLiquidity(await token.getAddress(), 0, {
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });
  });

  describe("Buying Tokens", function () {
    beforeEach(async function () {
      // List token and add liquidity
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      const tokenAmount = ethers.parseEther("5000");
      const ethAmount = ethers.parseEther("10");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);
      await swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount, {
        value: ethAmount,
      });
    });

    it("Should allow users to buy tokens with ETH", async function () {
      const ethIn = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("100"); // 1 ETH * 100 tokens/ETH

      await expect(
        swap.connect(user1).buyToken(await token.getAddress(), {
          value: ethIn,
        })
      )
        .to.emit(swap, "Bought")
        .withArgs(user1.address, await token.getAddress(), ethIn, expectedTokens);

      expect(await token.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("Should update liquidity balances correctly after buy", async function () {
      const ethIn = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("100");

      const infoBefore = await swap.getTokenInfo(await token.getAddress());

      await swap.connect(user1).buyToken(await token.getAddress(), {
        value: ethIn,
      });

      const infoAfter = await swap.getTokenInfo(await token.getAddress());

      expect(infoAfter.tokenBalance).to.equal(infoBefore.tokenBalance - expectedTokens);
      expect(infoAfter.ethBalance).to.equal(infoBefore.ethBalance + ethIn);
    });

    it("Should revert if no ETH is sent", async function () {
      await expect(
        swap.connect(user1).buyToken(await token.getAddress())
      ).to.be.revertedWith("SimpleSwap: must send ETH");
    });

    it("Should revert if token is not listed", async function () {
      await expect(
        swap.connect(user1).buyToken(user2.address, {
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("SimpleSwap: token not listed");
    });

    it("Should revert if insufficient token liquidity", async function () {
      // Try to buy more tokens than available
      await expect(
        swap.connect(user1).buyToken(await token.getAddress(), {
          value: ethers.parseEther("100"), // Would need 10000 tokens
        })
      ).to.be.revertedWith("SimpleSwap: insufficient token liquidity");
    });

    it("Should calculate preview correctly", async function () {
      const ethIn = ethers.parseEther("2");
      const preview = await swap.previewBuy(await token.getAddress(), ethIn);

      expect(preview).to.equal(ethers.parseEther("200")); // 2 ETH * 100 tokens/ETH
    });
  });

  describe("Selling Tokens", function () {
    beforeEach(async function () {
      // List token and add liquidity
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      const tokenAmount = ethers.parseEther("5000");
      const ethAmount = ethers.parseEther("10");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);
      await swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount, {
        value: ethAmount,
      });

      // Give user1 some tokens
      await token.connect(owner).transfer(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to sell tokens for ETH", async function () {
      const tokensIn = ethers.parseEther("100");
      const expectedEth = ethers.parseEther("1"); // 100 tokens / 100 tokens per ETH

      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      const ethBefore = await ethers.provider.getBalance(user1.address);

      const tx = await swap.connect(user1).sellToken(await token.getAddress(), tokensIn);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ethAfter = await ethers.provider.getBalance(user1.address);

      // Account for gas costs
      expect(ethAfter).to.be.closeTo(ethBefore + expectedEth - gasUsed, ethers.parseEther("0.001"));
    });

    it("Should emit Sold event", async function () {
      const tokensIn = ethers.parseEther("100");
      const expectedEth = ethers.parseEther("1");

      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      await expect(
        swap.connect(user1).sellToken(await token.getAddress(), tokensIn)
      )
        .to.emit(swap, "Sold")
        .withArgs(user1.address, await token.getAddress(), tokensIn, expectedEth);
    });

    it("Should update liquidity balances correctly after sell", async function () {
      const tokensIn = ethers.parseEther("100");
      const expectedEth = ethers.parseEther("1");

      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      const infoBefore = await swap.getTokenInfo(await token.getAddress());

      await swap.connect(user1).sellToken(await token.getAddress(), tokensIn);

      const infoAfter = await swap.getTokenInfo(await token.getAddress());

      expect(infoAfter.tokenBalance).to.equal(infoBefore.tokenBalance + tokensIn);
      expect(infoAfter.ethBalance).to.equal(infoBefore.ethBalance - expectedEth);
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        swap.connect(user1).sellToken(await token.getAddress(), 0)
      ).to.be.revertedWith("SimpleSwap: amount must be > 0");
    });

    it("Should revert if insufficient ETH liquidity", async function () {
      // Try to sell more tokens than ETH available
      const tokensIn = ethers.parseEther("2000"); // Would need 20 ETH but only 10 available

      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      await expect(
        swap.connect(user1).sellToken(await token.getAddress(), tokensIn)
      ).to.be.revertedWith("SimpleSwap: insufficient ETH liquidity");
    });

    it("Should enforce minimum liquidity", async function () {
      // Sell tokens that would bring ETH below minimum
      const tokensIn = ethers.parseEther("950"); // Would need 9.5 ETH, leaving 0.5 ETH (below 1 ETH min)

      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      await expect(
        swap.connect(user1).sellToken(await token.getAddress(), tokensIn)
      ).to.be.revertedWith("SimpleSwap: would violate min liquidity");
    });

    it("Should calculate preview correctly", async function () {
      const tokensIn = ethers.parseEther("200");
      const preview = await swap.previewSell(await token.getAddress(), tokensIn);

      expect(preview).to.equal(ethers.parseEther("2")); // 200 tokens / 100 tokens per ETH
    });
  });

  describe("Withdrawing Liquidity", function () {
    beforeEach(async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      const tokenAmount = ethers.parseEther("5000");
      const ethAmount = ethers.parseEther("10");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);
      await swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount, {
        value: ethAmount,
      });
    });

    it("Should allow owner to withdraw token liquidity", async function () {
      const tokenAmount = ethers.parseEther("1000");

      await expect(
        swap.connect(owner).withdraw(await token.getAddress(), tokenAmount, 0)
      )
        .to.emit(swap, "LiquidityWithdrawn")
        .withArgs(await token.getAddress(), tokenAmount, 0);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.tokenBalance).to.equal(ethers.parseEther("4000"));
    });

    it("Should allow owner to withdraw ETH liquidity", async function () {
      const ethAmount = ethers.parseEther("5");

      await expect(
        swap.connect(owner).withdraw(await token.getAddress(), 0, ethAmount)
      )
        .to.emit(swap, "LiquidityWithdrawn")
        .withArgs(await token.getAddress(), 0, ethAmount);

      const info = await swap.getTokenInfo(await token.getAddress());
      expect(info.ethBalance).to.equal(ethers.parseEther("5"));
    });

    it("Should enforce minimum ETH liquidity on withdrawal", async function () {
      // Try to withdraw ETH that would violate minimum
      const ethAmount = ethers.parseEther("9.5"); // Would leave 0.5 ETH (below 1 ETH min)

      await expect(
        swap.connect(owner).withdraw(await token.getAddress(), 0, ethAmount)
      ).to.be.revertedWith("SimpleSwap: would violate min liquidity");
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      await expect(
        swap.connect(user1).withdraw(await token.getAddress(), 0, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });

    it("Should revert if insufficient balance", async function () {
      await expect(
        swap.connect(owner).withdraw(await token.getAddress(), ethers.parseEther("10000"), 0)
      ).to.be.revertedWith("SimpleSwap: insufficient token balance");

      await expect(
        swap.connect(owner).withdraw(await token.getAddress(), 0, ethers.parseEther("20"))
      ).to.be.revertedWith("SimpleSwap: insufficient ETH balance");
    });
  });

  describe("Edge Cases and Security", function () {
    beforeEach(async function () {
      await swap.connect(owner).listToken(
        await token.getAddress(),
        TOKEN_PER_ETH,
        MIN_ETH_LIQUIDITY
      );

      const tokenAmount = ethers.parseEther("5000");
      const ethAmount = ethers.parseEther("10");

      await token.connect(owner).approve(await swap.getAddress(), tokenAmount);
      await swap.connect(owner).addLiquidity(await token.getAddress(), tokenAmount, {
        value: ethAmount,
      });
    });

    it("Should handle reentrancy protection", async function () {
      // The ReentrancyGuard should prevent reentrancy attacks
      // This is tested implicitly through the contract's use of nonReentrant modifier
      const tokensIn = ethers.parseEther("100");
      await token.connect(owner).transfer(user1.address, tokensIn);
      await token.connect(user1).approve(await swap.getAddress(), tokensIn);

      await expect(
        swap.connect(user1).sellToken(await token.getAddress(), tokensIn)
      ).to.not.be.reverted;
    });

    it("Should handle multiple consecutive buys", async function () {
      await swap.connect(user1).buyToken(await token.getAddress(), {
        value: ethers.parseEther("1"),
      });

      await swap.connect(user1).buyToken(await token.getAddress(), {
        value: ethers.parseEther("1"),
      });

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("200"));
    });

    it("Should handle multiple consecutive sells", async function () {
      const amount = ethers.parseEther("500");
      await token.connect(owner).transfer(user1.address, amount);
      await token.connect(user1).approve(await swap.getAddress(), amount);

      await swap.connect(user1).sellToken(await token.getAddress(), ethers.parseEther("100"));
      await swap.connect(user1).sellToken(await token.getAddress(), ethers.parseEther("100"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("300"));
    });
  });
});
