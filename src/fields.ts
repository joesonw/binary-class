/* eslint-disable @typescript-eslint/no-explicit-any */
import { ByteOrder }from './consts';

declare const Reflect: any;

const METAKEY = Symbol('meta');

export interface Meta { // eslint-disable-line @typescript-eslint/interface-name-prefix
    key: string | symbol;
    type: string;
    float?: {
        endian: ByteOrder;
    };
    double?: {
        endian: ByteOrder;
    };
    uint8?: {
    };
    uint16?: {
        endian: ByteOrder;
    };
    uint32?: {
        endian: ByteOrder;
    };
    uint64?: {
        endian: ByteOrder;
    };
    int8?: {
    };
    int16?: {
        endian: ByteOrder;
    };
    int32?: {
        endian: ByteOrder;
    };
    int64?: {
        endian: ByteOrder;
    };
    embed?: {
        type: any;
        metas: Meta[];
    };
    dynamic?: {
        func: (instance: any) => Field;
    };
    string?: {
        length: number;
        encoding: BufferEncoding;
    };
    array?: {
        length: number;
        field: PropertyDecorator,
    };
    calculated?: {
        decode: (target: any) => any;
        encode: (value: number, target: any) => void;
    };
    fixed?: {
        value: any;
    };
}

export function addMeta(target: object, newMeta: Meta): void {
    const meta = Reflect.getMetadata(METAKEY, target) || [];
    meta.push(newMeta);
    Reflect.defineMetadata(METAKEY, meta, target);
}

export function getMeta(target: object): Meta[] {
    return Reflect.getMetadata(METAKEY, target) || [];
}

export type Field = PropertyDecorator;

export function Calculated<T>(decode: (target: T) => any, encode: (value: number, target: T) => void): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target as any, { key, type: 'calculated', calculated: { decode, encode } });
    };
}

export function Fixed<T = any>(value: any): PropertyDecorator {
    return (target: T, key: string | symbol): void => {
        addMeta(target as any, { key, type: 'fixed', fixed: { value } });
    };
}

export function Embed(type?: any): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        type = type || Reflect.getMetadata('design:type', target, key);
        const metas = getMeta(type.prototype);
        addMeta(target as any, { key, type: 'embed', embed: { type, metas } });
    };
}

export function Dynamic<T = any>(func: (instance: T) => Field): PropertyDecorator {
    return (target: T, key: string | symbol): void => {
        addMeta(target as any, { key, type: 'dynamic', dynamic: { func } });
    };
}

export function Array(length: number, field: PropertyDecorator): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'array', array: { length, field } });
    };
}

export function String(length: number, encoding: BufferEncoding = 'utf8'): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'string', string: { length, encoding } });
    };
}

export function UInt8(): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'uint8', uint8: { } });
    };
}

export function UInt16(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'uint16', uint16: { endian } });
    };
}

export function UInt32(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'uint32', uint32: { endian } });
    };
}

export function UInt64(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'uint64', uint64: { endian } });
    };
}

export function Int8(): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'int8', int8: { } });
    };
}

export function Int16(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'int16', int16: { endian } });
    };
}

export function Int32(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'int32', int32: { endian } });
    };
}

export function Int64(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'int64', int64: { endian } });
    };
}

export function Float(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'float', float: { endian } });
    };
}

export function Double(endian: ByteOrder = ByteOrder.LITTLE_ENDING): PropertyDecorator {
    return (target: object, key: string | symbol): void => {
        addMeta(target, { key, type: 'double', double: { endian } });
    };
}
