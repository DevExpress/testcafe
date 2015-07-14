
// Double-byte codec. This scheme is widespread and consists of 2 tables:
//  1. Single-byte: mostly just ASCII, but can be more complex.
//  2. Double-byte with leading byte not assigned in single-byte.

// To save memory, we read table files only when requested.

exports._dbcs = function(options) {
    if (!options)
        throw new Error("DBCS codec is called without the data.")
    if (!options.table)
        throw new Error("Encoding '" + options.type + "' has no data.");
    
    // Fill out DBCS -> Unicode decoding tables
    var decodeLead = [];
    for (var i = 0; i < 0x100; i++)
        decodeLead[i] = -1; // Unassigned.

    var decodeTable = [];
    for (var i = 0; i < 0x8000; i++)
        decodeTable[i] = -1; // Unassigned.

    var decodeTableSeq = [null, null, null]; // Sequences, start with 3. (they are designated by negative indexes and -1 is reserved for undefined, -2: leading byte)

    if (!options.table.map) options.table = [options.table];
    for (var i = 0; i < options.table.length; i++) {
        var table = require(options.table[i]);
        for (var j = 0; j < table.length; j++) { // Chunks.
            var chunk = table[j];
            var curAddr = parseInt(chunk[0], 16), writeTable;
            
            if (curAddr < 0x100) {
                writeTable = decodeLead;
            }
            else if (curAddr < 0x10000) {
                if (decodeLead[curAddr >> 8] >= 0)
                    throw new Error("Overwrite lead byte in table " + options.table + ": " + chunk[0]);
                
                decodeLead[curAddr >> 8] = -2; // DBCS lead byte.
                writeTable = decodeTable;
                curAddr -= 0x8000;
                if (curAddr < 0)
                    throw new Error("DB address < 0x8000 in table " + options.table + ": " + chunk[0]);
            }
            else
                throw new Error("Unsupported address in table " + options.table + ": " + chunk[0]);

            for (var k = 1; k < chunk.length; k++) {
                var part = chunk[k];
                if (typeof part === "string") { // String, write as-is.
                    for (var l = 0; l < part.length;) {
                        var code = part.charCodeAt(l++);
                        if (0xD800 <= code && code < 0xDC00) { // Surrogate
                            var codeTrail = part.charCodeAt(l++);
                            if (0xDC00 <= codeTrail && codeTrail < 0xE000)
                                writeTable[curAddr++] = 0x10000 + (code - 0xD800) * 0x400 + (codeTrail - 0xDC00);
                            else
                                throw new Error("Incorrect surrogate pair in table " + options.table + ": " + chunk[0]);
                        }
                        else if (0x0FF0 < code && code <= 0x0FFF) { // Character sequence (our own encoding)
                            var len = 0xFFF - code + 2;
                            var seq = [];
                            for (var m = 0; m < len; m++)
                                seq.push(part.charCodeAt(l++)); // Simple variation: don't support surrogates or subsequences in seq.

                            decodeTableSeq.push(seq);
                            writeTable[curAddr++] = -(decodeTableSeq.length-1); // negative char code -> sequence idx.
                        }
                        else
                            writeTable[curAddr++] = code; // Basic char
                    }
                } 
                else if (typeof part === "number") { // Integer, meaning increasing sequence starting with prev character.
                    var charCode = writeTable[curAddr - 1] + 1;
                    for (var l = 0; l < part; l++)
                        writeTable[curAddr++] = charCode++;
                }
                else
                    throw new Error("Incorrect value type '" + typeof part + "' in table " + options.table + ": " + chunk[0]);
            }
        }
    }

    // Unicode -> DBCS. Split table in smaller tables by 256 chars each.
    var encodeTable = [];
    var encodeTableSeq = [null, null, null];
    // for (var i = 0; i < 0x1100; i++) // Handle all 17 Unicode planes.
    //     encodeTable[i] = null; // Unassigned

    var tables = [[decodeTable, 0x8000], [decodeLead, 0]];
    for (var t = 0; t < tables.length; t++) {
        var table = tables[t][0], offset = tables[t][1];
        for (var i = 0; i < table.length; i++) {
            var uCode = table[i];
            if (uCode >= 0) {
                var high = uCode >> 8; // This could be > 0xFF because of astral characters.
                var low = uCode & 0xFF;
                var subtable = encodeTable[high];
                if (subtable === undefined) {
                    encodeTable[high] = subtable = [];
                    for (var j = 0; j < 0x100; j++)
                        subtable[j] = -1;
                }
                if (subtable[low] < -2)
                    encodeTableSeq[-subtable[low]][-1] = i + offset;
                else
                    subtable[low] = i + offset;
            }
            else if (uCode < -2) { // Sequence.
                var seq = decodeTableSeq[-uCode];
                //console.log((i+offset).toString(16), uCode, seq.map(function(uCode) {return uCode.toString(16)}));
                uCode = seq[0];

                var high = uCode >> 8;
                var low = uCode & 0xFF;
                var subtable = encodeTable[high];
                if (subtable === undefined) {
                    encodeTable[high] = subtable = [];
                    for (var j = 0; j < 0x100; j++)
                        subtable[j] = -1;
                }

                var seqObj;
                if (subtable[low] < -1)
                    seqObj = encodeTableSeq[-subtable[low]];
                else {
                    seqObj = {};
                    if (subtable[low] !== -1) seqObj[-1] = subtable[low];
                    encodeTableSeq.push(seqObj);
                    subtable[low] = -(encodeTableSeq.length - 1);
                }

                for (var j = 1; j < seq.length; j++) {
                    uCode = seq[j];
                    if (j === seq.length-1) {
                        seqObj[uCode] = i + offset;
                    } else {
                        var oldVal = seqObj[uCode];
                        if (typeof oldVal === 'object')
                            seqObj = oldVal;
                        else {
                            seqObj = seqObj[uCode] = {}
                            if (oldVal !== undefined)
                                seqObj[-1] = oldVal
                        }
                    }
                }
            }
        }
    }

    if (typeof options.gb18030 == 'string') {
        options.gb18030 = require(options.gb18030);
        for (var i = 0; i < 0x100; i++)
            if ((0x81 <= i && i <= 0xFE) != (decodeLead[i] == -2))
                throw new Error("Invalid GB18030 double-byte table; leading byte is not in range 0x81-0xFE: ", i.toString(16));
    }
        

    var defCharSB  = encodeTable[0][options.iconv.defaultCharSingleByte.charCodeAt(0)];
    if (defCharSB === -1) defCharSB = encodeTable[0]['?'];
    if (defCharSB === -1) defCharSB = "?".charCodeAt(0);

    return {
        encoder: encoderDBCS,
        decoder: decoderDBCS,

        decodeLead: decodeLead,
        decodeTable: decodeTable,
        decodeTableSeq: decodeTableSeq,
        defaultCharUnicode: options.iconv.defaultCharUnicode,

        encodeTable: encodeTable,
        encodeTableSeq: encodeTableSeq,
        defaultCharSingleByte: defCharSB,
        gb18030: options.gb18030,
    };
}

