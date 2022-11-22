pragma solidity ^0.8.13;

contract MerkleRoutine {
    enum Status {
        Recruiting,
        Ongoing,
        Cancellation,
        End
    }

    enum Term {
        EVERY_DAY,
        WEEKDAY,
        WEEKEND,
        ONCE,
        TWICE,
        THREE,
        FOUR,
        FIVE,
        SIX
    }

    address private immutable manager;

    constructor() {
        manager = msg.sender;
    }

    // klay => 토큰
    // 퍼블릭 => evm 기반 프라이빗 네트워크를 구축하면, 지갑도 따로 구현 가능 => 지갑 네트워크

    // 여기에 뭐가 들어가야될까?
    // tx hash or contract 안에서 생성
    struct Routine {
        uint256 fee;
        Status status;
        Term term;
        uint256 participates; //이걸 배열로 해야할까? 그냥 숫자로 해도 되지 않을까?
        uint256 amount;
    }

    uint256 private _totalBalance;
    mapping(uint256 => Routine) private _routines; // 전체 루틴
    mapping(address => uint256) private _balances; // 주최한 루틴 수
    mapping(uint256 => address) private _routineOwner; // 루틴의 주최자 지갑주소
    mapping(address => uint256[]) private _participateRoutines; // 참가한 루틴id
    mapping(uint256 => address[]) private _routineParticipants; // 참가자 목록

    function createRoutine(Term _term) public payable returns (uint256) {
        require(msg.value > 0, "FEE ERROR : You Have To Pay A Fee");
        Routine memory routine = Routine(
            msg.value,
            Status.Recruiting,
            _term,
            1,
            msg.value
        );
        _addRoutine(routine);
        return _totalBalance - 1;
    }

    function deleteRoutine(uint256 id) external payable {
        require(
            _routineOwner[id] == msg.sender,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        for (uint256 i = 0; i < _routines[id].participates - 1; i++) {
            payable(_routineParticipants[id][i]).transfer(_routines[id].fee);
        }
        _cancelRoutine(id);
    }

    function CancelParticipateRoutine(uint256 id) external payable {
        require(
            _routineOwner[id] == msg.sender,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        for (uint256 i = 0; i < _routines[id].participates - 1; i++) {
            payable(_routineParticipants[id][i]).transfer(_routines[id].fee);
        }
    }

    function sendTest(uint256 amount, address to) external payable {
        payable(to).transfer(amount);
    }

    function participateRoutine(uint256 id) public payable {
        require(
            msg.value == _routines[id].fee,
            "FEE ERROR : You Have To Pay A Fee"
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        _participateRoutine(id);
    }

    function notParticipateRoutine(uint256 id) public {}

    function _addRoutine(Routine memory _routine) private {
        _routineOwner[_totalBalance] = msg.sender;
        _balances[msg.sender]++;
        _routines[_totalBalance] = _routine;
        _totalBalance++;
    }

    function _cancelParticipateRoutine(uint256 id) private {}

    function _participateRoutine(uint256 id) private {
        _routines[id].amount += msg.value;
        _routines[id].participates++;
        _participateRoutines[msg.sender].push(id);
        _routineParticipants[id].push(msg.sender);
    }

    function _cancelRoutine(uint256 id) private {
        _routines[id].amount = 0;
        _routines[id].status = Status.Cancellation;
    }

    function routineTotalBalance() public view returns (uint256) {
        return _totalBalance;
    }

    function routineById(uint256 id) public view returns (Routine memory) {
        return _routines[id];
    }

    function ownerOfRoutine(uint256 id) public view returns (address) {
        return _routineOwner[id];
    }

    function participantOfRoutineByIndex(uint256 id, uint256 index)
        public
        view
        returns (address)
    {
        return _routineParticipants[id][index];
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
