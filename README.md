# Smart Contract

## Todo

### SEND

1. [x] createRoutine (Routine)
       루틴 생성 : 챌린지 주최자가 챌린지를 생성하고 온체인에 등록합니다.
2. [x] deleteRoutine (id)
       루틴 취소 : 주최자가 챌린지를 취소합니다. 챌린지가 시작되기 전에만 실행가능하고 주최자만
       실행가능합니다. 모인 참가비는 참가자들에게 다시 분배됩니다.
3. [x] participateRoutine (id), value로 fee 지불
       루틴 참가 : 참여자가 루틴에 참여합니다. 이 때 주최자가 정한 참가비가 지불되어야합니다. 지불된
       참가비는 CA에 보관되다가 챌린지가 무산되거나 완료되면 분배됩니다.
4. [x] CancelParticipateRoutine (id)
       루틴 참가 취소 : 챌린지 참가를 취소합니다. 참가비는 다시 돌려받습니다.
5. [x] startRoutine (id)
       루틴 시작 : 더이상 참가 불가 챌린지 시작 일정에 맞춰 챌린지가 시작됩니다. BackEnd에서
       실행시켜줘야하며 챌린지가 시작되면 더이상의 참가는 불가능합니다.
6. [ ] endRoutine (id)
       루틴 종료 : 루틴이 종료되고 성공한 참가자들에게 상금을 분배합니다.
7. [ ] failRoutine (address)
       루틴 실패

### CALL

1. [ ] Routines () returns (id[])
       루틴 : 현재 진행중인, 진행 전인 루틴을 모두 반환합니다.
2. [ ] participatedRoutine (address) returns (id)
       참가한 루틴 : 해당 계정의 참가자가 참가한 루틴을 모두 반환합니다.
3. [ ] memberNumOfRoutine (id) returns (uint)
       참가한 멤버 수 : 해당 루틴에 참가중인 참가자들의 수를 반환합니다.
4. [ ] memberOfRoutine (id) returns (address[])
       참가한 멤버 : 현재 해당 루틴에 참가하고 있는 주소들을 반환합니다.
5. [ ] feeOfRoutine (id) returns (uint256)
       총 상금 : 해당 루틴에 누적된 상금을 반환합니다.
6. [ ] statusRoutine (id) returns (bool)
       루틴 상태 : 해당 루틴이 진행중인지 진행중이 아닌지 반환합니다.
