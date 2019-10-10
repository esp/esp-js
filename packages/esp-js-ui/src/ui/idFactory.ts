import * as uuid from 'uuid';

export class IdFactory {
    public static createId(token = null) {
        return token ?`id-${token}-${uuid.v4()}` : `id-${uuid.v4()}`;
    }
}