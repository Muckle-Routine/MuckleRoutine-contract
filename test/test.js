const MerkleRoutine = artifacts.require("MerkleRoutine");

contract("MerkleRoutine", (accounts) => {
    it("1. Deploy", async () => {
        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const balance = await merkleRoutineInstance.routineTotalBalance.call().valueOf();

        assert.equal(balance, 0, "Routine Num Is Not 0");
    });


    it("2. Create, Participate, And Cancel", async () => {

        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;
        const expectedTerm=1;
        const expectedFee = 1000000000000000000;

        await merkleRoutineInstance.createRoutine(expectedTerm, { from: accounts[0], value:expectedFee })
        var routine = await merkleRoutineInstance.routineById.call(routineId);
        var expectedStatus=0;
        var expectedParticipates=1;
        var expectedAmount=expectedFee;
        var owner = await merkleRoutineInstance.ownerOfRoutine.call(routineId);

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
        console.log("\t2-1.[Success] Create Routine");

        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[1], value:expectedFee })
        routine = await merkleRoutineInstance.routineById.call(routineId);
        expectedParticipates=2;
        expectedAmount=expectedFee*2;
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
        console.log("\t2-2.[Success] Participate Routine1");


        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[2], value:expectedFee })
        routine = await merkleRoutineInstance.routineById.call(routineId);
        expectedParticipates=3;
        expectedAmount=expectedFee*3;
        participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,1);
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
        console.log("\t2-3.[Success] Participate Routine2");

        const expectBalanceOfOwner = await web3.eth.getBalance(accounts[0]);
        const expectBalanceOfFirst = Number(await web3.eth.getBalance(accounts[1]))+expectedFee;
        const expectBalanceOfSecond = Number(await web3.eth.getBalance(accounts[2]))+expectedFee;
        await merkleRoutineInstance.deleteRoutine(routineId, { from: accounts[0] })
        const afterBalanceOfOwner = await web3.eth.getBalance(accounts[0]);
        const afterBalanceOfFirst = await web3.eth.getBalance(accounts[1]);
        const afterBalanceOfSecond = await web3.eth.getBalance(accounts[2]);
        

        assert.equal(
            (expectBalanceOfOwner-afterBalanceOfOwner)<210000000000001,
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
        console.log("\t2-4.[Success] Cancel Routine");
    })

    it("3. Start", async () => {

        const merkleRoutineInstance = await MerkleRoutine.deployed();
        const routineId = 0;
        const expectedTerm=1;
        const expectedFee = 1000000000000000000;

        await merkleRoutineInstance.createRoutine(expectedTerm, { from: accounts[0], value:expectedFee })
        var routine = await merkleRoutineInstance.routineById.call(routineId);
        var expectedStatus=0;
        var expectedParticipates=1;
        var expectedAmount=expectedFee;
        var owner = await merkleRoutineInstance.ownerOfRoutine.call(routineId);

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
        console.log("\t3-1.[Success] Create Routine");

        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[1], value:expectedFee })
        routine = await merkleRoutineInstance.routineById.call(routineId);
        expectedParticipates=2;
        expectedAmount=expectedFee*2;
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
        console.log("\t3-2.[Success] Participate Routine1");


        await merkleRoutineInstance.participateRoutine(routineId, { from: accounts[2], value:expectedFee })
        routine = await merkleRoutineInstance.routineById.call(routineId);
        expectedParticipates=3;
        expectedAmount=expectedFee*3;
        participant = await merkleRoutineInstance.participantOfRoutineByIndex.call(routineId,1);
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
        console.log("\t3-3.[Success] Participate Routine2");

    })
});
