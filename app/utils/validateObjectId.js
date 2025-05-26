import { isValidObjectId } from 'mongoose';

export const validateObjectId = (value) => {
    if (!isValidObjectId(value)) throw new Error('must be a valid ObjectId');
    return value;
};
