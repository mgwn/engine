/*
 Copyright (c) 2017-2020 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @packageDocumentation
 * @module material
 */

import { Type } from '../../gfx';
import { Color, Mat3, Mat4, Vec2, Vec3, Vec4, Quat, IVec2Like, IVec3Like, IVec4Like, IMat3Like, IMat4Like } from '../../math';

const typeMask    = 0xfc000000; //  6 bits => 64 types
const bindingMask = 0x03f00000; //  6 bits => 64 bindings
const countMask   = 0x000ff000; //  8 bits => 256 vectors
const offsetMask  = 0x00000fff; // 12 bits => 1024 vectors

export const genHandle = (binding: number, type: Type, count: number, offset = 0): number => ((type << 26) & typeMask)
    | ((binding << 20) & bindingMask) | (count << 12) & countMask | (offset & offsetMask);
export const getTypeFromHandle = (handle: number): number => (handle & typeMask) >>> 26;
export const getBindingFromHandle = (handle: number): number => (handle & bindingMask) >>> 20;
export const getCountFromHandle = (handle: number): number => (handle & countMask) >>> 12;
export const getOffsetFromHandle = (handle: number): number => (handle & offsetMask);
export const customizeType = (handle: number, type: Type): number => (handle & ~typeMask) | ((type << 26) & typeMask);

/**
 * @en Vector type uniforms
 * @zh 向量类型 uniform
 */
export type MaterialProperty = number | Vec2 | Vec3 | Vec4 | Color | Mat3 | Mat4 | Quat;

export const type2reader = {
    [Type.UNKNOWN]: (a: Float32Array, v: number, idx = 0): void => console.warn('illegal uniform handle'),
    [Type.INT]: (a: Float32Array, v: number, idx = 0): number => a[idx],
    [Type.INT2]: (a: Float32Array, v: IVec2Like, idx = 0): IVec2Like => Vec2.fromArray(v, a, idx),
    [Type.INT3]: (a: Float32Array, v: IVec3Like, idx = 0): IVec3Like => Vec3.fromArray(v, a, idx),
    [Type.INT4]: (a: Float32Array, v: IVec4Like, idx = 0): IVec4Like => Vec4.fromArray(v, a, idx),
    [Type.FLOAT]: (a: Float32Array, v: number, idx = 0): number => a[idx],
    [Type.FLOAT2]: (a: Float32Array, v: IVec2Like, idx = 0): IVec2Like => Vec2.fromArray(v, a, idx),
    [Type.FLOAT3]: (a: Float32Array, v: IVec3Like, idx = 0): IVec3Like => Vec3.fromArray(v, a, idx),
    [Type.FLOAT4]: (a: Float32Array, v: IVec4Like, idx = 0): IVec4Like => Vec4.fromArray(v, a, idx),
    [Type.MAT3]: (a: Float32Array, v: IMat3Like, idx = 0): IMat3Like => Mat3.fromArray(v, a, idx),
    [Type.MAT4]: (a: Float32Array, v: IMat4Like, idx = 0): IMat4Like => Mat4.fromArray(v, a, idx),
};

export const type2writer = {
    [Type.UNKNOWN]: (a: Float32Array, v: number, idx = 0): void => console.warn('illegal uniform handle'),
    [Type.INT]: (a: Float32Array, v: number, idx = 0): number => a[idx] = v,
    [Type.INT2]: (a: Float32Array, v: IVec2Like, idx = 0): Float32Array => Vec2.toArray(a, v, idx),
    [Type.INT3]: (a: Float32Array, v: IVec3Like, idx = 0): Float32Array => Vec3.toArray(a, v, idx),
    [Type.INT4]: (a: Float32Array, v: IVec4Like, idx = 0): Float32Array => Vec4.toArray(a, v, idx),
    [Type.FLOAT]: (a: Float32Array, v: number, idx = 0): number => a[idx] = v,
    [Type.FLOAT2]: (a: Float32Array, v: IVec2Like, idx = 0): Float32Array => Vec2.toArray(a, v, idx),
    [Type.FLOAT3]: (a: Float32Array, v: IVec3Like, idx = 0): Float32Array => Vec3.toArray(a, v, idx),
    [Type.FLOAT4]: (a: Float32Array, v: IVec4Like, idx = 0): Float32Array => Vec4.toArray(a, v, idx),
    [Type.MAT3]: (a: Float32Array, v: IMat3Like, idx = 0): Float32Array => Mat3.toArray(a, v, idx),
    [Type.MAT4]: (a: Float32Array, v: IMat4Like, idx = 0): Float32Array => Mat4.toArray(a, v, idx),
};

const defaultValues = [
    Object.freeze([0]),
    Object.freeze([0, 0]),
    Object.freeze([0, 0, 0, 0]),
    Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
];

/**
 * @en Gets the default values for the given type of uniform
 * @zh 根据指定的 Uniform 类型来获取默认值
 * @param type The type of the uniform
 */
export function getDefaultFromType (type: Type): readonly number[] | string {
    switch (type) {
    case Type.BOOL:
    case Type.INT:
    case Type.UINT:
    case Type.FLOAT:
        return defaultValues[0];
    case Type.BOOL2:
    case Type.INT2:
    case Type.UINT2:
    case Type.FLOAT2:
        return defaultValues[1];
    case Type.BOOL4:
    case Type.INT4:
    case Type.UINT4:
    case Type.FLOAT4:
        return defaultValues[2];
    case Type.MAT4:
        return defaultValues[3];
    case Type.SAMPLER2D:
        return 'default-texture';
    case Type.SAMPLER_CUBE:
        return 'default-cube-texture';
    default:
    }
    return defaultValues[0];
}

/**
 * @en Combination of preprocess macros
 * @zh 预处理宏组合
 */
export type MacroRecord = Record<string, number | boolean | string>;

/**
 * @en Override the preprocess macros
 * @zh 覆写预处理宏
 * @param target Target preprocess macros to be overridden
 * @param source Preprocess macros used for override
 */
export function overrideMacros (target: MacroRecord, source: MacroRecord): boolean {
    const entries = Object.entries(source);
    let isDifferent = false;
    for (let i = 0; i < entries.length; i++) {
        if (target[entries[i][0]] !== entries[i][1]) {
            target[entries[i][0]] = entries[i][1];
            isDifferent = true;
        }
    }
    return isDifferent;
}
