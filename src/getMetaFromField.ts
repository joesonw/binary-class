import {
    Meta,
    Field,
    getMeta,
} from './fields';

export default function getMetaFromField(key: string | symbol, field: Field): Meta {
    const temp = {};
    field(temp, key);
    return getMeta(temp)[0];
}
