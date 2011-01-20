/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, maxlen: 512, onevar: true */
/*global window,unsafeWindow,$,jQuery,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,localStorage,sessionStorage,rison */
/*jslint maxlen: 250 */

////////////////////////////////////////////////////////////////////
//                          utility library
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

(function () {
    ///////////////////////////
    //       Prototypes
    ///////////////////////////

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    if (!document['head']) {
        document['head'] = document.head = document.getElementsByTagName('head')[0];
    }

    String.prototype['ucFirst'] = String.prototype.ucFirst = function () {
        return this.charAt(0).toUpperCase() + this.substr(1);
    };

    String.prototype['stripHTML'] = String.prototype.stripHTML = function () {
        return this.replace(new RegExp("<[^>]+>", "g"), '').replace(/&nbsp;/g, '');
    };

    String.prototype['stripCaap'] = String.prototype.stripCaap = function () {
        return this.replace(/caap_/i, '');
    };

    String.prototype['stripTRN'] = String.prototype.stripTRN = function () {
        return this.replace(/[\t\r\n]/g, '');
    };

    String.prototype['stripStar'] = String.prototype.stripStar = function () {
        return this.replace(/\*/g, '');
    };

    String.prototype['innerTrim'] = String.prototype.innerTrim = function () {
        return this.replace(/\s+/g, ' ');
    };

    String.prototype['matchUser'] = String.prototype.matchUser = function () {
        return this.match(/user=(\d+)/);
    };

    String.prototype['matchNum'] = String.prototype.matchNum = function () {
        return this.match(/(\d+)/);
    };

    String.prototype['parseFloat'] = String.prototype.parseFloat = function (x) {
        return x >= 0 ? parseFloat(parseFloat(this).toFixed(x >= 0 && x <= 20 ? x : 20)) : parseFloat(this);
    };

    String.prototype['parseInt'] = String.prototype.parseInt = function (x) {
        return parseInt(this, (x >= 2 && x <= 36) ? x : 10);
    };

    String.prototype['trim'] = String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };

    String.prototype['numberOnly'] = String.prototype.numberOnly = function () {
        return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
    };

    String.prototype['parseTimer'] = String.prototype.parseTimer = function () {
        var a = [],
            b = 0,
            i = 0,
            l = 0;

        a = this.split(':');
        for (i = 0, l = a.length; i < l; i += 1) {
            b = b * 60 + parseInt(a[i], 10);
        }

        if (isNaN(b)) {
            b = -1;
        }

        return b;
    };

    String.prototype['removeHtmlJunk'] = String.prototype.removeHtmlJunk = function () {
        return this.replace(new RegExp("\\&[^;]+;", "g"), '');
    };

    //pads left
    String.prototype['lpad'] = String.prototype.lpad = function (s, l) {
        var t = this;
        while (t.length < l) {
            t = s + t;
        }

        return t;
    };

    //pads right
    String.prototype['rpad'] = String.prototype.rpad = function (s, l) {
        var t = this;
        while (t.length < l) {
            t = t + s;
        }

        return t;
    };

    String.prototype['filepart'] = String.prototype.filepart = function () {
        var x = this.lastIndexOf('/');
        if (x >= 0) {
            return this.substr(x + 1);
        }

        return this;
    };

    String.prototype['regex'] = String.prototype.regex = function (r) {
        var a = this.match(r),
            i = 0,
            l = 0;

        if (a) {
            a.shift();
            l = a.length;
            for (i = 0 ; i < l; i += 1) {
                if (a[i] && a[i].search(/^[\-+]?[\d]*\.?[\d]*$/) >= 0) {
                    a[i] = parseFloat(a[i].replace('+', ''));
                }
            }

            if (l === 1) {
                return a[0];
            }
        }

        return a;
    };

    // Turns text delimeted with new lines and commas into an array.
    // Primarily for use with user input text boxes.
    String.prototype['toArray'] = String.prototype.toArray = function () {
        var a = [],
            t = [],
            i = 0,
            l = 0;

        t = this.replace(/,/g, '\n').split('\n');
        if (t && t.length) {
            for (i = 0, l = t.length; i < l; i += 1) {
                if (t[i] !== '') {
                    a.push(isNaN(t[i]) ? t[i].trim() : parseFloat(t[i]));
                }
            }
        }

        return a;
    };

    /*jslint bitwise: false */
    String.prototype['Utf8encode'] = String.prototype.Utf8encode = function () {
        var s = '';
        s = this.replace(/[\u0080-\u07ff]/g, function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
        });

        s = s.replace(/[\u0800-\uffff]/g, function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f);
        });

        return s;
    };

    String.prototype['Utf8decode'] = String.prototype.Utf8decode = function () {
        var s = '';
        s = this.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function (c) {
            return String.fromCharCode(((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | (c.charCodeAt(2)&0x3f));
        });

        s = s.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function (c) {
            return String.fromCharCode((c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f);
        });

        return s;
    };

    String.prototype['Base64encode'] = String.prototype.Base64encode = function (utf8encode) {
        var o1, o2, o3, bits, h1, h2, h3, h4,
            c     = 0,
            coded = '',
            plain = '',
            e     = [],
            pad   = '',
            b64   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            nChar = String.fromCharCode(0);

        utf8encode = (typeof utf8encode === 'undefined') ? false : utf8encode;
        plain = utf8encode ? this.Utf8encode() : this;
        c = plain.length % 3;
        if (c > 0) {
            while (c < 3) {
                pad += '=';
                plain += nChar;
                c += 1;
            }
        }

        for (c = 0; c < plain.length; c += 3) {
            o1 = plain.charCodeAt(c);
            o2 = plain.charCodeAt(c + 1);
            o3 = plain.charCodeAt(c + 2);
            bits = o1<<16 | o2<<8 | o3;
            h1 = bits>>18 & 0x3f;
            h2 = bits>>12 & 0x3f;
            h3 = bits>>6 & 0x3f;
            h4 = bits & 0x3f;
            e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        }

        coded = e.join('');
        coded = coded.slice(0, coded.length - pad.length) + pad;
        return coded;
    };

    String.prototype['Base64decode'] = String.prototype.Base64decode = function (utf8decode) {
        var o1, o2, o3, h1, h2, h3, h4, bits,
            d     = [],
            plain = '',
            coded = '',
            b64   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            c     = 0;

        utf8decode = (typeof utf8decode === 'undefined') ? false : utf8decode;
        coded = utf8decode ? this.Utf8decode() : this;
        for (c = 0; c < coded.length; c += 4) {
            h1 = b64.indexOf(coded.charAt(c));
            h2 = b64.indexOf(coded.charAt(c + 1));
            h3 = b64.indexOf(coded.charAt(c + 2));
            h4 = b64.indexOf(coded.charAt(c + 3));
            bits = h1<<18 | h2<<12 | h3<<6 | h4;
            o1 = bits>>>16 & 0xff;
            o2 = bits>>>8 & 0xff;
            o3 = bits & 0xff;
            d[c / 4] = String.fromCharCode(o1, o2, o3);
            if (h4 === 0x40) {
                d[c / 4] = String.fromCharCode(o1, o2);
            }

            if (h3 === 0x40) {
                d[c / 4] = String.fromCharCode(o1);
            }
        }

        plain = d.join('');
        return utf8decode ? plain.Utf8decode() : plain;
    };

    String.prototype['MD5'] = String.prototype.MD5 = function (utf8encode) {
        function AddUnsigned(lX, lY) {
            var lX4     = (lX & 0x40000000),
                lY4     = (lY & 0x40000000),
                lX8     = (lX & 0x80000000),
                lY8     = (lY & 0x80000000),
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }

            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function F(x, y, z) {
            return (x & y) | ((~x) & z);
        }

        function G(x, y, z) {
            return (x & z) | (y & (~z));
        }

        function H(x, y, z) {
            return (x ^ y ^ z);
        }

        function I(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function FF(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(a.ROTL(s), b);
        }

        function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(a.ROTL(s), b);
        }

        function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(a.ROTL(s), b);
        }

        function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(a.ROTL(s), b);
        }

        function ConvertToWordArray(textMsg) {
            var lWordCount           = 0,
                lMessageLength       = textMsg.length,
                lNumberOfWords_temp1 = lMessageLength + 8,
                lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
                lNumberOfWords       = (lNumberOfWords_temp2 + 1) * 16,
                lWordArray           = Array(lNumberOfWords - 1),
                lBytePosition        = 0,
                lByteCount           = 0;

            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (textMsg.charCodeAt(lByteCount)<<lBytePosition));
                lByteCount += 1;
            }

            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength<<3;
            lWordArray[lNumberOfWords - 1] = lMessageLength>>>29;
            return lWordArray;
        }

        function WordToHex(lValue) {
            var WordToHexValue      = "",
                WordToHexValue_temp = "",
                lByte               = 0,
                lCount              = 0;

            for (lCount = 0; lCount <= 3; lCount += 1) {
                lByte = (lValue>>>(lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }

            return WordToHexValue;
        }

        var x   = [],
            a   = 0x67452301,
            b   = 0xEFCDAB89,
            c   = 0x98BADCFE,
            d   = 0x10325476,
            S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22,
            S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20,
            S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23,
            S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21,
            k   = 0,
            l   = 0,
            AA  = 0x00000000,
            BB  = 0x00000000,
            CC  = 0x00000000,
            DD  = 0x00000000,
            msg = '';

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
        x = ConvertToWordArray(msg);
        for (k = 0, l = x.length; k < l; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0],  S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1],  S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2],  S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3],  S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4],  S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5],  S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6],  S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7],  S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8],  S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9],  S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1],  S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6],  S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0],  S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5],  S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4],  S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9],  S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3],  S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8],  S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2],  S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7],  S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5],  S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8],  S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1],  S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4],  S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7],  S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0],  S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3],  S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6],  S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9],  S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2],  S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0],  S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7],  S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5],  S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3],  S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1],  S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8],  S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6],  S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4],  S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2],  S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9],  S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }

        return WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
    };

    String.prototype['SHA1'] = String.prototype.SHA1 = function (utf8encode) {
        var blockstart = 0,
            i          = 0,
            j          = 0,
            W          = [80],
            H0         = 0x67452301,
            H1         = 0xEFCDAB89,
            H2         = 0x98BADCFE,
            H3         = 0x10325476,
            H4         = 0xC3D2E1F0,
            A          = null,
            B          = null,
            C          = null,
            D          = null,
            E          = null,
            temp       = null,
            msg        = '',
            msg_len    = 0,
            len        = 0,
            word_array = [];

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
        msg_len = msg.length;
        for (i = 0; i < msg_len - 3; i += 4) {
            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
            word_array.push(j);
        }

        switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
        default:
        }

        word_array.push(i);
        while ((word_array.length % 16) !== 14) {
            word_array.push(0);
        }

        word_array.push(msg_len >>> 29);
        word_array.push((msg_len << 3) & 0x0ffffffff);
        for (blockstart = 0, len = word_array.length; blockstart < len; blockstart += 16) {
            for (i = 0; i < 16; i += 1) {
                W[i] = word_array[blockstart + i];
            }

            for (i = 16; i <= 79; i += 1) {
                W[i] = (W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]).ROTL(1);
            }

            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;
            for (i = 0; i <= 19; i += 1) {
                temp = (A.ROTL(5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = B.ROTL(30);
                B = A;
                A = temp;
            }

            for (i = 20; i <= 39; i += 1) {
                temp = (A.ROTL(5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = B.ROTL(30);
                B = A;
                A = temp;
            }

            for (i = 40; i <= 59; i += 1) {
                temp = (A.ROTL(5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = B.ROTL(30);
                B = A;
                A = temp;
            }

            for (i = 60; i <= 79; i += 1) {
                temp = (A.ROTL(5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = B.ROTL(30);
                B = A;
                A = temp;
            }

            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }

        temp = H0.toHexStr() + H1.toHexStr() + H2.toHexStr() + H3.toHexStr() + H4.toHexStr();
        return temp.toLowerCase();
    };

    String.prototype['SHA256'] = String.prototype.SHA256 = function (utf8encode) {
        function Sigma0(x) {
            return Number(2).ROTR(x) ^ Number(13).ROTR(x) ^ Number(22).ROTR(x);
        }

        function Sigma1(x) {
            return Number(6).ROTR(x) ^ Number(11).ROTR(x) ^ Number(25).ROTR(x);
        }

        function sigma0(x) {
            return Number(7).ROTR(x) ^ Number(18).ROTR(x) ^ (x>>>3);
        }

        function sigma1(x) {
            return Number(17).ROTR(x) ^ Number(19).ROTR(x) ^ (x>>>10);
        }

        function Ch(x, y, z)  {
            return (x & y) ^ (~x & z);
        }

        function Maj(x, y, z) {
            return (x & y) ^ (x & z) ^ (y & z);
        }

        var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
            H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19],
            msg = '',
            l = 0,
            N = 0,
            M = [],
            i = 0,
            j = 0,
            W = [],
            t = 0,
            a, b, c, d, e, f, g, h, T1, T2;

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
        msg += String.fromCharCode(0x80);
        l = msg.length / 4 + 2;
        N = Math.ceil(l / 16);
        M = new Array(N);

        for (i = 0; i < N; i += 1) {
            M[i] = new Array(16);
            for (j = 0; j < 16; j += 1) {
                M[i][j] = (msg.charCodeAt(i * 64 + j * 4)<<24) | (msg.charCodeAt(i * 64 + j * 4 + 1)<<16) | (msg.charCodeAt(i * 64 + j * 4 + 2)<<8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
            }
        }

        M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;
        W = new Array(64);
        for (i = 0; i < N; i += 1) {
            for (t = 0; t < 16; t += 1) {
                W[t] = M[i][t];
            }

            for (t = 16; t < 64; t += 1) {
                W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) & 0xffffffff;
            }

            a = H[0];
            b = H[1];
            c = H[2];
            d = H[3];
            e = H[4];
            f = H[5];
            g = H[6];
            h = H[7];
            for (t = 0; t < 64; t += 1) {
                T1 = h + Sigma1(e) + Ch(e, f, g) + K[t] + W[t];
                T2 = Sigma0(a) + Maj(a, b, c);
                h = g;
                g = f;
                f = e;
                e = (d + T1) & 0xffffffff;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) & 0xffffffff;
            }

            H[0] = (H[0] + a) & 0xffffffff;
            H[1] = (H[1] + b) & 0xffffffff;
            H[2] = (H[2] + c) & 0xffffffff;
            H[3] = (H[3] + d) & 0xffffffff;
            H[4] = (H[4] + e) & 0xffffffff;
            H[5] = (H[5] + f) & 0xffffffff;
            H[6] = (H[6] + g) & 0xffffffff;
            H[7] = (H[7] + h) & 0xffffffff;
        }

        return H[0].toHexStr() + H[1].toHexStr() + H[2].toHexStr() + H[3].toHexStr() +
               H[4].toHexStr() + H[5].toHexStr() + H[6].toHexStr() + H[7].toHexStr();
    };

    Number.prototype['dp'] = Number.prototype.dp = function (x) {
        return parseFloat(this.toFixed(x >= 0 && x <= 20 ? x : 0));
    };

    /*jslint bitwise: false */
    // For use with SHA1 and SHA256
    Number.prototype['toHexStr'] = Number.prototype.toHexStr = function () {
        var s = "",
            v = 0,
            i = 0;

        for (i = 7; i >= 0; i -= 1) {
            v = (this >>> (i * 4)) & 0xf;
            s += v.toString(16);
        }

        return s;
    };

    // For use with SHA1 and MD5
    Number.prototype['ROTL'] = Number.prototype.ROTL = function (x) {
        return (this << x) | (this >>> (32 - x));
    };

    // For use with SHA256
    Number.prototype['ROTR'] = Number.prototype.ROTR = function (x) {
        return (x >>> this) | (x << (32 - this));
    };
    /*jslint bitwise: true */

    Number.prototype['isInt'] = Number.prototype.isInt = function () {
        var y = parseInt(this, 10);
        if (isNaN(y)) {
            return false;
        }

        return this === y && this.toString() === y.toString();
    };

    Array.prototype['pushCopy'] = Array.prototype.pushCopy = function (o) {
        switch (jQuery.type(o)) {
        case "object":
            this.push(jQuery.extend(true, {}, o));
            break;
        case "array":
            this.push(o.slice());
            break;
        default:
            this.push(o);
        }
    };
    /*jslint sub: false */

    ///////////////////////////
    //       utility
    ///////////////////////////
    var log_version = '',
        log_level = 1,
        utility = {
        jQueryExtend: function (url) {
            ///////////////////////////
            //       Extend jQuery
            ///////////////////////////

            (function ($) {
                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                $.fn['getPercent'] = $.fn.getPercent = function (type) {
                /*jslint sub: false */
                    var t = [];
                    if (!type || type === 'width') {
                        t = this.attr("style").match(/width:\s*([\d\.]+)%/i);
                    } else if (!type || type === 'height') {
                        t = this.attr("style").match(/height:\s*([\d\.]+)%/i);
                    }

                    return (t && t.length >= 2 && t[1]) ? parseFloat(t[1]) : 0;
                };
            }(jQuery));
        },

        is_chrome: navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

        is_firefox: navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

        is_html5_localStorage: ('localStorage' in window) && window.localStorage !== null,

        is_html5_sessionStorage: ('sessionStorage' in window) && window.sessionStorage !== null,

        injectScript: function (url) {
            try {
                var inject = document.createElement('script');
                inject.setAttribute('type', 'text/javascript');
                inject.setAttribute('src', url);
                document.head.appendChild(inject);
                return true;
            } catch (err) {
                utility.error("ERROR in utility.injectScript: " + err);
                return false;
            }
        },

        isNum: function (value) {
            return typeof value === 'number';
        },

        alert: function (html) {
            jQuery('<div id="alert_' + new Date().getTime() + '" title="Alert!">' + (html ? html : '') + '</div>').appendTo(window.document.body).dialog({
                buttons: {
                    "Ok": function () {
                        jQuery(this).dialog("destroy").remove();
                    }
                }
            });
        },

        set_log_version: function (text) {
            log_version = text;
        },

        get_log_version: function () {
            return log_version;
        },

        set_log_level: function (level) {
            log_level = level;
        },

        get_log_level: function () {
            return log_level;
        },

        log_common: function (type, level, text) {
            if (log_level && !isNaN(level) && log_level >= level) {
                var m = log_version + ' |' + (new Date()).toLocaleTimeString() + '| ' + text,
                    t = [],
                    i = 0,
                    l = 0;

                type = type ? type : "log";
                type = typeof console[type] !== undefined ? type : typeof console.log !== undefined ? type : '';
                if (type) {
                    if (arguments.length === 4) {
                        for (i = 0, l = arguments[3].length; i < l; i += 1) {
                            t.pushCopy(arguments[3][i]);
                        }

                        console[type](m, t);
                    } else {
                        console[type](m);
                    }
                }
            }
        },

        log: function (level, text) {
            if (arguments.length > 2) {
                utility.log_common("log", level, text, Array.prototype.slice.call(arguments, 2));
            } else {
                utility.log_common("log", level, text);
            }
        },

        warn: function (text) {
            if (arguments.length > 1) {
                utility.log_common("warn", 1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log_common("warn", 1, text);
            }
        },

        error: function (text) {
            if (arguments.length > 1) {
                utility.log_common("error", 1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log_common("error", 1, text);
            }
        },

        charPrintables: function () {
            try {
                var t = '',
                    i = 0;

                for (i = 32; i <= 126; i += 1) {
                    t += String.fromCharCode(i);
                }

                return t;
            } catch (err) {
                utility.error("ERROR in utility.charPrintables: " + err);
                return undefined;
            }
        },

        charNonPrintables: function () {
            try {
                var t = '',
                    i = 0;

                for (i = 0; i <= 255; i += 1) {
                    t += String.fromCharCode(i);
                }

                return t;
            } catch (err) {
                utility.error("ERROR in utility.charNonPrintables: " + err);
                return undefined;
            }
        },

        testMD5: function () {
            try {
                var t = '',
                    r = '',
                    c = 'e5df5a39f2b8cb71b24e1d8038f93131',
                    d = 'e1cb1402564d3f0d07fc946196789c81',
                    p = true;

                t = utility.charPrintables();
                r = t.MD5();
                if (r !== c) {
                    p = false;
                }

                t = utility.charNonPrintables();
                r = t.MD5();
                if (r !== d) {
                    p = false;
                }


                if (p) {
                    utility.log(1, "MD5 Passed");
                } else {
                    utility.warn("MD5 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testMD5: " + err);
                return undefined;
            }
        },

        testSHA1: function () {
            try {
                var t = '',
                    r = '',
                    c = 'e4f8188cdca2a68b074005e2ccab5b67842c6fc7',
                    d = 'ae79896181f7034c2c11a57bd211ec3dea276625',
                    p = true;

                t = utility.charPrintables();
                r = t.SHA1();
                if (r !== c) {
                    p = false;
                }

                t = utility.charNonPrintables();
                r = t.SHA1();
                if (r !== d) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "SHA1 Passed");
                } else {
                    utility.warn("SHA1 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testSHA1: " + err);
                return undefined;
            }
        },

        testSHA256: function () {
            try {
                var t = '',
                    r = '',
                    c = 'cb2a9233adc1225c5c495c46e62cf6308223c5e241ef33ad109f03141b57966a',
                    d = '9799e3eb6096a48f515a94324200b7af24251a4131eccf9a2cd65d012a1f5c71',
                    p = true;

                t = utility.charPrintables();
                r = t.SHA256();
                if (r !== c) {
                    p = false;
                }

                t = utility.charNonPrintables();
                r = t.SHA256();
                if (r !== d) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "SHA256 Passed");
                } else {
                    utility.warn("SHA256 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testSHA256: " + err);
                return undefined;
            }
        },

        testUTF8: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    p = true;

                t = utility.charNonPrintables();
                r = t.Utf8encode();
                s = r.Utf8decode();
                if (s !== t) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Utf8 Passed");
                } else {
                    utility.warn("Utf8 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testUTF8: " + err);
                return undefined;
            }
        },

        testBase64: function () {
            try {
                var t = '',
                    c = "/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/" +
                        "bAIQAAgEBAQEBAgEBAgMCAQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCg" +
                        "oKDAwMDAwMDAwMDAECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD" +
                        "AwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAGsAAQEAAAAAAAAAAAAA" +
                        "AAAAAAgJAQEBAQAAAAAAAAAAAAAAAAABAgMQAAEDAgUCBAYDAAAAAAAAAAIBAwQFBhESEwcIABQ" +
                        "xIhUJIUEyQmIWM0QXEQEBAQADAAAAAAAAAAAAAAABABEhQQL/2gAMAwEAAhEDEQA/AI58ethnb+" +
                        "kS7muKYUSgQybdmTnm+67dJJuJGjx4zhgD0p9GjNEcXTbbTOSEpCPUgZUtQmkeyg5upxKp3J7ba" +
                        "7JFZ20lNKNZkxKhT6y9bcgSVsm6zRXKZAJsRVMSKM6mAqhCuCoqmkQKkcMNzInKuPxvbZYW5Jb5" +
                        "xXAOe8FLBoI3qQzxl4K6UE4grJT4auQTb/kHFVCRml7Hd+bQ29cb8vda2ot47bNSDC8qBLjsSXD" +
                        "oNaokOjJPjg+ipnhS6caIqYKhYChCpovQmkdyZ5Pcsmvbkvxqwfb8u+3K9wfuejzQl0ZuSFWkTp" +
                        "tRh+nzv2lpQizYzzSGgxQzNoIj5kVVLqPPnGVgPflyy6tyusymwHsLzp1DKmzFzojpyW6XXagUf" +
                        "H5ugxUWW8vjmPL4ph1qwR64hv8AJWDudETjzHkzrncfmDC9MeBh5oEbRZhEUsCY7XTypISQCsYY" +
                        "ZsFyr0DxKSOu+8eXs15+E1alIj30KFqSaa5bLEwzRP67hVWe1qL9uhHQsfowXp2MiJJlbpf6jGq" +
                        "VRjJ+4ec6fTiORn1O4LOAGha3caubFVPV1fzwToWcv//Z",
                    r = '',
                    s = '',
                    p = true;

                t = utility.charNonPrintables();
                r = t.Base64encode();
                s = r.Base64decode();
                if (s !== t) {
                    p = false;
                }

                r = c.Base64decode();
                s = r.Base64encode();
                if (s !== c) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Base64 Passed");
                } else {
                    utility.warn("Base64 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testBase64: " + err);
                return undefined;
            }
        },

        testAes: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    c = new utility.Aes("password"),
                    d = new utility.Aes("test"),
                    e = 'YWQ1TWVlZWXr+E1tVWIBV0wzwzwdzTiH/YEHUjpWgt7sx9NcneHZHQ==',
                    f = "pssst ... đon’t tell anyøne!",
                    p = true;

                t = utility.charNonPrintables();
                r = c.encrypt(t);
                s = c.decrypt(r);
                if (s !== t) {
                    p = false;
                }

                r = d.decrypt(e);
                if (r !== f) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Aes Passed");
                } else {
                    utility.warn("Aes Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testAes: " + err);
                return undefined;
            }
        },

        testLZ77: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    c = new utility.LZ77(),
                    p = true;

                t = utility.charNonPrintables();
                r = c.compress(t);
                s = c.decompress(r);
                if (s !== t) {
                    p = false;
                }

                t = "LZ77 algorithms achieve compression by replacing portions of the data with references";
                t += " to matching data that have already passed through both encoder and decoder. A match";
                t += " is encoded by a pair of numbers called a length-distance pair, which is equivalent to";
                t += " the statement \"each of the next length characters is equal to the character exactly ";
                t += "distance characters behind it in the uncompressed stream.\" (The \"distance\" is sometimes";
                t += " called the \"offset\" instead.)\n";
                t += "The encoder and decoder must both keep track of some amount of the most recent data, such";
                t += " as the last 2 kB, 4 kB, or 32 kB. The structure in which this data is held is called a ";
                t += "sliding window, which is why LZ77 is sometimes called sliding window compression. The ";
                t += "encoder needs to keep this data to look for matches, and the decoder needs to keep this data";
                t += " to interpret the matches the encoder refers to. This is why the encoder can use a smaller ";
                t += "size sliding window than the decoder, but not vice-versa.\n";
                t += "Many documents which talk about LZ77 algorithms describe a length-distance pair as a command ";
                t += "to \"copy\" data from the sliding window: \"Go back distance characters in the buffer and ";
                t += "copy length characters, starting from that point.\" While those used to imperative programming";
                t += " may find this model intuitive, it may also make it hard to understand a feature of LZ77 ";
                t += "encoding: namely, that it is not only acceptable but frequently useful to have a length-distance";
                t += " pair where the length actually exceeds the distance. As a copy command, this is puzzling: \"Go ";
                t += "back one character in the buffer and copy seven characters, starting from that point.\" How can";
                t += " seven characters be copied from the buffer when only one of the specified characters is actually";
                t += " in the buffer? Looking at a length-distance pair as a statement of identity, however, clarifies ";
                t += "the confusion: each of the next seven characters is identical to the character that comes one ";
                t += "before it. This means that each character can be determined by looking back in the buffer – even ";
                t += "if the character looked back to was not in the buffer when the decoding of the current pair began. ";
                t += "Since by definition a pair like this will be repeating a sequence of distance characters multiple ";
                t += "times, it means that LZ77 incorporates a flexible and easy form of run-length encoding.";
                r = c.compress(t);
                s = c.decompress(r);
                if (s !== t) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "LZ77 Passed", ((r.length / t.length) * 100).dp(2));
                } else {
                    utility.warn("LZ77 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testLZ77: " + err);
                return undefined;
            }
        },

        testsRun: function (run) {
            try {
                var p = true;
                if (run) {
                    if (!utility.testMD5()) {
                        p = false;
                    }

                    if (!utility.testSHA1()) {
                        p = false;
                    }

                    if (!utility.testSHA256()) {
                        p = false;
                    }

                    if (!utility.testUTF8()) {
                        p = false;
                    }

                    if (!utility.testBase64()) {
                        p = false;
                    }

                    if (!utility.testAes()) {
                        p = false;
                    }

                    if (!utility.testLZ77()) {
                        p = false;
                    }
                }

                return p;
            } catch (err) {
                utility.error("ERROR in utility.testsRun: " + err);
                return undefined;
            }
        },

        /*jslint bitwise: false */
        Aes: function (password, nBits, utf8encode) {
            try {
                utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
                password = utf8encode ? password.Utf8encode() : password;
                nBits = (nBits === 128 || nBits === 192 || nBits === 256) ? nBits : 256;
                var sBox = [
                        0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
                        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
                        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
                        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
                        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
                        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
                        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
                        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
                        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
                        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
                        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
                        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
                        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
                        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
                        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
                        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
                    ],
                    rCon = [
                        [0x00, 0x00, 0x00, 0x00],
                        [0x01, 0x00, 0x00, 0x00],
                        [0x02, 0x00, 0x00, 0x00],
                        [0x04, 0x00, 0x00, 0x00],
                        [0x08, 0x00, 0x00, 0x00],
                        [0x10, 0x00, 0x00, 0x00],
                        [0x20, 0x00, 0x00, 0x00],
                        [0x40, 0x00, 0x00, 0x00],
                        [0x80, 0x00, 0x00, 0x00],
                        [0x1b, 0x00, 0x00, 0x00],
                        [0x36, 0x00, 0x00, 0x00]
                    ];

                function subBytes(s, Nb) {
                    var r = 0,
                        c = 0;

                    for (r = 0; r < 4; r += 1) {
                        for (c = 0; c < Nb; c += 1) {
                            s[r][c] = sBox[s[r][c]];
                        }
                    }

                    return s;
                }

                function shiftRows(s, Nb) {
                    var t = new Array(4),
                        r = 1,
                        c = 0;

                    for (r = 1; r < 4; r += 1) {
                        for (c = 0; c < 4; c += 1) {
                            t[c] = s[r][(c + r) % Nb];
                        }

                        for (c = 0; c < 4; c += 1) {
                            s[r][c] = t[c];
                        }
                    }

                    return s;
                }

                function mixColumns(s, Nb) {
                    var c = 0,
                        a = [],
                        b = [],
                        i = 0;

                    for (c = 0; c < 4; c += 1) {
                        a = new Array(4);
                        b = new Array(4);
                        for (i = 0; i < 4; i += 1) {
                            a[i] = s[i][c];
                            b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;
                        }

                        s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
                        s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
                        s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
                        s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
                    }

                    return s;
                }

                function addRoundKey(state, w, rnd, Nb) {
                    var r = 0,
                        c = 0;

                    for (r = 0; r < 4; r += 1) {
                        for (c = 0; c < Nb; c += 1) {
                            state[r][c] ^= w[rnd * 4 + c][r];
                        }
                    }

                    return state;
                }

                function cipher(input, w) {
                    var Nb     = 4,
                        Nr     = w.length / Nb - 1,
                        state  = [[], [], [], []],
                        i      = 0,
                        round  = 1,
                        output = [];

                    for (i = 0; i < 4 * Nb; i += 1) {
                        state[i % 4][Math.floor(i / 4)] = input[i];
                    }

                    state = addRoundKey(state, w, 0, Nb);
                    for (round = 1; round < Nr; round += 1) {
                        state = subBytes(state, Nb);
                        state = shiftRows(state, Nb);
                        state = mixColumns(state, Nb);
                        state = addRoundKey(state, w, round, Nb);
                    }

                    state = subBytes(state, Nb);
                    state = shiftRows(state, Nb);
                    state = addRoundKey(state, w, Nr, Nb);
                    output = new Array(4 * Nb);
                    for (i = 0; i < 4 * Nb; i += 1) {
                        output[i] = state[i % 4][Math.floor(i / 4)];
                    }

                    return output;
                }

                function subWord(w) {
                    for (var i = 0; i < 4; i += 1) {
                        w[i] = sBox[w[i]];
                    }

                    return w;
                }

                function rotWord(w) {
                    var tmp = w[0],
                        i   = 0;

                    for (i = 0; i < 3; i += 1) {
                        w[i] = w[i + 1];
                    }

                    w[3] = tmp;
                    return w;
                }

                function keyExpansion(key) {
                    var Nb   = 4,
                        Nk   = key.length / 4,
                        Nr   = Nk + 6,
                        w    = new Array(Nb * (Nr + 1)),
                        temp = new Array(4),
                        i    = 0,
                        t    = 0;

                    for (i = 0; i < Nk; i += 1) {
                        w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
                    }

                    for (i = Nk; i < (Nb * (Nr + 1)); i += 1) {
                        w[i] = new Array(4);
                        for (t = 0; t < 4; t += 1) {
                            temp[t] = w[i - 1][t];
                        }

                        if (i % Nk === 0) {
                            temp = subWord(rotWord(temp));
                            for (t = 0; t < 4; t += 1) {
                                temp[t] ^= rCon[i / Nk][t];
                            }

                        } else if (Nk > 6 && i % Nk === 4) {
                            temp = subWord(temp);
                        }

                        for (t = 0; t < 4; t += 1) {
                            w[i][t] = w[i - Nk][t] ^ temp[t];
                        }
                    }

                    return w;
                }

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['encrypt'] = this.encrypt = function (plaintext) {
                /*jslint sub: false */
                    try {
                        plaintext = utf8encode ? plaintext.Utf8encode() : plaintext;
                        var blockSize    = 16,
                            nBytes       = nBits / 8,
                            pwBytes      = new Array(nBytes),
                            i            = 0,
                            counterBlock = new Array(blockSize),
                            nonce        = new Date().getTime(),
                            nonceSec     = Math.floor(nonce / 1000),
                            nonceMs      = nonce % 1000,
                            key          = [],
                            ctrTxt       = '',
                            keySchedule  = [],
                            blockCount   = 0,
                            ciphertxt    = [],
                            b            = 0,
                            c            = 0,
                            cipherCntr   = [],
                            blockLength  = 0,
                            cipherChar   = [],
                            ciphertext   = '';

                        for (i = 0; i < nBytes; i += 1) {
                            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
                        }

                        key = cipher(pwBytes, keyExpansion(pwBytes));
                        key = key.concat(key.slice(0, nBytes - 16));
                        for (i = 0; i < 4; i += 1) {
                            counterBlock[i] = (nonceSec >>> i * 8) & 0xff;
                        }

                        for (i = 0; i < 4; i += 1) {
                            counterBlock[i + 4] = nonceMs & 0xff;
                        }

                        for (i = 0; i < 8; i += 1) {
                            ctrTxt += String.fromCharCode(counterBlock[i]);
                        }

                        keySchedule = keyExpansion(key);
                        blockCount = Math.ceil(plaintext.length / blockSize);
                        ciphertxt = new Array(blockCount);
                        for (b = 0; b < blockCount; b += 1) {
                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c] = (b >>> c * 8) & 0xff;
                            }

                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
                            }

                            cipherCntr = cipher(counterBlock, keySchedule);
                            blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
                            cipherChar = new Array(blockLength);
                            for (i = 0; i < blockLength; i += 1) {
                                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                                cipherChar[i] = String.fromCharCode(cipherChar[i]);
                            }

                            ciphertxt[b] = cipherChar.join('');
                        }

                        ciphertext = ctrTxt + ciphertxt.join('');
                        ciphertext = ciphertext.Base64encode();
                        return ciphertext;
                    } catch (err) {
                        utility.error("ERROR in utility.Aes.encrypt: " + err);
                        return undefined;
                    }
                };

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['decrypt'] = this.decrypt = function (ciphertext) {
                /*jslint sub: false */
                    try {
                        ciphertext = ciphertext.Base64decode();
                        var blockSize    = 16,
                            nBytes       = nBits / 8,
                            pwBytes      = new Array(nBytes),
                            i            = 0,
                            key          = [],
                            counterBlock = [],
                            ctrTxt       = [],
                            keySchedule  = [],
                            nBlocks      = 0,
                            ct           = [],
                            b            = 0,
                            plaintxt     = [],
                            c            = 0,
                            cipherCntr   = [],
                            plaintxtByte = [],
                            plaintext    = '';

                        for (i = 0; i < nBytes; i += 1) {
                            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
                        }

                        key = cipher(pwBytes, keyExpansion(pwBytes));
                        key = key.concat(key.slice(0, nBytes - 16));
                        counterBlock = new Array(8);
                        ctrTxt = ciphertext.slice(0, 8);
                        for (i = 0; i < 8; i += 1) {
                            counterBlock[i] = ctrTxt.charCodeAt(i);
                        }

                        keySchedule = keyExpansion(key);
                        nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
                        ct = new Array(nBlocks);
                        for (b = 0; b < nBlocks; b += 1) {
                            ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
                        }

                        ciphertext = ct;
                        plaintxt = new Array(ciphertext.length);

                        for (b = 0; b < nBlocks; b += 1) {
                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
                            }

                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;
                            }

                            cipherCntr = cipher(counterBlock, keySchedule);
                            plaintxtByte = new Array(ciphertext[b].length);
                            for (i = 0; i < ciphertext[b].length; i += 1) {
                                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
                            }

                            plaintxt[b] = plaintxtByte.join('');
                        }

                        plaintext = plaintxt.join('');
                        plaintext = utf8encode ? plaintext.Utf8decode() : plaintext;
                        return plaintext;
                    } catch (err) {
                        utility.error("ERROR in utility.Aes.decrypt: " + err);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.Aes: " + err);
                return false;
            }
        },
        /*jslint bitwise: true */

        LZ77: function (settings) {
            try {
                settings = settings || {};
                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                var referencePrefix       = "`",
                    referenceIntBase      = settings['referenceIntBase'] || 96,
                    referenceIntFloorCode = " ".charCodeAt(0),
                    referenceIntCeilCode  = referenceIntFloorCode + referenceIntBase - 1,
                    maxStringDistance     = Math.pow(referenceIntBase, 2) - 1,
                    minStringLength       = settings['minStringLength'] || 5,
                    maxStringLength       = Math.pow(referenceIntBase, 1) - 1 + minStringLength,
                    defaultWindowLength   = settings['defaultWindowLength'] || 144,
                    maxWindowLength       = maxStringDistance + minStringLength;
                /*jslint sub: false */

                function encodeReferenceInt(value, width) {
                    if ((value >= 0) && (value < (Math.pow(referenceIntBase, width) - 1))) {
                        var encoded       = "",
                            i             = 0,
                            missingLength = 0,
                            mf            = Math.floor,
                            sc            = String.fromCharCode;

                        while (value > 0) {
                            encoded = sc((value % referenceIntBase) + referenceIntFloorCode) + encoded;
                            value = mf(value / referenceIntBase);
                        }

                        missingLength = width - encoded.length;
                        for (i = 0; i < missingLength; i += 1) {
                            encoded = sc(referenceIntFloorCode) + encoded;
                        }

                        return encoded;
                    } else {
                        throw "Reference int out of range: " + value + " (width = " + width + ")";
                    }
                }

                function encodeReferenceLength(length) {
                    return encodeReferenceInt(length - minStringLength, 1);
                }

                function decodeReferenceInt(data, width) {
                    var value    = 0,
                        i        = 0,
                        charCode = 0;

                    for (i = 0; i < width; i += 1) {
                        value *= referenceIntBase;
                        charCode = data.charCodeAt(i);
                        if ((charCode >= referenceIntFloorCode) && (charCode <= referenceIntCeilCode)) {
                            value += charCode - referenceIntFloorCode;
                        } else {
                            throw "Invalid char code in reference int: " + charCode;
                        }
                    }

                    return value;
                }

                function decodeReferenceLength(data) {
                    return decodeReferenceInt(data, 1) + minStringLength;
                }

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['compress'] = this.compress = function (data, windowLength) {
                /*jslint sub: false */
                    try {
                        windowLength = windowLength || defaultWindowLength;
                        if (windowLength > maxWindowLength) {
                            throw "Window length too large";
                        }

                        var compressed      = "",
                            pos             = 0,
                            lastPos         = data.length - minStringLength,
                            searchStart     = 0,
                            matchLength     = 0,
                            foundMatch      = false,
                            bestMatch       = {},
                            newCompressed   = null,
                            realMatchLength = 0,
                            mm              = Math.max,
                            dataCharAt      = 0;

                        while (pos < lastPos) {
                            searchStart = mm(pos - windowLength, 0);
                            matchLength = minStringLength;
                            foundMatch = false;
                            bestMatch = {
                                distance : maxStringDistance,
                                length   : 0
                            };

                            newCompressed = null;
                            while ((searchStart + matchLength) < pos) {
                                if ((matchLength < maxStringLength) && (data.substr(searchStart, matchLength) === data.substr(pos, matchLength))) {
                                    matchLength += 1;
                                    foundMatch = true;
                                } else {
                                    realMatchLength = matchLength - 1;
                                    if (foundMatch && (realMatchLength > bestMatch.length)) {
                                        bestMatch.distance = pos - searchStart - realMatchLength;
                                        bestMatch.length = realMatchLength;
                                    }

                                    matchLength = minStringLength;
                                    searchStart += 1;
                                    foundMatch = false;
                                }
                            }

                            if (bestMatch.length) {
                                newCompressed = referencePrefix + encodeReferenceInt(bestMatch.distance, 2) + encodeReferenceLength(bestMatch.length);
                                pos += bestMatch.length;
                            } else {
                                dataCharAt = data.charAt(pos);
                                if (dataCharAt !== referencePrefix) {
                                    newCompressed = dataCharAt;
                                } else {
                                    newCompressed = referencePrefix + referencePrefix;
                                }

                                pos += 1;
                            }

                            compressed += newCompressed;
                        }

                        return compressed + data.slice(pos).replace(/`/g, "``");
                    } catch (err) {
                        utility.error("ERROR in utility.LZ77.compress: " + err);
                        return undefined;
                    }
                };

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['decompress'] = this.decompress = function (data) {
                /*jslint sub: false */
                    try {
                        var decompressed = "",
                            pos          = 0,
                            currentChar  = '',
                            nextChar     = '',
                            distance     = 0,
                            length       = 0,
                            minStrLength = minStringLength - 1,
                            dataLength   = data.length,
                            posPlusOne   = 0;

                        while (pos < dataLength) {
                            currentChar = data.charAt(pos);
                            if (currentChar !== referencePrefix) {
                                decompressed += currentChar;
                                pos += 1;
                            } else {
                                posPlusOne = pos + 1;
                                nextChar = data.charAt(posPlusOne);
                                if (nextChar !== referencePrefix) {
                                    distance = decodeReferenceInt(data.substr(posPlusOne, 2), 2);
                                    length = decodeReferenceLength(data.charAt(pos + 3));
                                    decompressed += decompressed.substr(decompressed.length - distance - length, length);
                                    pos += minStrLength;
                                } else {
                                    decompressed += referencePrefix;
                                    pos += 2;
                                }
                            }
                        }

                        return decompressed;
                    } catch (err) {
                        utility.error("ERROR in utility.LZ77.decompress: " + err);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.LZ77: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        storage: function (settings) {
            try {
                settings = settings || {};
                var namespace = settings['namespace'] ? settings['namespace'] : '',
                    fireFoxUseGM = settings['fireFoxUseGM'] ? settings['fireFoxUseGM'] : false,
                    useRison = settings['useRison'] ? settings['useRison'] : true,
                    storage_id = settings['storage_id'] ? settings['storage_id'] : '',
                    storage_type = settings['storage_type'] ? settings['storage_type'] : 'localStorage';

                this['set_namespace'] = this.set_namespace = function (text) {
                    namespace = text;
                };

                this['get_namespace'] = this.get_namespace = function () {
                    return namespace;
                };

                this['set_storage_id'] = this.set_storage_id = function (text) {
                    storage_id = text;
                };

                this['get_storage_id'] = this.get_storage_id = function () {
                    return storage_id;
                };

                this['set_fireFoxUseGM'] = this.set_fireFoxUseGM = function (bool) {
                    fireFoxUseGM = bool;
                };

                this['get_fireFoxUseGM'] = this.get_fireFoxUseGM = function () {
                    return fireFoxUseGM;
                };

                this['set_useRison'] = this.set_useRison = function (bool) {
                    useRison = bool;
                };

                this['get_useRison'] = this.get_useRison = function () {
                    return useRison;
                };

                // use these to set/get values in a way that prepends the game's name
                this['setItem'] = this.setItem = function (name, value, hpack, compress) {
                    try {
                        var stringified = '',
                            compressor  = null,
                            storageStr  = '',
                            hpackArr    = [],
                            reportEnc   = 'JSON.stringify',
                            storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');

                        if (typeof name !== 'string' || name === '') {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        if (value === undefined || value === null) {
                            throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
                        }

                        if (useRison) {
                            reportEnc = "rison.encode";
                        }

                        hpack = (typeof hpack !== 'number') ? false : hpack;
                        if (hpack !== false && hpack >= 0 && hpack <= 3) {
                            hpackArr = JSON.hpack(value, hpack);
                            if (useRison) {
                                stringified = rison.encode(hpackArr);
                            } else {
                                stringified = JSON.stringify(hpackArr);
                            }

                            if (stringified === undefined || stringified === null) {
                                throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                            }

                            if (useRison) {
                                stringified = "R-HPACK " + stringified;
                            } else {
                                stringified = "HPACK " + stringified;
                            }
                        } else {
                            if (useRison) {
                                stringified = rison.encode(value);
                            } else {
                                stringified = JSON.stringify(value);
                            }

                            if (stringified === undefined || stringified === null) {
                                throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                            }

                            if (useRison) {
                                stringified = "RISON " + stringified;
                            }
                        }

                        compress = (typeof compress !== 'boolean') ? false : compress;
                        if (compress) {
                            compressor = new utility.LZ77();
                            storageStr = "LZ77 " + compressor.compress(stringified);
                            utility.log(2, "Compressed storage", name, ((storageStr.length / stringified.length) * 100).dp(2));
                        } else {
                            storageStr = stringified;
                        }

                        if (utility["is_html5_" + storage_type] && !fireFoxUseGM) {
                            window[storage_type].setItem(storage_ref + name, storageStr);
                        } else {
                            GM_setValue(storage_ref + name, storageStr);
                        }

                        return value;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.setItem: " + error, {'name': name, 'value': value}, arguments.callee.caller);
                        return undefined;
                    }
                };

                this['getItem'] = this.getItem = function (name, value, hidden) {
                    try {
                        var jsObj       = null,
                            compressor  = null,
                            storageStr  = '',
                            storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');

                        if (typeof name !== 'string' || name === '') {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        if (utility["is_html5_" + storage_type] && !fireFoxUseGM) {
                            storageStr = window[storage_type].getItem(storage_ref + name);
                        } else {
                            storageStr = GM_getValue(storage_ref + name);
                        }

                        if (storageStr) {
                            if (storageStr.match(/^LZ77 /)) {
                                compressor = new utility.LZ77();
                                storageStr = compressor.decompress(storageStr.slice(5));
                                utility.log(2, "Decompressed storage", name);
                            }

                            if (storageStr) {
                                if (storageStr.match(/^R-HPACK /)) {
                                    jsObj = JSON.hunpack(rison.decode(storageStr.slice(8)));
                                } else if (storageStr.match(/^RISON /)) {
                                    jsObj = rison.decode(storageStr.slice(6));
                                } else if (storageStr.match(/^HPACK /)) {
                                    jsObj = JSON.hunpack(JSON.parse(storageStr.slice(6)));
                                } else {
                                    jsObj = JSON.parse(storageStr);
                                }
                            }
                        }

                        if (jsObj === undefined || jsObj === null) {
                            if (!hidden) {
                                utility.warn("utility.storage.getItem parsed string returned 'undefined' or 'null' for ", name);
                            }

                            if (value !== undefined && value !== null) {
                                hidden = (typeof hidden !== 'boolean') ? false : hidden;
                                if (!hidden) {
                                    utility.warn("utility.storage.getItem using default value ", value);
                                }

                                jsObj = value;
                            } else {
                                throw "No default value supplied! (" + value + ")";
                            }
                        }

                        return jsObj;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.getItem: " + error, arguments.callee.caller);
                        if (error.match(/Invalid JSON/)) {
                            if (value !== undefined && value !== null) {
                                utility.storage.setItem(name, value);
                                return value;
                            } else {
                                utility.storage.deleteItem(name);
                            }
                        }

                        return undefined;
                    }
                };

                this['deleteItem'] = this.deleteItem = function (name) {
                    try {
                        var storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');
                        if (typeof name !== 'string' || name === '') {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        if (utility["is_html5_" + storage_type] && !fireFoxUseGM) {
                            window[storage_type].removeItem(storage_ref + name);
                        } else {
                            GM_deleteValue(storage_ref + name);
                        }

                        return true;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.deleteItem: " + error, arguments.callee.caller);
                        return false;
                    }
                };

                this['clear'] = this.clear = function (id) {
                    try {
                        var storageKeys = [],
                            key         = 0,
                            len         = 0,
                            done        = false,
                            storage_ref = (namespace ? namespace + "." : '') + (id ? id : (storage_id ? storage_id + "." : '')),
                            nameRegExp  = new RegExp(storage_ref);

                        if (utility["is_html5_" + storage_type] && !fireFoxUseGM) {
                            if (utility.is_firefox) {
                                while (!done) {
                                    try {
                                        if (window[storage_type].key(key) && window[storage_type].key(key).match(nameRegExp)) {
                                            window[storage_type].removeItem(window[storage_type].key(key));
                                        }

                                        key += 1;
                                    } catch (e) {
                                        done = true;
                                    }
                                }
                            } else {
                                for (key = 0, len = window[storage_type].length; key < len; key += 1) {
                                    if (window[storage_type].key(key) && window[storage_type].key(key).match(nameRegExp)) {
                                        window[storage_type].removeItem(window[storage_type].key(key));
                                    }
                                }
                            }
                        } else {
                            storageKeys = GM_listValues();
                            for (key = 0, len = storageKeys.length; key < len; key += 1) {
                                if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                                    GM_deleteValue(storageKeys[key]);
                                }
                            }
                        }

                        return true;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.clear: " + error, arguments.callee.caller);
                        return false;
                    }
                };

                this['used'] = this.used = function (id) {
                    try {
                        var storageKeys = [],
                            key         = 0,
                            len         = 0,
                            charCnt     = 0,
                            chars       = 0,
                            done        = false,
                            storage_ref = (namespace ? namespace + "." : '') + (id ? id : (storage_id ? storage_id + "." : '')),
                            nameRegExp  = new RegExp(storage_ref);

                        if (utility["is_html5_" + storage_type] && !fireFoxUseGM) {
                            if (utility.is_firefox) {
                                while (!done) {
                                    try {
                                        chars += window[storage_type].getItem(window[storage_type].key(key)).length;
                                        if (window[storage_type].key(key).match(nameRegExp)) {
                                            charCnt += window[storage_type].getItem(window[storage_type].key(key)).length;
                                        }

                                        key += 1;
                                    } catch (e) {
                                        done = true;
                                    }
                                }

                            } else {
                                for (key = 0, len = window[storage_type].length; key < len; key += 1) {
                                    chars += window[storage_type].getItem(window[storage_type].key(key)).length;
                                    if (window[storage_type].key(key).match(nameRegExp)) {
                                        charCnt += window[storage_type].getItem(window[storage_type].key(key)).length;
                                    }
                                }
                            }
                        } else {
                            storageKeys = GM_listValues();
                            for (key = 0, len = storageKeys.length; key < len; key += 1) {
                                chars += GM_getValue(storageKeys[key]).length;
                                if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                                    charCnt += GM_getValue(storageKeys[key]).length;
                                }
                            }
                        }

                        return {'match': charCnt, 'total': chars};
                    } catch (error) {
                        utility.error("ERROR in utility.storage.used: " + error, arguments.callee.caller);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.storage: " + err);
                return false;
            }
        }
        /*jslint sub: false */
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    if (!window['utility']) {
        window['utility'] = window.utility = window.$u = utility;
        utility['jQueryExtend'] = utility.jQueryExtend;
        utility['is_chrome'] = utility.is_chrome;
        utility['is_firefox'] = utility.is_firefox;
        utility['is_html5_localStorage'] = utility.is_html5_localStorage;
        utility['is_html5_sessionStorage'] = utility.is_html5_sessionStorage;
        utility['injectScript'] = utility.injectScript;
        utility['isNum'] = utility.isNum;
        utility['alert'] = utility.alert;
        utility['set_log_version'] = utility.set_log_version;
        utility['get_log_version'] = utility.get_log_version;
        utility['set_log_level'] = utility.set_log_level;
        utility['get_log_level'] = utility.get_log_level;
        utility['log_common'] = utility.log_common;
        utility['log'] = utility.log;
        utility['warn'] = utility.warn;
        utility['error'] = utility.error;
        utility['charPrintables'] = utility.charPrintables;
        utility['charNonPrintables'] = utility.charNonPrintables;
        utility['testMD5'] = utility.testMD5;
        utility['testSHA1'] = utility.testSHA1;
        utility['testSHA256'] = utility.testSHA256;
        utility['testUTF8'] = utility.testUTF8;
        utility['testBase64'] = utility.testBase64;
        utility['testAes'] = utility.testAes;
        utility['testLZ77'] = utility.testLZ77;
        utility['testAes'] = utility.testAes;
        utility['testsRun'] = utility.testsRun;
        utility['Aes'] = utility.Aes;
        utility['LZ77'] = utility.LZ77;
        utility['storage'] = utility.storage;
    }
    /*jslint sub: false */
}());