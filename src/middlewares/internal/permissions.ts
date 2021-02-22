import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  ACTION_SET = 'kickboard.action.set', // 킥보드 설정

  ACTION_START = 'kickboard.action.start', // 킥보드 시작
  ACTION_STOP = 'kickboard.action.stop', // 킥보드 종료

  ACTION_LOCK = 'kickboard.action.lock', // 킥보드 잠금
  ACTION_UNLOCK = 'kickboard.action.unlock', // 킥보드 잠금 해제

  ACTION_BATTERY_LOCK = 'kickboard.action.battery.lock', // 배터리 잠금
  ACTION_BATTERY_UNLOCK = 'kickboard.action.battery.unlock', // 배터리 잠금 해제

  ACTION_BUZZER_ON = 'kickboard.action.buzzer.on', // 부저 켜기
  ACTION_BUZZER_OFF = 'kickboard.action.buzzer.off', // 부저 끄기

  ACTION_BLUETOOTH_ON = 'kickboard.action.bluetooth.on', // 블루투스 켜기
  ACTION_BLUETOOTH_OFF = 'kickboard.action.bluetooth.off', // 블루투스 끄기

  ACTION_LIGHT_ON = 'kickboard.action.light.on', // 라이트 켜기
  ACTION_LIGHT_OFF = 'kickboard.action.light.off', // 라이트 끄기

  ACTION_ALARM_ON = 'kickboard.action.alarm.on', // 알람 켜기
  ACTION_ALARM_OFF = 'kickboard.action.alarm.off', // 알람 끄기

  ACTION_REBOOT = 'kickboard.action.reboot', // 킥보드 재부팅

  METHOD_LATEST = 'kickboard.method.latest', // 마지막 정보
  METHOD_REFRESH = 'kickboard.method.refresh', // 업데이트
  METHOD_REALTIME = 'kickboard.method.realtime', // 실시간
  METHOD_TIMELINE = 'kickboard.method.timeline', // 타임라인

  SEARCH_LIST = 'kickboard.search.list', // 목록 검색
  SEARCH_NEAR = 'kickboard.search.near', // 주변 검색

  LOOKUP = 'kickboard.lookup', // 킥보드 기본적인 정보(ID, CODE, LOST, COLLECT)
  LOOKUP_STATUS = 'kickboard.lookup.status', // 킥보드 상태(BATTERY, LOCATION)
  LOOKUP_INFO = 'kickboard.lookup.info', // 킥보드 정보(Version, Mac Address, ICC)
  LOOKUP_CONFIG = 'kickboard.lookup.config', // 킥보드 설정(MQTT, LTE)
  LOOKUP_BATTERY = 'kickboard.lookup.battery', // 킥보드 전압(Voltage)
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs.includes(permission)) {
      throw new InternalError(
        `${permission} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