function encoderDBCS(options) {
    return {
        // Methods
        write: encoderDBCSWrite,
        end: encoderDBCSEnd,

        // Decoder state
        leadSurrogate: -1,
        seqObj: undefined,
        
        // Static data
        encodeTable: this.encodeTable,
        encodeTableSeq: this.encodeTableSeq,
        defaultCharSingleByte: this.defaultCharSingleByte,
        gb18030: this.gb18030,

        // Export for testing
        findIdx: findIdx,
    }
}

function encoderDBCSWrite(str) {
    var newBuf = new Buffer(str.length * (this.gb18030 ? 4 : 2)), 
        leadSurrogate = this.leadSurrogate,
        seqObj = this.seqObj, nextChar = -1,
        i = 0, j = 0;

    while (true) {
        // 0. Get next character.
        if (nextChar === -1) {
            if (i == str.length) break;
            var uCode = str.charCodeAt(i++);
        }
        else {
            var uCode = nextChar;
            nextChar = -1;    
        }

        // 1. Handle surrogates.
        if (0xD800 <= uCode && uCode < 0xE000) { // Char is one of surrogates.
            if (uCode < 0xDC00) { // We've got lead surrogate.
                if (leadSurrogate === -1) {
                    leadSurrogate = uCode;
                    continue;
                } else {
                    leadSurrogate = uCode;
                    // Double lead surrogate found.
                    uCode = -1;
                }
            } else { // We've got trail surrogate.
                if (leadSurrogate !== -1) {
                    uCode = 0x10000 + (leadSurrogate - 0xD800) * 0x400 + (uCode - 0xDC00);
                    leadSurrogate = -1;
                } else {
                    // Incomplete surrogate pair - only trail surrogate found.
                    uCode = -1;
                }
                
            }
        }
        else if (leadSurrogate !== -1) {
            // Incomplete surrogate pair - only lead surrogate found.
            nextChar = uCode; uCode = -1; // Write an error, then current char.
            leadSurrogate = -1;
        }

        // 2. Convert uCode character.
        var dbcsCode = -1;
        if (seqObj !== undefined && uCode != -1) { // We are in the middle of the sequence
            var resCode = seqObj[uCode];
            if (typeof resCode === 'object') { // Sequence continues.
                seqObj = resCode;
                continue;

            } else if (typeof resCode == 'number') { // Sequence finished. Write it.
                dbcsCode = resCode;

            } else if (resCode == undefined) { // Current character is not part of the sequence.

                // Try default character for this sequence
                resCode = seqObj[-1];
                if (resCode !== undefined) {
                    dbcsCode = resCode; // Found. Write it.
                    nextChar = uCode; // Current character will be written too in the next iteration.

                } else {
                    // TODO: What if we have no default? (resCode == undefined)
                    // Then, we should write first char of the sequence as-is and try the rest recursively.
                    // Didn't do it for now because no encoding has this situation yet.
                    // Currently, just skip the sequence and write current char.
                }
            }
            seqObj = undefined;
        }
        else if (uCode >= 0) {  // Regular character
            var subtable = this.encodeTable[uCode >> 8];
            if (subtable !== undefined)
                dbcsCode = subtable[uCode & 0xFF];
            
            if (dbcsCode < -2) { // Sequence start
                seqObj = this.encodeTableSeq[-dbcsCode];
                continue;
            }

            if (dbcsCode == -1 && this.gb18030) {
                // Use GB18030 algorithm to find character(s) to write.
                var idx = findIdx(this.gb18030.uChars, uCode);
                if (idx != -1) {
                    var dbcsCode = this.gb18030.gbChars[idx] + (uCode - this.gb18030.uChars[idx]);
                    newBuf[j++] = 0x81 + Math.floor(dbcsCode / 12600); dbcsCode = dbcsCode % 12600;
                    newBuf[j++] = 0x30 + Math.floor(dbcsCode / 1260); dbcsCode = dbcsCode % 1260;
                    newBuf[j++] = 0x81 + Math.floor(dbcsCode / 10); dbcsCode = dbcsCode % 10;
                    newBuf[j++] = 0x30 + dbcsCode;
                    continue;
                }
            }
        }

        // 3. Write dbcsCode character.
        if (dbcsCode === -1)
            dbcsCode = this.defaultCharSingleByte;
        
        if (dbcsCode < 0x100) {
            newBuf[j++] = dbcsCode;
        }
        else {
            newBuf[j++] = dbcsCode >> 8;   // high byte
            newBuf[j++] = dbcsCode & 0xFF; // low byte
        }
    }

    this.seqObj = seqObj;
    this.leadSurrogate = leadSurrogate;
    return newBuf.slice(0, j);
}

