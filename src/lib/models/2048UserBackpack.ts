import {Document, Model, model, models, Schema} from 'mongoose';
import { connectToMongoDb2048 } from '../mongodb/client';

// 2048，用户背包信息(如入场券)
export interface IUserBackpack extends Document {
    uid: string;
    propId: string;
    propName: string;
    creatTime: string;
    num: number;
}

const userBackpackSchema = new Schema<IUserBackpack>({
    creatTime: {type: String, required: true},
    propName: {type: String, required: true},
    propId: {type: String, required: true},
    uid: {type: String, required: true},
    num: {type: Number, required: true},
});


const connection = connectToMongoDb2048();
const UserBackpackModel: Model<IUserBackpack> = models.UserBackpack || connection.model<IUserBackpack>("userBackpack", userBackpackSchema, 'userBackpack');
export default UserBackpackModel;

