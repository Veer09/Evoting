"use strict";

const { ClientIdentity } = require("fabric-shim");
const { Contract } = require("fabric-contract-api");

class VotingContract extends Contract {
  async initLedger(ctx) {
    console.log("Chaincode initialized");
  }

  async registerUser(ctx, userId) {
    const userExists = await ctx.stub.getState(userId);
    if (userExists && userExists.length > 0) {
      throw new Error(`User ${userId} already exists`);
    }

    const user = {};
    await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
    return `User  registered successfully`;
  }

  async addCandidate(ctx, candidateId, electionId) {
    const cid = new ClientIdentity(ctx.stub);
    const role = cid.getAttributeValue("role");

    if (role !== "electionCommittee") {
      throw new Error("Only election committee members can add candidates");
    }

    const candidateExists = await ctx.stub.getState(candidateId);
    if (candidateExists && candidateExists.length > 0) {
      throw new Error(`Candidate ${candidateId} already exists`);
    }

    const candidate = { votes: 0, electionId: electionId };
    await ctx.stub.putState(
      candidateId,
      Buffer.from(JSON.stringify(candidate))
    );

    return `Candidate added successfully`;
  }

  async getTotalVoters(ctx, electionId) {
    let count = 0;
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const userData = result.value.value.toString();
      try {
        const user = JSON.parse(userData);
        if (user[electionId] && user[electionId].hasVoted === true) {
          count++;
        }
      } catch (error) {
        console.error(
          `Error parsing state for key ${result.value.key}: ${error}`
        );
      }
      result = await iterator.next();
    }
    await iterator.close();
    return count;
  }

  async getResultsByArea(ctx, electionId, candidates) {
    let results = {};
    for (let i = 0; i < candidates.length; i++) {
      const candidateId = candidates[i];
      const candidateAsBytes = await ctx.stub.getState(candidateId);
      if (!candidateAsBytes || candidateAsBytes.length === 0) {
        throw new Error(`Candidate ${candidateId} does not exist`);
      }
      const candidate = JSON.parse(candidateAsBytes.toString());
      results[candidateId] = candidate.votes;
    }
    return results;
  }

  async castVote(ctx, userId, candidateId, electionId) {
    const userAsBytes = await ctx.stub.getState(userId);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${userId} does not exist`);
    }

    const candidateAsBytes = await ctx.stub.getState(candidateId);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate ${candidateId} does not exist`);
    }

    const user = JSON.parse(userAsBytes.toString());
    if (user[electionId] && user[electionId].hasVoted) {
      throw new Error(`User ${userId} has already voted in this election`);
    }
    const candidate = JSON.parse(candidateAsBytes.toString());
    candidate.votes += 1;
    user[electionId] = { hasVoted: true };

    await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
    await ctx.stub.putState(
      candidateId,
      Buffer.from(JSON.stringify(candidate))
    );

    return `User ${userId} voted for ${candidate.name}`;
  }

  async queryCandidate(ctx, candidateId) {
    const candidateAsBytes = await ctx.stub.getState(candidateId);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate ${candidateId} does not exist`);
    }

    return candidateAsBytes.toString();
  }

  async addElection(ctx, electionId) {
    const electionExists = await ctx.stub.getState(electionId);
    if (electionExists && electionExists.length > 0) {
      throw new Error(`Election ${electionId} already exists`);
    }

    const election = { isAudited: false };
    await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    return `Election added successfully`;
  }
}

module.exports = VotingContract;