function encoderDBCSEnd() {
    if (this.leadSurrogate === -1 && this.seqObj === undefined)
        return; // All clean. Most often case.

    var newBuf = new Buffer(10), j = 0;

    if (this.seqObj) { // We're in the sequence.
        var dbcsCode = this.seqObj[-1];
        if (dbcsCode !== undefined) { // Write beginning of the sequence.
            if (dbcsCode < 0x100) {
                newBuf[j++] = dbcsCode;
            }
            else {
                newBuf[j++] = dbcsCode >> 8;   // high byte
                newBuf[j++] = dbcsCode & 0xFF; // low byte
            }
        } else {
            // See todo above.
        }
        this.seqObj = undefined;
    }

    if (this.leadSurrogate !== -1) {
        // Incomplete surrogate pair - only lead surrogate found.
        newBuf[j++] = this.defaultCharSingleByte;
        this.leadSurrogate = -1;
    }
    
    return newBuf.slice(0, j);
}



function decoderDBCS(options) {
    return {
        // Methods
        write: decoderDBCSWrite,
        end: decoderDBCSEnd,

        // Decoder state
        leadBytes: -1,

        // Static data
        decodeLead: this.decodeLead,
        decodeTable: this.decodeTable,
        decodeTableSeq: this.decodeTableSeq,
        defaultCharUnicode: this.defaultCharUnicode,
        gb18030: this.gb18030,
    }
}

