export enum CategoryErrorMessages {
  findOne = 'No such category',
  findAll = 'No such categories',
  createOne = 'Image is required',
  removeOne = 'Category has dependent transactions',
}

export enum CategorySuccessMessages {
  findOne = 'Category was found',
  findAll = 'Categories were found',
  removeOne = 'Category was removed',
  updateOne = 'Category was updated',
  createOne = 'Category was created',
}