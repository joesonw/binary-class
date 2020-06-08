/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Meta,
    getMeta,
} from './fields';
import {
    ByteOrder,
} from './consts';

const TEMPORARY: symbol = Symbol('temporary');

export function decodeItem(target: any, buffer: Buffer, meta: Meta, offset: number): { result: any, length: number } {
    switch (meta.type) {
    case 'string':
        return {
            result :buffer.slice(offset, offset + meta.string.length).toString(meta.string.encoding),
            length: meta.string.length,
        };
    case 'uint8':
        return { result: buffer.readUInt8(offset), length: 1 };

    case 'uint16':
        if (meta.uint16.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readUInt16LE(offset), length: 2 };
        }
        return { result: buffer.readUInt16BE(offset), length: 2 };
    case 'uint32':
        if (meta.uint32.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readUInt32LE(offset), length: 4 };
        }
        return { result: buffer.readUInt32BE(offset), length: 4 };
    case 'uint64':
        if (meta.uint64.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readBigUInt64LE(offset), length: 8 };
        }
        return { result: buffer.readBigUInt64BE(offset), length: 8 };
    case 'int8':
        return { result: buffer.readInt8(offset), length: 1 };
    case 'int16':
        if (meta.int16.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readInt16LE(offset), length: 2 };
        }
        return { result: buffer.readInt16BE(offset), length: 2 };

    case 'int32':
        if (meta.int32.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readInt32LE(offset), length: 4 };
        }
        return { result: buffer.readInt32BE(offset), length: 4 };
    case 'int64':
        if (meta.int64.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readBigInt64LE(offset), length: 8 };
        }
        return { result: buffer.readBigInt64BE(offset), length: 8 };
    case 'float':
        if (meta.float.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readFloatLE(offset), length: 4 };
        }
        return { result: buffer.readFloatBE(offset), length: 4 };
    case 'double':
        if (meta.double.endian === ByteOrder.LITTLE_ENDING) {
            return { result: buffer.readDoubleLE(offset), length: 8 };
        }
        return { result: buffer.readDoubleBE(offset), length: 8 };
    case 'dynamic': {
        const field = meta.dynamic.func(target);
        if (!field) return undefined;
        const dynamic = {};
        field(dynamic, TEMPORARY);
        const dynamicMeta = getMeta(dynamic)[0];
        return decodeItem(target, buffer, dynamicMeta, offset);
    }
    case 'array': {
        const array = {};
        meta.array.field(array, TEMPORARY);
        const arrayMeta = getMeta(array)[0];
        let length = 0;
        const result : any[] = [];
        for (let i = 0; i < meta.array.length; i++) {
            const res = decodeItem(target, buffer, arrayMeta, offset + length);
            result.push(res.result);
            length += res.length;
        }
        return { result, length: length };
    }
    case 'embed': {
        const metas = meta.embed.metas;
        const type = meta.embed.type;
        const result = new type();
        let length = offset;
        for (const meta of metas) {
            const res = decodeItem(result, buffer, meta, length);
            length = res.length;
            result[meta.key] = res.result;
        }
        return { result, length };
    }
    }
}

export default function decode<T>(buffer: Buffer, target: T): T {
    const allMeta = getMeta(target as any);
    let offset = 0;
    for (const meta of allMeta) {
        const res = decodeItem(target, buffer, meta, offset);
        if (!res) continue;
        offset += res.length;
        target[meta.key] = res.result;
    }
    return target;
}
