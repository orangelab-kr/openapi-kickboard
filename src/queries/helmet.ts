import { Types } from 'mongoose';
import { HelmetStatus } from '..';

export const HelmetQueryOnlyOnce = () => [{ $limit: 1 }];
export const HelmetQueryLookupKickboard = () => [
  {
    $lookup: {
      from: 'kickboards',
      localField: '_id',
      foreignField: 'helmetId',
      as: 'kickboard',
    },
  },
  {
    $unwind: {
      path: '$kickboard',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'status',
      localField: 'kickboard.status',
      foreignField: '_id',
      as: 'kickboard.status',
    },
  },
  {
    $unwind: {
      path: '$kickboard.status',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $set: {
      kickboard: {
        $cond: {
          if: { $eq: ['$kickboard', {}] },
          then: null,
          else: '$kickboard',
        },
      },
    },
  },
];

export const HelmetQueryByMacAddress = (macAddress: string) => [
  { $match: { macAddress } },
];

export const HelmetQueryByHelmetId = (helmetId: string) => [
  { $match: { _id: new Types.ObjectId(helmetId) } },
];

export const HelmetQuerySearch = (search: string) => {
  const $regex = new RegExp(search);
  return [{ $or: [{ _id: { $regex } }, { macAddress: { $regex } }] }];
};

export const HelmetQueryStatus = (status: HelmetStatus[]) => [
  { $match: { status: { $in: status } } },
];

export const HelmetQuerySort = (
  orderByField: string,
  orderBySort: 'asc' | 'desc'
) => [
  {
    $sort: {
      [orderByField === 'helmetId' ? '_id' : orderByField]:
        orderBySort === 'asc' ? 1 : -1,
    },
  },
];
