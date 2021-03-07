import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  METHOD_LATEST, // 마지막 정보
  METHOD_REFRESH, // 업데이트
  METHOD_REALTIME, // 실시간
  METHOD_TIMELINE, // 타임라인

  LOOKUP_DETAIL, // 킥보드 기본적인 정보(ID, CODE, LOST, COLLECT)
  LOOKUP_STATUS, // 킥보드 상태(BATTERY, LOCATION)
  LOOKUP_INFO, // 킥보드 정보(Version, Mac Address, ICC)
  LOOKUP_CONFIG, // 킥보드 설정(MQTT, LTE)
  LOOKUP_BATTERY, // 킥보드 전압(Voltage)

  SEARCH_LIST, // 목록 검색
  SEARCH_NEAR, // 주변 검색

  ACTION_SET, // 킥보드 설정

  ACTION_START, // 킥보드 시작
  ACTION_STOP, // 킥보드 종료

  ACTION_LOCK, // 킥보드 잠금
  ACTION_UNLOCK, // 킥보드 잠금 해제

  ACTION_BATTERY_LOCK, // 배터리 잠금
  ACTION_BATTERY_UNLOCK, // 배터리 잠금 해제

  ACTION_BUZZER_ON, // 부저 켜기
  ACTION_BUZZER_OFF, // 부저 끄기

  ACTION_BLUETOOTH_ON, // 블루투스 켜기
  ACTION_BLUETOOTH_OFF, // 블루투스 끄기

  ACTION_LIGHT_ON, // 라이트 켜기
  ACTION_LIGHT_OFF, // 라이트 끄기

  ACTION_ALARM_ON, // 알람 켜기
  ACTION_ALARM_OFF, // 알람 끄기

  ACTION_REBOOT, // 킥보드 재부팅
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw new InternalError(
        `${PERMISSION[permission]} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