function decoderDBCSWrite(buf) {
    var newBuf = new Buffer(buf.length*2),
        leadBytes = this.leadBytes, uCode;
    
    for (var i = 0, j = 0; i < buf.length; i++) {
        var curByte = buf[i];
        if (leadBytes === -1) { // We have no leading byte in buffer.
            uCode = this.decodeLead[curByte];
            if (uCode === -2) { // Check if this is a leading byte of a double-byte char sequence.
                leadBytes = curByte; 
                continue;
            }
        } else { // curByte is a trailing byte in double-byte char sequence.

            if (this.gb18030) {
                if (leadBytes < 0x100) { // Single byte lead
                    if (0x30 <= curByte && curByte <= 0x39) {
                        leadBytes = leadBytes * 0x100 + curByte; // Move on.
                        continue;
                    }
                    else // Usual decode table. 
                        uCode = this.decodeTable[(leadBytes << 8) + curByte - 0x8000];
                        
                } else if (leadBytes < 0x10000) { // Double byte lead
                    if (0x81 <= curByte && curByte <= 0xFE) {
                        leadBytes = leadBytes * 0x100 + curByte; // Move on.
                        continue;

                    } else { // Incorrect byte.
                        uCode = this.defaultCharUnicode.charCodeAt(0); 
                        newBuf[j++] = uCode & 0xFF;    // Emit 'incorrect sequence' char.
                        newBuf[j++] = uCode >> 8;
                        newBuf[j++] = leadBytes & 0xFF; // Throw out first char, emit second char (it'll be '0'-'9').
                        newBuf[j++] = 0;
                        leadBytes = -1; i--; // Cur char will be processed once again, without leading.
                        continue;
                    }

                } else { // Triple byte lead: we're ready.
                    if (0x30 <= curByte && curByte <= 0x39) { // Complete sequence. Decode it.
                        var ptr = ((((leadBytes >> 16)-0x81)*10 + ((leadBytes >> 8) & 0xFF)-0x30)*126 + (leadBytes & 0xFF)-0x81)*10 + curByte-0x30;
                        var idx = findIdx(this.gb18030.gbChars, ptr);
                        uCode = this.gb18030.uChars[idx] + ptr - this.gb18030.gbChars[idx];

                    } else { // Incorrect 4-th byte.
                        uCode = this.defaultCharUnicode.charCodeAt(0); 
                        newBuf[j++] = uCode & 0xFF;    // Emit 'incorrect sequence' char.
                        newBuf[j++] = uCode >> 8;
                        newBuf[j++] = (leadBytes >> 8) & 0xFF; // Throw out first char, emit second char (it'll be '0'-'9').
                        newBuf[j++] = 0;
                        leadBytes = leadBytes & 0xFF; // Make third char a leading byte - it was in 0x81-0xFE range.
                        i--; // Cur char will be processed once again.
                        continue;
                    }
                }
            } else
                uCode = this.decodeTable[(leadBytes << 8) + curByte - 0x8000];

            leadBytes = -1;
            if (uCode == -1) i--; // Try curByte one more time in the next iteration without the lead byte.
        }
        
        // Decide what to do with character.
        if (uCode === -1) { // Undefined char.
            // TODO: Callback.
            uCode = this.defaultCharUnicode.charCodeAt(0);
        }
        else if (uCode < 0) { // Sequence
            var seq = this.decodeTableSeq[-uCode];
            if (!seq) throw new Error("Incorrect sequence table");
            for (var k = 0; k < seq.length; k++) {
                uCode = seq[k];
                newBuf[j++] = uCode & 0xFF;
                newBuf[j++] = uCode >> 8;
            }
            continue;
        }
        else if (uCode > 0xFFFF) { // Surrogates
            uCode -= 0x10000;
            var uCodeLead = 0xD800 + Math.floor(uCode / 0x400);
            newBuf[j++] = uCodeLead & 0xFF;
            newBuf[j++] = uCodeLead >> 8;

            uCode = 0xDC00 + uCode % 0x400;
        }

        // Write the character to buffer.
        newBuf[j++] = uCode & 0xFF;
        newBuf[j++] = uCode >> 8;
    }

    this.leadBytes = leadBytes;
    return newBuf.slice(0, j).toString('ucs2');
}

function decoderDBCSEnd() {
    if (this.leadBytes === -1)
        return;

    var ret = this.defaultCharUnicode;

    if (this.gb18030 && this.leadBytes >= 0x100) {
        if (this.leadBytes < 0x10000) 
            // Double byte lead: throw out first char, emit second char (it'll be '0'-'9').
            ret += String.fromCharCode(this.leadBytes & 0xFF); 
        else
            // Triple byte lead: throw out first char, emit second char (it'll be '0'-'9'), emit default for third char (its 0x81-0xFE).
            ret += String.fromCharCode((this.leadBytes >> 8) & 0xFF) + this.defaultCharUnicode; 
    }

    this.leadBytes = -1;
    return ret;
}

// Binary search for GB18030. Returns largest i such that table[i] <= val.
function findIdx(table, val) {
    if (table[0] > val)
        return -1;

    var l = 0, r = table.length;
    while (l < r-1) { // always table[l] <= val < table[r]
        var mid = l + Math.floor((r-l+1)/2);
        if (table[mid] <= val)
            l = mid;
        else
            r = mid;
    }
    return l;
}
