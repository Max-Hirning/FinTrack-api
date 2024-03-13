export enum TransactionErrorMessages {
  findOne = 'No such transaction',
  findMany = 'No such transactions',
}

export enum TransactionSuccessMessages {
  findOne = 'Transaction was found',
  findMany = 'Transactions were found',
  removeOne = 'Transaction was removed',
  updateOne = 'Transaction was updated',
  createOne = 'Transaction was created',
  removeMany = 'Transactions were removed',
}