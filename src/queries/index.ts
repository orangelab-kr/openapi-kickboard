export * from './helmet';
export * from './kickboard';

export const GlobalQueryPagnation = (
  field: string,
  take: number,
  skip: number
) => [
  {
    $facet: {
      metadata: [{ $count: 'total' }],
      [field]:
        take > 0
          ? [{ $skip: skip }, { $limit: take }]
          : [{ $match: { _id: { $eq: null } } }],
    },
  },
  {
    $project: {
      [field]: 1,
      total: { $arrayElemAt: ['$metadata.total', 0] },
    },
  },
];
