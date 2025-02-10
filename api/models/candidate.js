class Candidate{
    constructor(candidateId, name, party, phoneNumber, area, city, email){
        this.candidateId = candidateId;
        this.name = name;
        this.party = party;
        this.phoneNumber = phoneNumber;
        this.area = area;
        this.city = city;
        this.email = email;
    }
}

module.exports = Candidate;