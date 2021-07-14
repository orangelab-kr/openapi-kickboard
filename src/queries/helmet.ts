import { Types } from 'mongoose';

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
];

export const HelmetQueryByMacAddress = (macAddress: string) => [
  { $match: { macAddress } },
];

export const HelmetQueryByHelmetId = (helmetId: string) => [
  { $match: { _id: Types.ObjectId(helmetId) } },
];
