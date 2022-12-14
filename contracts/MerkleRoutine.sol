//SPDX l
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
        uint256 totalParticipates;
        uint256 amount;
    }

    uint256 private _totalBalance;
    mapping(uint256 => Routine) private _routines; // 전체 루틴
    mapping(address => uint256) private _balances; // 주최한 루틴 수
    mapping(uint256 => address) private _routineOwner; // 루틴의 주최자 지갑주소
    mapping(address => uint256[]) private _participateRoutines; // 참가한 루틴id
    mapping(uint256 => address[]) private _routineParticipants; // 참가자 목록
    mapping(address => uint256) private _participateRoutinesLen; //
    mapping(uint256 => mapping(address => uint256)) private _refrees; // 각 검증자들이 몇 번 검증했는지
    mapping(uint256 => uint256) private _totalRefrees; // 검증 수
    address[] private _refreesNum; // 레프리의 수

    event CreateRoutine(uint256 id);

    /**
     * @dev Owner Make Routine, and Recruiting Participants
     * @param _term Certificate Term
     */
    function createRoutine(Term _term) public payable {
        require(msg.value > 0, "FEE ERROR : You Have To Pay A Fee");
        Routine memory routine = Routine(
            msg.value,
            Status.Recruiting,
            _term,
            0,
            0,
            0
        );
        _addRoutine(routine);
        _participateRoutine(_totalBalance - 1);
        emit CreateRoutine(_totalBalance - 1);
    }

    /**
     * @dev Owner Can Cancel Recruiting Routine. But Owner can not be gave back fee
     * @param id Routine Id
     */
    function deleteRoutine(uint256 id) external payable {
        require(
            _routineOwner[id] == msg.sender,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        for (uint256 i = 0; i < _routines[id].participates; i++) {
            payable(_routineParticipants[id][i]).transfer(_routines[id].fee);
        }
        _cancelRoutine(id);
    }

    /**
     * @dev Participant Can Cancel Participation Routine
     * @param id Routine Id
     */
    function cancelParticipateRoutine(uint256 id) external payable {
        require(
            _isExistRoutine(id, msg.sender),
            "EXIST ERROR : Routine Is Not Exist."
        );
        require(
            _isExistParticipant(id, msg.sender),
            "EXIST ERROR : Routine Is Not Exist."
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        payable(msg.sender).transfer(_routines[id].fee);

        _cancelParticipateRoutine(id);
    }

    /**
     * @dev Participant Can Cancel Participation Routine
     * @param id Routine Id
     */
    function participateRoutine(uint256 id) public payable {
        require(
            msg.value == _routines[id].fee,
            "FEE ERROR : You Have To Pay A Fee"
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : The Routine Is Not Recruiting."
        );
        require(
            _routineOwner[id] != msg.sender,
            "PERMISSION ERROR : You Are Owner Of The Routine"
        );
        _participateRoutine(id);
    }

    function startRoutine(uint256 id) public payable {
        require(
            manager == msg.sender,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        require(
            _routines[id].status == Status.Recruiting,
            "STATUS ERROR : Status is Not Ongoing."
        );
        _routines[id].status = Status.Ongoing;
    }

    function failRoutine(address addr, uint256 id) public {
        require(
            msg.sender == manager,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        require(
            _routines[id].status == Status.Ongoing,
            "STATUS ERROR : The Routine Is Not Ongoing"
        );
        _deletePariticipant(id, addr);
    }

    function verifyCertificate(
        uint256[] memory ids,
        address[] memory addrs,
        uint256[] memory nums
    ) public {
        require(_checkAllIds(ids), "STATUS ERROR : The Routine Is Not Ongoing");
        require(
            !_checkAllAddr(ids, addrs),
            "EXIST ERROR : The Address Is Exist In The Routine"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            _addRefrees(ids[i], addrs[i], nums[i]);
        }
    }

    function _checkAllIds(uint256[] memory ids) private view returns (bool) {
        for (uint256 i = 0; i < ids.length; i++) {
            if (_routines[ids[i]].status != Status.Ongoing) {
                return false;
            }
        }
        return true;
    }

    function _checkAllAddr(uint256[] memory ids, address[] memory addrs)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (!_isExistParticipant(ids[i], addrs[i])) {
                return false;
            }
        }
        return true;
    }

    function endRoutine(uint256 id) public {
        require(
            msg.sender == manager,
            "PERMISSION ERROR : You Don't Have Permission."
        );
        uint256 OwnersAwards = _caculateOwnerAwards(id);
        uint256 participantsAwards = _calculateParticipantsAwards(
            id,
            OwnersAwards
        );

        for (uint256 i = 0; i < _routines[id].participates; i++) {
            if (_routineParticipants[id][i] != _routineOwner[id]) {
                payable(_routineParticipants[id][i]).transfer(
                    _routines[id].fee + participantsAwards
                );
                continue;
            }
            payable(_routineOwner[id]).transfer(
                _routines[id].fee + OwnersAwards
            );
        }

        for (uint256 i = 0; i < _refreesNum.length; i++) {
            payable(_refreesNum[i]).transfer(
                _calculateRefreesAwards(id, _refreesNum[i])
            );
        }

        _routines[id].status = Status.End;
    }

    function _caculateOwnerAwards(uint256 id) public view returns (uint256) {
        uint256 A = _routines[id].amount;
        uint256 N = _routines[id].totalParticipates;
        uint256 S = _routines[id].participates;
        uint256 head = ((N + 1) * (S - 1));
        uint256 body = (N * (S + 1));
        uint256 surplus = A - (S * _routines[id].fee);

        uint256 OwnersAwards = (4 * surplus * (body - head)) / (5 * body);
        return OwnersAwards;
    }

    function _calculateParticipantsAwards(uint256 id, uint256 OwnersAwards)
        public
        view
        returns (uint256)
    {
        uint256 surplus = _routines[id].amount -
            (_routines[id].participates * _routines[id].fee);
        uint256 amount = (surplus * 4) / 5;
        uint256 participantsAwards = (amount - OwnersAwards) /
            (_routines[id].participates - 1);
        return participantsAwards;
    }

    function _calculateRefreesAwards(uint256 id, address addr)
        public
        view
        returns (uint256)
    {
        uint256 surplus = _routines[id].amount -
            (_routines[id].participates * _routines[id].fee);
        return (surplus * _refrees[id][addr]) / (5 * _totalRefrees[id]);
    }

    /**
     * @dev Make Routine
     * @param _routine Routine
     */
    function _addRoutine(Routine memory _routine) private {
        _routineOwner[_totalBalance] = msg.sender;
        _balances[msg.sender]++;
        _routines[_totalBalance] = _routine;
        _totalBalance++;
    }

    function _deletePariticipant(uint256 id, address addr) private {
        _popParticipateRoutine(id, addr);
        _popRoutineParticipant(id, addr);
        _routines[id].participates--;
    }

    function _cancelParticipateRoutine(uint256 id) private {
        _routines[id].amount -= _routines[id].fee;
        _routines[id].totalParticipates--;
        _deletePariticipant(id, msg.sender);
    }

    /**
     * @dev Check that Routine Id Exist in _participateRoutines[addr]
     * @param id Routine Id
     * @param addr Participant's Address
     */
    function _isExistRoutine(uint256 id, address addr)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _participateRoutinesLen[addr]; i++) {
            if (_participateRoutines[addr][i] == id) {
                return true;
            }
        }
        return false;
    }

    function _isExistParticipant(uint256 id, address addr)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _routines[id].participates; i++) {
            if (_routineParticipants[id][i] == addr) {
                return true;
            }
        }
        return false;
    }

    function _indexOfRoutineFromAddress(uint256 id, address addr)
        private
        view
        returns (uint256)
    {
        uint256 index = 0;
        require(_isExistRoutine(id, addr), "Routine Is Not Exist.");
        for (uint256 i = 0; i < _participateRoutinesLen[addr]; i++) {
            if (_participateRoutines[addr][i] == id) {
                index = i;
            }
        }
        return index;
    }

    function _indexOfParticipantFromId(uint256 id, address addr)
        private
        view
        returns (uint256)
    {
        uint256 index = 0;
        require(_isExistParticipant(id, addr), "Participant Is Not Exist.");
        for (uint256 i = 0; i < _routines[id].participates; i++) {
            if (_routineParticipants[id][i] == addr) {
                index = i;
            }
        }
        return index;
    }

    function _popParticipateRoutine(uint256 id, address addr) private {
        uint256 index = _indexOfRoutineFromAddress(id, addr);

        _participateRoutines[addr][index] = _participateRoutines[addr][
            _participateRoutinesLen[addr] - 1
        ];
        _participateRoutinesLen[addr]--;
        delete _participateRoutines[addr][_participateRoutinesLen[addr] - 1];
    }

    function _popRoutineParticipant(uint256 id, address addr) private {
        uint256 index = _indexOfParticipantFromId(id, addr);

        _routineParticipants[id][index] = _routineParticipants[id][
            _routines[id].participates - 1
        ];
        delete _routineParticipants[id][_routines[id].participates - 1];
    }

    function _participateRoutine(uint256 id) private {
        _routines[id].amount += msg.value;
        _routines[id].participates++;
        _routines[id].totalParticipates++;
        _participateRoutinesLen[msg.sender]++;

        _participateRoutines[msg.sender].push(id);
        _routineParticipants[id].push(msg.sender);
    }

    function _cancelRoutine(uint256 id) private {
        _routines[id].amount = 0;
        _routines[id].status = Status.Cancellation;
    }

    function _addRefrees(
        uint256 id,
        address addr,
        uint256 num
    ) private {
        if (_refrees[id][addr] == 0) {
            _refreesNum.push(addr);
        }
        _refrees[id][addr] += num;
        _totalRefrees[id] += num;
    }

    function routineTotalBalance() public view returns (uint256) {
        return _totalBalance;
    }

    function routineById(uint256 id) public view returns (Routine memory) {
        return _routines[id];
    }

    function routinNumByAddress(address user) public view returns (uint256) {
        return _participateRoutinesLen[user];
    }

    function routineStatusById(uint256 id) public view returns (Status) {
        return _routines[id].status;
    }

    function routineIdByAddressAndIndex(address addr, uint256 index)
        public
        view
        returns (uint256)
    {
        return _participateRoutines[addr][index];
    }

    function participantNumById(uint256 id) public view returns (uint256) {
        return _routines[id].participates;
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
