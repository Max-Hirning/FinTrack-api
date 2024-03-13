import {HydratedDocument} from 'mongoose';
import {Image} from '../schemas/image.schema';

export type IImage = HydratedDocument<Image>;