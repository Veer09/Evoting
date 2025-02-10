'use strict';

const { ClientIdentity } = require('fabric-shim');
const { Contract } = require('fabric-contract-api');


class VotingContract extends Contract {
    async initLedger(ctx) {
        console.log('Chaincode initialized');
    }

    async registerUser(ctx, userId, name) {
        const userExists = await ctx.stub.getState(userId);
        if (userExists && userExists.length > 0) {
            throw new Error(`User ${userId} already exists`);
        }

        const user = { name, hasVoted: false };
        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return `User ${name} registered successfully`;
    }

    async addCandidate(ctx, candidateId, name) {
        const cid = new ClientIdentity(ctx.stub);
        const role = cid.getAttributeValue("role");

        if (role !== "electionCommittee") {
            throw new Error("Only election committee members can add candidates");
        }

        const candidateExists = await ctx.stub.getState(candidateId);
        if (candidateExists && candidateExists.length > 0) {
            throw new Error(`Candidate ${candidateId} already exists`);
        }

        const candidate = { name, votes: 0 };
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));

        return `Candidate ${name} added successfully`;
    }

    async castVote(ctx, userId, candidateId) {
        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const candidateAsBytes = await ctx.stub.getState(candidateId);
        if (!candidateAsBytes || candidateAsBytes.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        if (user.hasVoted) {
            throw new Error(`User ${userId} has already voted`);
        }

        const candidate = JSON.parse(candidateAsBytes.toString());
        candidate.votes += 1;
        user.hasVoted = true;

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));

        return `User ${userId} voted for ${candidate.name}`;
    }

    async queryCandidate(ctx, candidateId) {
        const candidateAsBytes = await ctx.stub.getState(candidateId);
        if (!candidateAsBytes || candidateAsBytes.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }

        return candidateAsBytes.toString();
    }
}

module.exports = VotingContract;