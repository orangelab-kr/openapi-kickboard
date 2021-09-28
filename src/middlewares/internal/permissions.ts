import { Callback, InternalError, OPCODE, Wrapper } from '../..';

export enum PERMISSION {
  KICKBOARD_METHOD_LATEST, // 마지막 정보
  KICKBOARD_METHOD_REFRESH, // 업데이트
  KICKBOARD_METHOD_REALTIME, // 실시간
  KICKBOARD_METHOD_TIMELINE, // 타임라인

  KICKBOARD_LOOKUP_DETAIL, // 킥보드 기본적인 정보(ID, CODE, LOST, COLLECT)
  KICKBOARD_LOOKUP_STATUS, // 킥보드 상태(BATTERY, LOCATION)
  KICKBOARD_LOOKUP_INFO, // 킥보드 정보(Version, Mac Address, ICC)
  KICKBOARD_LOOKUP_CONFIG, // 킥보드 설정(MQTT, LTE)
  KICKBOARD_LOOKUP_BATTERY, // 킥보드 전압(Voltage)

  KICKBOARD_SEARCH_LIST, // 목록 검색
  KICKBOARD_SEARCH_NEAR, // 주변 검색

  KICKBOARD_ACTION_SET, // 킥보드 설정

  KICKBOARD_ACTION_START, // 킥보드 시작
  KICKBOARD_ACTION_STOP, // 킥보드 종료

  KICKBOARD_ACTION_LOCK, // 킥보드 잠금
  KICKBOARD_ACTION_UNLOCK, // 킥보드 잠금 해제

  KICKBOARD_ACTION_BATTERY_LOCK, // 배터리 잠금
  KICKBOARD_ACTION_BATTERY_UNLOCK, // 배터리 잠금 해제

  KICKBOARD_ACTION_BUZZER_ON, // 부저 켜기
  KICKBOARD_ACTION_BUZZER_OFF, // 부저 끄기

  KICKBOARD_ACTION_BLUETOOTH_ON, // 블루투스 켜기
  KICKBOARD_ACTION_BLUETOOTH_OFF, // 블루투스 끄기

  KICKBOARD_ACTION_LIGHT_ON, // 라이트 켜기
  KICKBOARD_ACTION_LIGHT_OFF, // 라이트 끄기

  KICKBOARD_ACTION_ALARM_ON, // 알람 켜기
  KICKBOARD_ACTION_ALARM_OFF, // 알람 끄기

  KICKBOARD_ACTION_REBOOT, // 킥보드 재부팅

  KICKBOARD_ACTION_DELETE, // 킥보드 삭제
}

export function InternalPermissionMiddleware(permission: PERMISSION): Callback {
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
