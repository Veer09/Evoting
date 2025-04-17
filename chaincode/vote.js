"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class VotingContract extends Contract {
  /**
   * Casts a vote for a candidate in a given election.
   * This method anonymizes the voter by generating a non-reversible hash
   * using the voter's unique identity and the electionId.
   *
   * @param {Context} ctx The transaction context
   * @param {String} electionId The election identifier for the vote
   * @param {String} candidateId The candidate's identifier
   * @returns {String} A JSON string indicating success and vote details
   */
  async castVote(ctx, electionId, candidateId) {
    // Retrieve the client identity from the transaction context
    const cid = ctx.clientIdentity;

    // Use the client's unique identity string (could be the enrollment certificate's subject)
    // Note: getID() returns a long string representing the certificate.
    const uniqueId = cid.getID();

    // Create an anonymous token by hashing the unique identity with the electionId.
    // This ensures that even if the hash is seen on the ledger it can't be reversed to reveal the identity.
    const hash = crypto
      .createHash("sha256")
      .update(uniqueId + electionId)
      .digest("hex");

    // Define a composite key for the vote using the hash token
    const voteKey = "VOTE_" + hash;

    // Check if the voter already cast a vote for this election (to enforce one vote per voter)
    const existingVote = await ctx.stub.getState(voteKey);
    if (existingVote && existingVote.length > 0) {
      throw new Error(
        `Vote has already been cast in election ${electionId} by this voter.`
      );
    }

    // Create the vote object
    const vote = {
      electionId: electionId,
      candidateId: candidateId,
      timestamp: new Date().toISOString(),
    };

    // Save the vote on the ledger with the anonymous vote key.
    // This way, the underlying voter identity is not directly stored.
    await ctx.stub.putState(voteKey, Buffer.from(JSON.stringify(vote)));

    // Return a success message
    return JSON.stringify({
      status: "Vote cast successfully",
      vote: vote,
    });
  }
}

module.exports = VotingContract;
