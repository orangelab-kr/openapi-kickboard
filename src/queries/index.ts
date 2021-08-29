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
      [field]: [{ $limit: take }, { $skip: skip }],
    },
  },
  {
    $project: {
      [field]: 1,
      total: { $arrayElemAt: ['$metadata.total', 0] },
    },
  },
];
