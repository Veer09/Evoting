"use strict";

const { ClientIdentity } = require("fabric-shim");
const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");
class VotingContract extends Contract {
  async initLedger(ctx) {
    console.log("Chaincode initialized");
  }

  async addCandidate(ctx, candidateId, electionId) {
    const cid = new ClientIdentity(ctx.stub);
    const role = cid.getAttributeValue("role");

    if (role !== "electionCommittee") {
      throw new Error("Only election committee members can add candidates");
    }

    // Create a composite key that includes the electionId and candidateId.
    const candidateKey = ctx.stub.createCompositeKey("Candidate", [
      electionId,
      candidateId,
    ]);

    const candidateExists = await ctx.stub.getState(candidateKey);
    if (candidateExists && candidateExists.length > 0) {
      throw new Error(
        `Candidate ${candidateId} already exists for election ${electionId}`
      );
    }

    const candidate = { votes: 0, electionId: electionId };
    await ctx.stub.putState(
      candidateKey,
      Buffer.from(JSON.stringify(candidate))
    );

    return `Candidate added successfully`;
  }

  async getTotalVoters(ctx, electionId) {
    const electionAsBytes = await ctx.stub.getState(electionId);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election ${electionId} does not exist`);
    }
    const election = JSON.parse(electionAsBytes.toString());
    if (!election.isAudited) {
      throw new Error(`Election ${electionId} has not been audited yet`);
    }
    return election.totalVotes;
  }

  async getResultsByArea(ctx, electionId, candidates) {
    candidates = JSON.parse(candidates);
    let results = {};
    console.log(candidates);

    for (let i = 0; i < candidates.length; i++) {
      const candidateId = candidates[i];
      const candidateAsBytes = await this.queryCandidate(
        ctx,
        electionId,
        candidateId
      );
      if (!candidateAsBytes || candidateAsBytes.length === 0) {
        throw new Error(`Candidate ${candidateId} does not exist`);
      }
      const candidate = JSON.parse(candidateAsBytes.toString());
      results[candidateId] = candidate.votes;
    }
    return results;
  }

  // async castVote(ctx, userId, candidateId, electionId) {
  //   const userAsBytes = await ctx.stub.getState(userId);
  //   if (!userAsBytes || userAsBytes.length === 0) {
  //     throw new Error(`User ${userId} does not exist`);
  //   }

  //   const candidateAsBytes = await ctx.stub.getState(candidateId);
  //   if (!candidateAsBytes || candidateAsBytes.length === 0) {
  //     throw new Error(`Candidate ${candidateId} does not exist`);
  //   }

  //   const user = JSON.parse(userAsBytes.toString());
  //   if (user[electionId] && user[electionId].hasVoted) {
  //     throw new Error(`User ${userId} has already voted in this election`);
  //   }
  //   const candidate = JSON.parse(candidateAsBytes.toString());
  //   candidate.votes += 1;
  //   user[electionId] = { hasVoted: true };

  //   await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
  //   await ctx.stub.putState(
  //     candidateId,
  //     Buffer.from(JSON.stringify(candidate))
  //   );

  //   return `User ${userId} voted for ${candidate.name}`;
  // }

  async castVote(ctx, electionId, candidateId) {
    // Retrieve the client identity from the transaction context.
    const cid = new ClientIdentity(ctx.stub);

    // Verify that the invoker has the 'voter' role attribute.
    // This requires that your certificate issuance process embeds a role attribute.
    const role = cid.getAttributeValue("role");
    if (role !== "voter") {
      throw new Error("This identity is not authorized to cast a vote.");
    }

    // Continue with the rest of the logic (hashing the ID and casting vote)...
    const uniqueId = cid.getID();
    const hash = crypto
      .createHash("sha256")
      .update(uniqueId + electionId)
      .digest("hex");
    const voteKey = "VOTE_" + hash;

    const existingVote = await ctx.stub.getState(voteKey);
    if (existingVote && existingVote.length > 0) {
      throw new Error(
        `Vote has already been cast in election ${electionId} by this voter.`
      );
    }

    const vote = {
      electionId: electionId,
      candidateId: candidateId,
      timestamp: ctx.stub.getTxTimestamp().seconds.low,
    };

    const candidateAsBytes = await this.queryCandidate(
      ctx,
      electionId,
      candidateId
    );
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate ${candidateId} does not exist`);
    }
    const candidate = JSON.parse(candidateAsBytes.toString());
    candidate.votes += 1;

    const candidateKey = ctx.stub.createCompositeKey("Candidate", [
      electionId,
      candidateId,
    ]);
    await ctx.stub.putState(voteKey, Buffer.from(JSON.stringify(vote)));
    await ctx.stub.putState(
      candidateKey,
      Buffer.from(JSON.stringify(candidate))
    );
    return JSON.stringify({
      status: "Vote cast successfully",
      vote: vote,
    });
  }

  async queryCandidate(ctx, electionId, candidateId) {
    // Create the composite key using the object type "Candidate" and attributes
    const candidateKey = ctx.stub.createCompositeKey("Candidate", [
      electionId,
      candidateId,
    ]);

    // Retrieve the candidate record from the ledger using the composite key
    const candidateAsBytes = await ctx.stub.getState(candidateKey);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(
        `Candidate ${candidateId} for election ${electionId} does not exist`
      );
    }

    // Return the candidate record as a string
    return candidateAsBytes.toString();
  }

  async auditElection(ctx, electionId) {
    // Define the start and end keys for the vote records.
    // We assume that vote keys are prefixed with "VOTE_" so we can scan all keys that fall within that prefix.
    const startKey = "VOTE_";
    const endKey = "VOTE_z"; // Assumes no vote key will have a character higher than 'z' after the prefix

    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    const votes = [];

    // Iterate over the results from the ledger
    let result = await iterator.next();
    while (!result.done) {
      const recordValue = result.value.value.toString("utf8");
      if (recordValue) {
        try {
          const voteRecord = JSON.parse(recordValue);
          // Only consider votes that match the electionId
          if (voteRecord.electionId === electionId) {
            votes.push(voteRecord);
          }
        } catch (err) {
          // Handle possible JSON parsing errors
          console.error(`Error parsing vote record: ${err}`);
        }
      }
      result = await iterator.next();
    }
    await iterator.close();
    // return JSON.stringify(votes);

    // Tally votes by candidate
    const tally = votes.reduce((acc, vote) => {
      if (!acc[vote.candidateId]) {
        acc[vote.candidateId] = 0;
      }
      acc[vote.candidateId]++;
      return acc;
    }, {});

    const candidates = await this.queryCandidatesByElection(ctx, electionId);
    const candidatesList = JSON.parse(candidates);
    const candidateIds = candidatesList.map((c) => c.candidateId);
    // return JSON.stringify({ tally, candidatesList, candidates });
    for (let i = 0; i < candidateIds.length; i++) {
      const candidateId = candidateIds[i];
      if (!tally[candidateId]) {
        tally[candidateId] = 0;
      }
      if (tally[candidateId] !== candidatesList[i].votes) {
        return JSON.stringify({
          electionId: electionId,
          error: "Audit Unsuccesfull",
        });
      }
    }

    const electionAsBytes = await ctx.stub.getState(electionId);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election ${electionId} does not exist`);
    }
    const election = JSON.parse(electionAsBytes.toString());
    if (election.isAudited) {
      throw new Error(`Election ${electionId} has already been audited`);
    }
    election.isAudited = true;
    election.totalVotes = votes.length;
    await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));

    // Return the audit results
    return JSON.stringify({
      electionId: electionId,
      totalVotes: votes.length,
      tally: tally,
    });
  }

  async addElection(ctx, electionId) {
    const cid = new ClientIdentity(ctx.stub);
    const role = cid.getAttributeValue("role");

    if (role !== "electionCommittee") {
      throw new Error("Only election committee members can add elections");
    }

    // Create a composite key that includes the electionId.

    const electionExists = await ctx.stub.getState(electionId);
    if (electionExists && electionExists.length > 0) {
      throw new Error(`Election ${electionId} already exists`);
    }

    const election = { isAudited: false };
    await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));

    return `Election added successfully`;
  }

  async queryCandidatesByElection(ctx, electionId) {
    // This retrieves all state entries that have a composite key where the first component is the electionId.
    const iterator = await ctx.stub.getStateByPartialCompositeKey("Candidate", [
      electionId,
    ]);
    const candidates = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        // return res.value.value.toString();
        let candidateRecord = JSON.parse(res.value.value.toString("utf8"));
        // Optionally, get the components of the composite key
        const compositeKeyParts = ctx.stub.splitCompositeKey(res.value.key);
        candidateRecord.electionId = compositeKeyParts.attributes[0];
        candidateRecord.candidateId = compositeKeyParts.attributes[1];
        console.log(candidateRecord);
        candidates.push(candidateRecord);
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(candidates);
  }
}

module.exports = VotingContract;
