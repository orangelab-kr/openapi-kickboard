/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { KickboardMode } from '../models';

export const KickboardQueryMode = (mode: KickboardMode) => [
  { $match: { mode } },
];

export const KickboardQueryKickboardCode = (kickboardCode: string) => [
  { $match: { kickboardCode: kickboardCode.toUpperCase() } },
];

export const KickboardQueryLookupStatus = () => [
  {
    $lookup: {
      from: 'status',
      localField: 'status',
      foreignField: '_id',
      as: 'status',
    },
  },
  { $unwind: '$status' },
];

export const KickboardQueryRadiusLocation = (
  low: { lat: number; lng: number },
  high: { lat: number; lng: number }
) => [
  {
    $match: {
      'status.gps.latitude': { $gte: low.lat, $lte: high.lat },
      'status.gps.longitude': { $gte: low.lng, $lte: high.lng },
    },
  },
];

export const KickboardQueryToShort = () => [
  {
    $project: {
      _id: 0,
      kickboardCode: 1,
      lost: 1,
      'status.power.scooter.battery': 1,
      'status.gps.latitude': 1,
      'status.gps.longitude': 1,
    },
  },
];