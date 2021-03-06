/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Meta,
    getMeta,
} from './fields';
import {
    ByteOrder,
} from './consts';
import getMetaFromField from './getMetaFromField';

export function encodeItem(target: any, value: any, meta: Meta): Buffer {
    switch (meta.type) {
    case 'string': {
        const b = Buffer.alloc(meta.string.length);
        b.write((value || '').slice(0, meta.string.length), meta.string.encoding);
        return b;
    }
    case 'uint8': {
        const b = Buffer.alloc(1);
        b.writeUInt8(value);
        return b;
    }
    case 'uint16': {
        const b = Buffer.alloc(2);
        if (meta.uint16.endian === ByteOrder.LITTLE_ENDING) {
            b.writeUInt16LE(value);
        } else {
            b.writeUInt16BE(value);
        }
        return b;
    }
    case 'uint32': {
        const b = Buffer.alloc(4);
        if (meta.uint32.endian === ByteOrder.LITTLE_ENDING) {
            b.writeUInt32LE(value);
        } else {
            b.writeUInt32BE(value);
        }
        return b;
    }
    case 'uint64': {
        const b = Buffer.alloc(8);
        if (meta.uint64.endian === ByteOrder.LITTLE_ENDING) {
            b.writeBigUInt64LE(value);
        } else {
            b.writeBigUInt64BE(value);
        }
        return b;
    }
    case 'int8': {
        const b = Buffer.alloc(1);
        b.writeInt8(value);
        return b;
    }
    case 'int16': {
        const b = Buffer.alloc(2);
        if (meta.int16.endian === ByteOrder.LITTLE_ENDING) {
            b.writeInt16LE(value);
        } else {
            b.writeInt16BE(value);
        }
        return b;
    }
    case 'int32': {
        const b = Buffer.alloc(4);
        if (meta.int32.endian === ByteOrder.LITTLE_ENDING) {
            b.writeInt32LE(value);
        } else {
            b.writeInt32BE(value);
        }
        return b;
    }
    case 'int64': {
        const b = Buffer.alloc(8);
        if (meta.int64.endian === ByteOrder.LITTLE_ENDING) {
            b.writeBigInt64LE(value);
        } else {
            b.writeBigInt64BE(value);
        }
        return b;
    }
    case 'float': {
        const b = Buffer.alloc(4);
        if (meta.float.endian === ByteOrder.LITTLE_ENDING) {
            b.writeFloatLE(value);
        } else {
            b.writeFloatBE(value);
        }
        return b;
    }
    case 'double': {
        const b = Buffer.alloc(8);
        if (meta.double.endian === ByteOrder.LITTLE_ENDING) {
            b.writeDoubleLE(value);
        } else {
            b.writeDoubleBE(value);
        }
        return b;
    }
    case 'dynamic': {
        const field = meta.dynamic.func(target);
        if (!field) return undefined;
        return encodeItem(target, value, getMetaFromField(meta.key, field));
    }
    case 'array': {
        const arrayMeta = getMetaFromField(meta.key, meta.array.field);
        const buffers: Buffer[] = [];
        for (let i = 0; i < meta.array.length; i++) {
            const buf = encodeItem(target, value[i], arrayMeta);
            buffers.push(buf);
        }

        const buffer = Buffer.alloc(buffers.reduce((sum: number, b: Buffer) => sum + b.byteLength, 0));
        let offset = 0;
        for (const b of buffers) {
            if (!b) continue;
            b.copy(buffer, offset);
            offset += b.byteLength;
        }
        return buffer;
    }
    case 'embed': {
        return encodeWithMetas(value, meta.embed.metas); // eslint-disable-line @typescript-eslint/no-use-before-define
    }
    case 'calculated': {
        meta.calculated.encode(value, target);
        return undefined;
    }
    case 'fixed': {
        if (value !== meta.fixed.value) throw new Error(`Should be fixed value: ${meta.fixed.value}`);
        return undefined;
    }
    case 'peekCheck': {
        const field = meta.peekCheck.encode(target);
        if (!field) return undefined;
        return encodeItem(target, value, getMetaFromField(meta.key, field));
    }
    }
}

function encodeWithMetas(target: any, metas: Meta[]): Buffer { // eslint-disable-line @typescript-eslint/no-explicit-any
    const buffers: Buffer[] = [];
    for (const meta of metas) {
        const buffer = encodeItem(target, target[meta.key], meta);
        if (!buffer) continue;
        buffers.push(buffer);
    }
    const buffer = Buffer.alloc(buffers.reduce((sum: number, b: Buffer) => sum + b.byteLength, 0));
    let offset = 0;
    for (const b of buffers) {
        b.copy(buffer, offset);
        offset += b.byteLength;
    }
    return buffer;
}

export default function encode(target: any): Buffer { // eslint-disable-line @typescript-eslint/no-explicit-any
    const allMeta = getMeta(target);
    return encodeWithMetas(target, allMeta);
}
