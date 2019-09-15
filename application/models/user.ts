import {BaseModel} from "./baseModel";

export interface UserInterface {
    id: number;
    name: string;
}

export class User extends BaseModel {
    public static tableName: string = "users";
}
