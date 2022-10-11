import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError } from "@utils/AppError";

import { groupsGetAll } from "./groupsGetAll";
import { GROUP_COLLECTION } from "@storage/storageConfig";

export async function groupCreate(newGroup: string) {
    try {
        const storageGroups = await groupsGetAll();

        const groupAlreadyExists = storageGroups.includes(newGroup);

        if (groupAlreadyExists) {
            throw new AppError('There is already exists a team with that name');
        }

        const storage = JSON.stringify([...storageGroups, newGroup])
        await AsyncStorage.setItem(GROUP_COLLECTION, storage);
    } catch (error) {
        throw error;
    }
}