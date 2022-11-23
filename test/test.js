const MerkleRoutine = artifacts.require("MerkleRoutine");

const expectedFee = 1000000000000000000;

function equlExceptGas(Smaller, Larger){
    return Larger-Smaller < 210000000000001;
}

function encodeBNtoNumber(bn){
    return Number(bn.words[0])
}

contract("MerkleRoutine", (accounts) => {

    it("1. Deploy", async () => {
        console.log("1. Deploy Contract");
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const balance = await merkleRoutineInstance.routineTotalBalance.call().valueOf();

        assert.equal(balance, 0, "Routine Num Is Not 0");
    });

    it("2-1. Create", async () => {

        console.log("2. Simulation1 ( Create, Participate, Delete ) ");
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;
        const expectedTerm=1;

        await merkleRoutineInstance.createRoutine(expectedTerm, { from: accounts[0], value:expectedFee })
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedStatus=0;
        const expectedParticipates=1;
        const expectedAmount=expectedFee;
        const owner = await merkleRoutineInstance.ownerOfRoutine.call(routineId);

        assert.equal(
            routine.fee,
            expectedFee,
            "Routine's Fee is Wrong"
        );
        assert.equal(
            routine.status,
            expectedStatus,
            "Routine's Status is Wrong"
        );
        assert.equal(
            routine.term,
            expectedTerm,
            "Routine's Term is Wrong"
        );
        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            owner,
            accounts[0],
            "Owner's Address is Wrong"
        );
    });
    it("2-2. Participate One User", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;
        
        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[1], value:expectedFee })
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedParticipates=2;
        const expectedAmount=expectedFee*2;
        var participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,0);

        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            participant,
            accounts[1],
            "Participant1's Address is Wrong"
        );
    });

    it("2-3. Participate Two User", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;

        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[2], value:expectedFee })
  
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedParticipates=3;
        const expectedAmount=expectedFee*3;
        const participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,1);
        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            participant,
            accounts[2],
            "Participant2's Address is Wrong"
        );
    });

    it("2-4. Cancel(Delete) Routine By Owner", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;

        const expectBalanceOfOwner = await web3.eth.getBalance(accounts[0]);
        const expectBalanceOfFirst = Number(await web3.eth.getBalance(accounts[1]))+expectedFee;
        const expectBalanceOfSecond = Number(await web3.eth.getBalance(accounts[2]))+expectedFee;
        await merkleRoutineInstance.deleteRoutine(routineId, { from: accounts[0] })
        const afterBalanceOfOwner = await web3.eth.getBalance(accounts[0]);
        const afterBalanceOfFirst = await web3.eth.getBalance(accounts[1]);
        const afterBalanceOfSecond = await web3.eth.getBalance(accounts[2]);
        const routineStatus = await merkleRoutineInstance.routineStatusById.call(routineId);

        assert.equal(
            equlExceptGas(afterBalanceOfOwner, expectBalanceOfOwner),
            true,
            "Owner's Balance is Wrong"
        );
        assert.equal(
            afterBalanceOfFirst,
            expectBalanceOfFirst,
            "GiveBack Fee To Account[1] Faile"
        );
        assert.equal(
            afterBalanceOfSecond,
            expectBalanceOfSecond,
            "GiveBack Fee To Account[2] Faile"
        );
        assert.equal(
            routineStatus,
            2,
            "GiveBack Fee To Account[2] Faile"
        );
    })


    it("3-1. Create", async () => {

        console.log("3. Simulation2 ( Create, Participate, CancelParticipation, StartRoutine, FailRoutine, EndRoutine ) ");
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;
        const expectedTerm=1;

        await merkleRoutineInstance.createRoutine(expectedTerm, { from: accounts[0], value:expectedFee })
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedStatus=0;
        const expectedParticipates=1;
        const expectedAmount=expectedFee;
        const owner = await merkleRoutineInstance.ownerOfRoutine.call(routineId);

        assert.equal(
            routine.fee,
            expectedFee,
            "Routine's Fee is Wrong"
        );
        assert.equal(
            routine.status,
            expectedStatus,
            "Routine's Status is Wrong"
        );
        assert.equal(
            routine.term,
            expectedTerm,
            "Routine's Term is Wrong"
        );
        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            owner,
            accounts[0],
            "Owner's Address is Wrong"
        );
    });
    it("3-2. Participate One User", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;
        
        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[1], value:expectedFee })
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedParticipates=2;
        const expectedAmount=expectedFee*2;
        var participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,0);

        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            participant,
            accounts[1],
            "Participant1's Address is Wrong"
        );
    });

    it("3-3. Participate Two User", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;

        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[2], value:expectedFee })
  
        const routine = await merkleRoutineInstance.routineById.call(routineId);
        const expectedParticipates=3;
        const expectedAmount=expectedFee*3;
        const participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,1);
        assert.equal(
            routine.participates,
            expectedParticipates,
            "Routine's Participates is Wrong"
        );
        assert.equal(
            routine.amount,
            expectedAmount,
            "Routine's Amount is Wrong"
        );
        assert.equal(
            participant,
            accounts[2],
            "Participant2's Address is Wrong"
        );
    });

    it("3-4. Cancel Participation One User", async () => {

        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;

        const expectParticipates = encodeBNtoNumber(await merkleRoutineInstance.participantNumById.call(routineId))-1;
        const expectBalance = Number(await web3.eth.getBalance(accounts[1]))+expectedFee;
        const expectRoutinNumOfUser = Number((await merkleRoutineInstance.routinNumByAddress.call(accounts[1])).words[0])-1;

        await merkleRoutineInstance.CancelParticipateRoutine(routineId, { from: accounts[1] });

        const participates = encodeBNtoNumber(await merkleRoutineInstance.participantNumById.call(routineId));
        const balance = Number(await web3.eth.getBalance(accounts[1]));
        const routinNumOfUser = Number((await merkleRoutineInstance.routinNumByAddress.call(accounts[1])).words[0]);

        assert.equal(
            participates,
            expectParticipates,
            "Participatnt's Num is Wrong"
        );
        assert.equal(
            equlExceptGas(expectBalance,balance),
            true,
            "Participant Don't Be Gave Back Fee"
        );
        assert.equal(
            routinNumOfUser,
            expectRoutinNumOfUser,
            "Routine Number Was Not Decrease"
        );
    }); 

    it("3-5. Start Routine", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;
        await merkleRoutineInstance.startRoutine(routineId, { from: accounts[0] });

        const routineStatus = await merkleRoutineInstance.routineStatusById.call(routineId);
        
        assert.equal(
            routineStatus,
            1,
            "Routine's Status Is Not Ongoing"
        );
    });

    it("3-6. Fail Routine", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 1;
        await merkleRoutineInstance.startRoutine(routineId, { from: accounts[0] });

        const routineStatus = await merkleRoutineInstance.routineStatusById.call(routineId);
        
        assert.equal(
            routineStatus,
            1,
            "Routine's Status Is Not Ongoing"
        );
    });

});
