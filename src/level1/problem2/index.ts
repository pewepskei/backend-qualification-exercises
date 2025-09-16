import { randomBytes } from "crypto";

export class ObjectId {
  private data: Buffer;

  constructor(type: number, timestamp: number) {
    const buf = Buffer.alloc(14); // 14 bytes: 1 + 6 + 4 + 3

    // 1 byte: type
    buf.writeUInt8(type & 0xff, 0);

    // 6 bytes: timestamp
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigUInt64BE(BigInt(timestamp));
    tsBuf.copy(buf, 1, 2); // copy last 6 bytes

    const scope = ((ObjectId as any)._scope ??= (() => ({
      rnd: randomBytes(4),                       // 4-byte random
      cnt: randomBytes(3).readUIntBE(0, 3),      // 3-byte counter
    }))());

    // 4 bytes: random
    scope.rnd.copy(buf, 7);

    // 3 bytes: counter
    scope.cnt = (scope.cnt + 1) & 0xffffff;
    buf.writeUIntBE(scope.cnt, 11, 3);

    this.data = buf;
  }

  static generate(type: number = 0): ObjectId {
    const objId = new ObjectId(type, Date.now());
    // console.log("ObjectID generated is", objId.toString());
    return objId;
  }

  toString(encoding: "hex" | "base64" = "hex"): string {
    return this.data.toString(encoding);
  }
}

