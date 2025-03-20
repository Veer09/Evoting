'use strict';

const { ClientIdentity } = require('fabric-shim');
const { Contract } = require('fabric-contract-api');


class VotingContract extends Contract {
    async initLedger(ctx) {
        console.log('Chaincode initialized');
    }

    async registerUser(ctx, userId) {
        const userExists = await ctx.stub.getState(userId);
        if (userExists && userExists.length > 0) {
            throw new Error(`User ${userId} already exists`);
        }

        const user = { };
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

        const candidate = { votes: 0 , electionId: electionId};
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));

        return `Candidate added successfully`;
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
        if(user[electionId] && user[electionId].hasVoted) {
            throw new Error(`User ${userId} has already voted in this election`);
        }
        const candidate = JSON.parse(candidateAsBytes.toString());
        candidate.votes += 1;
        user[electionId] = { hasVoted: true, candidateId: candidateId };

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
    
    async addElection(ctx, electionId) {
        const electionExists = await ctx.stub.getState(electionId);
        if (electionExists && electionExists.length > 0) {
            throw new Error(`Election ${electionId} already exists`);
        }

        const election = { isAudited: false };
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        return `Election added successfully`;
    }

    async auditElection(ctx, electionId) {
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }

        const election = JSON.parse(electionAsBytes.toString());
        if (election.isAudited) {
            throw new Error(`Election ${electionId} has already been audited`);
        }

        const iterator = await ctx.stub.getStateByPartialCompositeKey('candidate', [electionId]);
        let result = await iterator.next();
        while (!result.done) {
            const candidateId = result.value.key.split(':')[1];
            const candidateAsBytes = await ctx.stub.getState(candidateId);
            const candidate = JSON.parse(candidateAsBytes.toString());
            const iterator2 = await ctx.stub.getStateByPartialCompositeKey('user', [electionId]);
            let result2 = await iterator2.next();
            while (!result2.done) {
                let count = 0;
                const userId = result2.value.key.split(':')[1];
                const userAsBytes = await ctx.stub.getState(userId);
                const user = JSON.parse(userAsBytes.toString());
                if (user[electionId].candidateId === candidateId) {
                    count += 1;
                }
                result2 = await iterator2.next();
            }
            if(candidate.votes != count){
                throw new Error(`Failed audit for candidate ${candidateId}`);
            }
            result = await iterator.next();
        }

        election.isAudited = true;
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));

        return `Votes calculated for election ${electionId}`;
    }
}

module.exports = VotingContract;