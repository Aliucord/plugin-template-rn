import { getByProps } from 'aliucord/metro';

export function getToken() {
    return getByProps("getToken").getToken();
}