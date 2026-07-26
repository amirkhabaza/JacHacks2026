import {__jacJsx} from "@jac/runtime";
const _jac = {
  int: {
    bit_length(n) {
      if (n === 0) return 0;
      return Math.floor(Math.log2(Math.abs(n))) + 1;
    },
    bit_count(n) {
      let x = Math.abs(n);
      let count = 0;
      while (x) { count += x & 1; x >>= 1; }
      return count;
    },
    to_bytes(n, length, byteorder) {
      const bytes = [];
      let val = n < 0 ? (1 << (length * 8)) + n : n;
      for (let i = 0; i < length; i++) {
        bytes.push(val & 0xff);
        val >>= 8;
      }
      if (byteorder === "big") bytes.reverse();
      return bytes;
    },
    from_bytes(bytes, byteorder) {
      const b = byteorder === "big" ? bytes : [...bytes].reverse();
      let result = 0;
      for (const byte of b) result = (result << 8) | byte;
      return result;
    },
    mod(a, b) { return ((a % b) + b) % b; }
  },

  float: {
    as_integer_ratio(f) {
      if (!isFinite(f)) throw new _jac.exc.ValueError("cannot convert " + f + " to integer ratio");
      if (f === 0) return [0, 1];
      let num = f, den = 1;
      while (num !== Math.floor(num)) { num *= 2; den *= 2; }
      const g = _jac.float._gcd(Math.abs(num), den);
      return [num / g, den / g];
    },
    _gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; },
    hex(f) {
      return f.toString(16);
    },
    fromhex(s) {
      return parseFloat(s);
    },
    mod(a, b) { return ((a % b) + b) % b; }
  },

  complex: {
    conjugate(c) { return {re: c.re, im: -c.im}; },
    add(a, b) { return {re: a.re + b.re, im: a.im + b.im}; },
    sub(a, b) { return {re: a.re - b.re, im: a.im - b.im}; },
    mul(a, b) { return {re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re}; },
    truediv(a, b) {
      const d = b.re * b.re + b.im * b.im;
      return {re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d};
    },
    pow(a, b) {
      if (typeof b === "number") b = {re: b, im: 0};
      if (typeof a === "number") a = {re: a, im: 0};
      if (b.im === 0 && Number.isInteger(b.re)) {
        let result = {re: 1, im: 0};
        for (let i = 0; i < Math.abs(b.re); i++) result = _jac.complex.mul(result, a);
        return b.re < 0 ? _jac.complex.truediv({re: 1, im: 0}, result) : result;
      }
      const r = Math.sqrt(a.re * a.re + a.im * a.im);
      const theta = Math.atan2(a.im, a.re);
      const lnr = Math.log(r);
      const newR = Math.exp(lnr * b.re - theta * b.im);
      const newTheta = lnr * b.im + theta * b.re;
      return {re: newR * Math.cos(newTheta), im: newR * Math.sin(newTheta)};
    },
    eq(a, b) {
      if (typeof b === "number") b = {re: b, im: 0};
      if (typeof a === "number") a = {re: a, im: 0};
      return a.re === b.re && a.im === b.im;
    },
    neg(a) { return {re: -a.re, im: -a.im}; },
    pos(a) { return {re: +a.re, im: +a.im}; }
  },

  str: {
    capitalize(s) {
      if (s.length === 0) return s;
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    },
    title(s) {
      return s.replace(/\b\w/g, c => c.toUpperCase());
    },
    swapcase(s) {
      return [...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    },
    count(s, sub, start, end) {
      const t = s.slice(start || 0, end);
      if (sub === "") return t.length + 1;
      let count = 0, pos = 0;
      while ((pos = t.indexOf(sub, pos)) !== -1) { count++; pos += sub.length; }
      return count;
    },
    find(s, sub, start, end) {
      const t = s.slice(start || 0, end);
      const idx = t.indexOf(sub);
      return idx === -1 ? -1 : idx + (start || 0);
    },
    rfind(s, sub, start, end) {
      const t = s.slice(start || 0, end);
      const idx = t.lastIndexOf(sub);
      return idx === -1 ? -1 : idx + (start || 0);
    },
    index(s, sub, start, end) {
      const idx = _jac.str.find(s, sub, start, end);
      if (idx === -1) throw new _jac.exc.ValueError("substring not found");
      return idx;
    },
    rindex(s, sub, start, end) {
      const idx = _jac.str.rfind(s, sub, start, end);
      if (idx === -1) throw new _jac.exc.ValueError("substring not found");
      return idx;
    },
    startswith(s, prefix, start, end) {
      return s.slice(start || 0, end).startsWith(prefix);
    },
    endswith(s, suffix, start, end) {
      return s.slice(start || 0, end).endsWith(suffix);
    },
    replace(s, old, new_, count) {
      if (count === undefined) return s.split(old).join(new_);
      let result = s, n = 0;
      while (n < count) {
        const idx = result.indexOf(old);
        if (idx === -1) break;
        result = result.slice(0, idx) + new_ + result.slice(idx + old.length);
        n++;
      }
      return result;
    },
    strip(s, chars) {
      if (!chars) return s.trim();
      let start = 0, end = s.length;
      while (start < end && chars.indexOf(s[start]) !== -1) start++;
      while (end > start && chars.indexOf(s[end - 1]) !== -1) end--;
      return s.slice(start, end);
    },
    lstrip(s, chars) {
      if (!chars) return s.trimStart();
      let start = 0;
      while (start < s.length && chars.indexOf(s[start]) !== -1) start++;
      return s.slice(start);
    },
    rstrip(s, chars) {
      if (!chars) return s.trimEnd();
      let end = s.length;
      while (end > 0 && chars.indexOf(s[end - 1]) !== -1) end--;
      return s.slice(0, end);
    },
    removeprefix(s, prefix) {
      return s.startsWith(prefix) ? s.slice(prefix.length) : s;
    },
    removesuffix(s, suffix) {
      return (suffix && s.endsWith(suffix)) ? s.slice(0, -suffix.length) : s;
    },
    split(s, sep, maxsplit) {
      if (sep === undefined || sep === null) {
        const parts = s.trim().split(/\s+/);
        if (maxsplit === undefined) return parts;
        if (maxsplit <= 0) return [s];
        return [...parts.slice(0, maxsplit), parts.slice(maxsplit).join(" ")].filter(x => x !== undefined);
      }
      if (maxsplit === undefined) return s.split(sep);
      const parts = s.split(sep);
      if (parts.length <= maxsplit + 1) return parts;
      return [...parts.slice(0, maxsplit), parts.slice(maxsplit).join(sep)];
    },
    rsplit(s, sep, maxsplit) {
      if (maxsplit === undefined) return _jac.str.split(s, sep);
      const parts = s.split(sep);
      if (parts.length <= maxsplit + 1) return parts;
      const keep = parts.length - maxsplit;
      return [parts.slice(0, keep).join(sep), ...parts.slice(keep)];
    },
    splitlines(s, keepends) {
      const lines = s.split(/(\r\n|\r|\n)/);
      const result = [];
      for (let i = 0; i < lines.length; i += 2) {
        const line = lines[i];
        const sep = lines[i + 1] || "";
        if (line || sep) result.push(keepends ? line + sep : line);
      }
      return result;
    },
    partition(s, sep) {
      const idx = s.indexOf(sep);
      if (idx === -1) return [s, "", ""];
      return [s.slice(0, idx), sep, s.slice(idx + sep.length)];
    },
    rpartition(s, sep) {
      const idx = s.lastIndexOf(sep);
      if (idx === -1) return ["", "", s];
      return [s.slice(0, idx), sep, s.slice(idx + sep.length)];
    },
    format(s, ...args) {
      let i = 0;
      return s.replace(/\{(\w*)\}/g, (match, key) => {
        if (key === "") return args[i++];
        if (!isNaN(key)) return args[parseInt(key)];
        return args[0] && typeof args[0] === "object" ? args[0][key] : match;
      });
    },
    format_map(s, mapping) {
      return s.replace(/\{(\w+)\}/g, (match, key) => key in mapping ? mapping[key] : match);
    },
    center(s, width, fillchar) {
      const fc = fillchar || " ";
      if (s.length >= width) return s;
      const total = width - s.length;
      const left = Math.floor(total / 2);
      return fc.repeat(left) + s + fc.repeat(total - left);
    },
    zfill(s, width) {
      if (s.length >= width) return s;
      const sign = (s[0] === "+" || s[0] === "-") ? s[0] : "";
      const body = sign ? s.slice(1) : s;
      return sign + "0".repeat(width - s.length) + body;
    },
    expandtabs(s, tabsize) {
      const ts = tabsize === undefined ? 8 : tabsize;
      let result = "", col = 0;
      for (const c of s) {
        if (c === "\t") { const sp = ts - (col % ts); result += " ".repeat(sp); col += sp; }
        else if (c === "\n" || c === "\r") { result += c; col = 0; }
        else { result += c; col++; }
      }
      return result;
    },
    isnumeric(s) {
      if (s.length === 0) return false;
      return [...s].every(c => /[\d\u00B2\u00B3\u00B9\u00BC-\u00BE\u2150-\u218F]/.test(c));
    },
    istitle(s) {
      return s === _jac.str.title(s) && /[A-Za-z]/.test(s);
    },
    translate(s, table) {
      return [...s].map(c => {
        const code = c.charCodeAt(0);
        if (code in table) {
          const v = table[code];
          if (v === null) return "";
          if (typeof v === "number") return String.fromCharCode(v);
          return v;
        }
        return c;
      }).join("");
    },
    maketrans(...args) {
      const table = {};
      if (args.length === 1) {
        const mapping = args[0];
        for (const [k, v] of Object.entries(mapping)) {
          table[typeof k === "string" ? k.charCodeAt(0) : k] = v;
        }
      } else if (args.length >= 2) {
        const from_ = args[0], to_ = args[1];
        for (let i = 0; i < from_.length; i++) {
          table[from_.charCodeAt(i)] = to_.charCodeAt(i);
        }
        if (args[2]) {
          for (const c of args[2]) table[c.charCodeAt(0)] = null;
        }
      }
      return table;
    },
    mod(s, args) {
      let i = 0;
      const a = Array.isArray(args) ? args : [args];
      return s.replace(/%([sd%])/g, (m, fmt) => {
        if (fmt === "%") return "%";
        return String(a[i++]);
      });
    }
  },

  // Runtime-polymorphic method dispatch, used when the codegen cannot prove
  // the static type of a method-call receiver (e.g. a `dict`-typed prop, the
  // result of `or` widening, or a comprehension over an untyped value) and so
  // cannot pick a typed emitter. The compiler emits
  // `_jac.poly.call(obj, "name", ...args)`; `call` resolves the *runtime* type
  // of `obj` and applies the matching Python operation, forwards to a
  // same-named method on a user-defined object, or raises AttributeError. The
  // per-type tables below carry the trivial native-mapped methods inline and
  // delegate the non-trivial ones to the shared `_jac.str/list/dict/set`
  // helpers, so each operation has a single implementation and no Python
  // method name can leak verbatim into the emitted JavaScript.
  poly: {
    _typename(o) {
      if (o === null || o === undefined) return "NoneType";
      if (Array.isArray(o)) return "list";
      if (o instanceof Set) return "set";
      if (o instanceof Map) return "dict";
      if (o instanceof Uint8Array) return "bytes";
      const t = typeof o;
      if (t === "string") return "str";
      if (t === "boolean") return "bool";
      if (t === "number") return Number.isInteger(o) ? "int" : "float";
      if (t === "object") return (o.constructor && o.constructor.name) || "object";
      return t;
    },
    // --- per-runtime-type Python method tables (keyed by Python name) ---
    // Trivial native-mapped ops are inline; non-trivial ones delegate to the
    // shared `_jac.<type>` helpers (which the typed emitters also use), so the
    // typed and polymorphic paths share one implementation.
    _str: {
      lower: (s) => s.toLowerCase(),
      upper: (s) => s.toUpperCase(),
      casefold: (s) => s.toLowerCase(),
      strip: (s, chars) => {
        if (chars === undefined) return s.trim();
        let i = 0, j = s.length;
        while (i < j && chars.indexOf(s[i]) !== -1) i++;
        while (j > i && chars.indexOf(s[j - 1]) !== -1) j--;
        return s.slice(i, j);
      },
      lstrip: (s, chars) => {
        if (chars === undefined) return s.replace(/^\s+/, "");
        let i = 0;
        while (i < s.length && chars.indexOf(s[i]) !== -1) i++;
        return s.slice(i);
      },
      rstrip: (s, chars) => {
        if (chars === undefined) return s.replace(/\s+$/, "");
        let j = s.length;
        while (j > 0 && chars.indexOf(s[j - 1]) !== -1) j--;
        return s.slice(0, j);
      },
      join: (s, parts) => Array.from(parts, x => String(x)).join(s)
    },
    _list: {
      append: (a, x) => { a.push(x); return null; },
      clear: (a) => { a.length = 0; return null; },
      copy: (a) => a.slice(),
      count: (a, x) => _jac.list.count(a, x),
      extend: (a, b) => { for (const v of b) a.push(v); return null; },
      index: (a, x, start, end) => _jac.list.index(a, x, start, end),
      insert: (a, i, x) => { a.splice(i, 0, x); return null; },
      pop: (a, i) => {
        if (i === undefined) return a.pop();
        const idx = i < 0 ? a.length + i : i;
        return a.splice(idx, 1)[0];
      },
      remove: (a, x) => _jac.list.remove(a, x),
      reverse: (a) => { a.reverse(); return null; },
      sort: (a, key) => _jac.list.sort(a, key)
    },
    _dict: {
      clear: (o) => _jac.dict.clear(o),
      copy: (o) => ({ ...o }),
      // Python `dict.get`: returns the stored value when the key is present
      // (even if it is null), and the default only when the key is absent.
      // A membership check is required — `o[key] ?? default_` would wrongly
      // substitute the default for a present-but-null value.
      get: (o, key, default_) =>
        Object.prototype.hasOwnProperty.call(o, key) ? o[key] : default_,
      items: (o) => Object.entries(o),
      keys: (o) => Object.keys(o),
      pop: (o, key, default_) => _jac.dict.pop(o, key, default_),
      popitem: (o) => _jac.dict.popitem(o),
      setdefault: (o, key, default_) => _jac.dict.setdefault(o, key, default_),
      update: (o, other) => {
        if (other instanceof Map) { for (const [k, v] of other) o[k] = v; }
        else if (Array.isArray(other)) { for (const [k, v] of other) o[k] = v; }
        else if (other) { for (const k of Object.keys(other)) o[k] = other[k]; }
        return null;
      },
      values: (o) => Object.values(o)
    },
    _set: {
      add: (s, x) => { s.add(x); return null; },
      clear: (s) => { s.clear(); return null; },
      copy: (s) => new Set(s),
      difference: (a, b) => _jac.set.difference(a, b),
      difference_update: (s, o) => _jac.set.difference_update(s, o),
      discard: (s, x) => { s.delete(x); return null; },
      intersection: (a, b) => _jac.set.intersection(a, b),
      intersection_update: (s, o) => _jac.set.intersection_update(s, o),
      isdisjoint: (a, b) => _jac.set.isDisjointFrom(a, b instanceof Set ? b : new Set(b)),
      issubset: (a, b) => _jac.set.isSubsetOf(a, b instanceof Set ? b : new Set(b)),
      issuperset: (a, b) => _jac.set.isSupersetOf(a, b instanceof Set ? b : new Set(b)),
      pop: (s) => _jac.set.pop(s),
      remove: (s, x) => _jac.set.remove(s, x),
      symmetric_difference: (a, b) => _jac.set.symmetricDifference(a, b),
      symmetric_difference_update: (s, o) => _jac.set.symmetric_difference_update(s, o),
      union: (a, b) => _jac.set.union(a, b),
      update: (s, o) => _jac.set.update(s, o)
    },
    // Jac dicts compile to plain objects, but interop code may hand us a real
    // Map; mirror the dict methods over the Map API for that case.
    _map: {
      clear: (m) => { m.clear(); return null; },
      copy: (m) => new Map(m),
      get: (m, key, default_) => (m.has(key) ? m.get(key) : default_),
      items: (m) => [...m.entries()],
      keys: (m) => [...m.keys()],
      pop: (m, key, default_) => {
        if (m.has(key)) { const v = m.get(key); m.delete(key); return v; }
        if (default_ !== undefined) return default_;
        throw new _jac.exc.KeyError("KeyError: " + key);
      },
      popitem: (m) => {
        if (m.size === 0) throw new _jac.exc.KeyError("dictionary is empty");
        const key = [...m.keys()].pop();
        const val = m.get(key);
        m.delete(key);
        return [key, val];
      },
      setdefault: (m, key, default_) => {
        if (!m.has(key)) m.set(key, default_ === undefined ? null : default_);
        return m.get(key);
      },
      update: (m, other) => {
        if (other instanceof Map) { for (const [k, v] of other) m.set(k, v); }
        else if (Array.isArray(other)) { for (const [k, v] of other) m.set(k, v); }
        else if (other) { for (const k of Object.keys(other)) m.set(k, other[k]); }
        return null;
      },
      values: (m) => [...m.values()]
    },
    // Single entry point. `obj.method(...args)` on a receiver whose static
    // type is not provably primitive is compiled to
    // `_jac.poly.call(obj, "method", ...args)`.
    call(o, m, ...args) {
      // 1. Genuine JS primitives get Python-semantic dispatch: a plain object
      //    is a Python dict, an Array is a list, a Set/Map/string/number/bytes
      //    maps to its Python counterpart. These are the types whose Python
      //    method semantics differ from (or have no) native JS equivalent.
      if (typeof o === "string") {
        if (_jac.poly._str[m]) return _jac.poly._str[m](o, ...args);
        if (_jac.str[m]) return _jac.str[m](o, ...args);
      } else if (typeof o === "number") {
        const ns = Number.isInteger(o) ? _jac.int : _jac.float;
        if (ns && ns[m]) return ns[m](o, ...args);
      } else if (Array.isArray(o)) {
        if (_jac.poly._list[m]) return _jac.poly._list[m](o, ...args);
      } else if (o instanceof Set) {
        if (_jac.poly._set[m]) return _jac.poly._set[m](o, ...args);
      } else if (o instanceof Map) {
        if (_jac.poly._map[m]) return _jac.poly._map[m](o, ...args);
      } else if (o instanceof Uint8Array) {
        if (_jac.bytes[m]) return _jac.bytes[m](o, ...args);
      } else if (
        o !== null && o !== undefined && typeof o === "object"
        && (Object.getPrototypeOf(o) === Object.prototype
            || Object.getPrototypeOf(o) === null)
      ) {
        // A plain object is a Python dict literal.
        if (_jac.poly._dict[m]) return _jac.poly._dict[m](o, ...args);
      }
      // 2. Otherwise forward to a same-named method the receiver carries
      //    itself: a user-defined class instance, a host/framework object
      //    (Headers, URLSearchParams, ...), a callable with attached methods,
      //    or a Set/Map/Array method not mirrored above. This matches the
      //    direct `obj.method(...)` that a typed call would have emitted.
      if (o !== null && o !== undefined && typeof o[m] === "function") {
        return o[m](...args);
      }
      // 3. Nothing applies: raise the Python-style error instead of leaking a
      //    method name or silently returning a wrong value.
      throw new _jac.exc.AttributeError(
        "'" + _jac.poly._typename(o) + "' object has no attribute '" + m + "'");
    },
    // Backward-compatible named shims. The compiler now emits `call`, but a
    // previously-built bundle may still reference a named helper; these route
    // it through the same dispatcher (rest params preserve the arg count).
    lower(s, ...r) { return _jac.poly.call(s, "lower", ...r); },
    upper(s, ...r) { return _jac.poly.call(s, "upper", ...r); },
    strip(s, ...r) { return _jac.poly.call(s, "strip", ...r); },
    lstrip(s, ...r) { return _jac.poly.call(s, "lstrip", ...r); },
    rstrip(s, ...r) { return _jac.poly.call(s, "rstrip", ...r); },
    append(a, ...r) { return _jac.poly.call(a, "append", ...r); },
    extend(a, ...r) { return _jac.poly.call(a, "extend", ...r); },
    pop(a, ...r) { return _jac.poly.call(a, "pop", ...r); },
    get(o, ...r) { return _jac.poly.call(o, "get", ...r); },
    contains(c, x) {
      // Python-equivalent membership for a value of unknown static type.
      // string -> substring; array (list/tuple/range) -> element;
      // Set/Map -> key/element; plain object (dict) -> own key.
      if (typeof c === "string") return c.includes(x);
      if (Array.isArray(c)) return c.includes(x);
      if (c instanceof Set || c instanceof Map) return c.has(x);
      if (c !== null && typeof c === "object") {
        return Object.prototype.hasOwnProperty.call(c, x);
      }
      return false;
    },
    getitem(c, i) {
      // Subscript read for a value of unknown static type. This is a faithful
      // superset of a raw `c[i]`: it only adds Python's negative indexing for
      // sequences (string/array) and otherwise preserves JS semantics exactly
      // (mapping/object access, out-of-range -> `undefined`, no new throws).
      if (typeof i === "number" && i < 0
          && (typeof c === "string" || Array.isArray(c))) {
        return c[c.length + i];
      }
      if (c instanceof Map) return c.get(i);
      return c[i];
    },
    setitem(c, i, v) {
      // Subscript assignment for a value of unknown/list static type. A
      // negative index writes the array element counted from the end (a raw
      // JS `c[-1] = v` would instead create a bogus "-1" property); every
      // other case behaves like a plain `c[i] = v`.
      if (typeof i === "number" && i < 0 && Array.isArray(c)) {
        c[c.length + i] = v;
        return v;
      }
      if (c instanceof Map) { c.set(i, v); return v; }
      c[i] = v;
      return v;
    },
    and_(a, bf) {
      // Python `a and b`: returns `a` when it is falsy, else evaluates and
      // returns `b`. `bf` is a thunk so the right operand keeps short-circuit
      // (lazy) evaluation, and `a` is evaluated exactly once by the caller.
      return _jac.builtin.bool(a) ? bf() : a;
    },
    or_(a, bf) {
      // Python `a or b`: returns `a` when it is truthy, else `b`.
      return _jac.builtin.bool(a) ? a : bf();
    }
  },

  list: {
    remove(arr, val) {
      const i = arr.indexOf(val);
      if (i === -1) throw new _jac.exc.ValueError("list.remove(x): x not in list");
      arr.splice(i, 1);
    },
    index(arr, val, start, end) {
      const s = start || 0;
      const e = end === undefined ? arr.length : end;
      for (let i = s; i < e; i++) {
        if (arr[i] === val) return i;
      }
      throw new _jac.exc.ValueError(val + " is not in list");
    },
    count(arr, val) {
      let c = 0;
      for (const item of arr) { if (item === val) c++; }
      return c;
    },
    sort(arr, key) {
      if (key) {
        arr.sort((a, b) => {
          const ka = key(a), kb = key(b);
          return ka < kb ? -1 : ka > kb ? 1 : 0;
        });
      } else {
        arr.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      }
    },
    repeat(arr, n) {
      const result = [];
      for (let i = 0; i < n; i++) result.push(...arr);
      return result;
    },
    eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); },
    lt(a, b) {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] < b[i]) return true;
        if (a[i] > b[i]) return false;
      }
      return a.length < b.length;
    },
    gt(a, b) { return _jac.list.lt(b, a); },
    le(a, b) { return _jac.list.eq(a, b) || _jac.list.lt(a, b); },
    ge(a, b) { return _jac.list.eq(a, b) || _jac.list.gt(a, b); },
    imul(arr, n) {
      const orig = [...arr];
      arr.length = 0;
      for (let i = 0; i < n; i++) arr.push(...orig);
      return arr;
    }
  },

  dict: {
    pop(d, key, default_) {
      if (key in d) { const v = d[key]; delete d[key]; return v; }
      if (default_ !== undefined) return default_;
      throw new _jac.exc.KeyError("KeyError: " + key);
    },
    popitem(d) {
      const keys = Object.keys(d);
      if (keys.length === 0) throw new _jac.exc.KeyError("dictionary is empty");
      const key = keys[keys.length - 1];
      const val = d[key];
      delete d[key];
      return [key, val];
    },
    setdefault(d, key, default_) {
      if (!(key in d)) d[key] = default_ === undefined ? null : default_;
      return d[key];
    },
    clear(d) {
      for (const key of Object.keys(d)) delete d[key];
    },
    fromkeys(keys, value) {
      const d = {};
      const v = value === undefined ? null : value;
      for (const k of keys) d[k] = v;
      return d;
    },
    eq(a, b) {
      const ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (const k of ka) {
        if (!(k in b)) return false;
        const va = a[k], vb = b[k];
        if (va !== vb) {
          if (typeof va === "object" && typeof vb === "object" && va !== null && vb !== null) {
            if (JSON.stringify(va) !== JSON.stringify(vb)) return false;
          } else return false;
        }
      }
      return true;
    }
  },

  set: {
    remove(s, val) {
      if (!s.has(val)) throw new _jac.exc.KeyError("KeyError: " + val);
      s.delete(val);
    },
    pop(s) {
      if (s.size === 0) throw new _jac.exc.KeyError("pop from an empty set");
      const val = s.values().next().value;
      s.delete(val);
      return val;
    },
    update(s, other) { for (const v of other) s.add(v); },
    intersection_update(s, other) {
      const otherSet = other instanceof Set ? other : new Set(other);
      for (const v of s) { if (!otherSet.has(v)) s.delete(v); }
    },
    difference_update(s, other) {
      for (const v of other) s.delete(v);
    },
    symmetric_difference_update(s, other) {
      for (const v of other) { if (s.has(v)) s.delete(v); else s.add(v); }
    },
    union(a, b) {
      const r = new Set(a);
      for (const v of b) r.add(v);
      return r;
    },
    intersection(a, b) {
      const bs = b instanceof Set ? b : new Set(b);
      const r = new Set();
      for (const v of a) { if (bs.has(v)) r.add(v); }
      return r;
    },
    difference(a, b) {
      const bs = b instanceof Set ? b : new Set(b);
      const r = new Set();
      for (const v of a) { if (!bs.has(v)) r.add(v); }
      return r;
    },
    symmetricDifference(a, b) {
      const r = new Set(a);
      for (const v of b) { if (r.has(v)) r.delete(v); else r.add(v); }
      return r;
    },
    isSubsetOf(a, b) {
      if (a.size > b.size) return false;
      for (const v of a) { if (!b.has(v)) return false; }
      return true;
    },
    isSupersetOf(a, b) { return _jac.set.isSubsetOf(b, a); },
    isDisjointFrom(a, b) {
      for (const v of a) { if (b.has(v)) return false; }
      return true;
    },
    is_proper_subset(a, b) {
      if (a.size >= b.size) return false;
      for (const v of a) { if (!b.has(v)) return false; }
      return true;
    },
    is_proper_superset(a, b) { return _jac.set.is_proper_subset(b, a); },
    eq(a, b) {
      if (a.size !== b.size) return false;
      for (const v of a) { if (!b.has(v)) return false; }
      return true;
    }
  },

  bytes: {
    hex(b) {
      return Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
    },
    fromhex(s) {
      const arr = [];
      const clean = s.replace(/\s/g, "");
      for (let i = 0; i < clean.length; i += 2) arr.push(parseInt(clean.substr(i, 2), 16));
      return new Uint8Array(arr);
    },
    _indexOf(b, sub, start, end) {
      const s = start || 0;
      const e = end === undefined ? b.length : end;
      const sl = sub.length;
      if (sl === 0) return s;
      for (let i = s; i <= e - sl; i++) {
        let m = true;
        for (let j = 0; j < sl; j++) { if (b[i + j] !== sub[j]) { m = false; break; } }
        if (m) return i;
      }
      return -1;
    },
    _lastIndexOf(b, sub, start, end) {
      const s = start || 0;
      const e = end === undefined ? b.length : end;
      const sl = sub.length;
      if (sl === 0) return e;
      for (let i = e - sl; i >= s; i--) {
        let m = true;
        for (let j = 0; j < sl; j++) { if (b[i + j] !== sub[j]) { m = false; break; } }
        if (m) return i;
      }
      return -1;
    },
    count(b, sub) {
      let c = 0, p = 0;
      while (p <= b.length - sub.length) {
        const idx = _jac.bytes._indexOf(b, sub, p);
        if (idx === -1) break;
        c++; p = idx + sub.length;
      }
      return c;
    },
    find(b, sub, start, end) { return _jac.bytes._indexOf(b, sub, start, end); },
    rfind(b, sub, start, end) { return _jac.bytes._lastIndexOf(b, sub, start, end); },
    index(b, sub, start, end) {
      const idx = _jac.bytes._indexOf(b, sub, start, end);
      if (idx === -1) throw new _jac.exc.ValueError("substring not found");
      return idx;
    },
    rindex(b, sub, start, end) {
      const idx = _jac.bytes._lastIndexOf(b, sub, start, end);
      if (idx === -1) throw new _jac.exc.ValueError("substring not found");
      return idx;
    },
    startswith(b, prefix, start, end) {
      const s = start || 0;
      if (prefix.length > b.length - s) return false;
      for (let i = 0; i < prefix.length; i++) { if (b[s + i] !== prefix[i]) return false; }
      return true;
    },
    endswith(b, suffix, start, end) {
      const e = end === undefined ? b.length : end;
      if (suffix.length > e) return false;
      const off = e - suffix.length;
      for (let i = 0; i < suffix.length; i++) { if (b[off + i] !== suffix[i]) return false; }
      return true;
    },
    replace(b, old_, new_, count) {
      const r = [];
      let pos = 0, n = 0;
      const max = count === undefined ? Infinity : count;
      while (pos <= b.length) {
        if (n < max) {
          const idx = _jac.bytes._indexOf(b, old_, pos);
          if (idx !== -1) {
            for (let i = pos; i < idx; i++) r.push(b[i]);
            for (let i = 0; i < new_.length; i++) r.push(new_[i]);
            pos = idx + old_.length; n++;
            continue;
          }
        }
        for (let i = pos; i < b.length; i++) r.push(b[i]);
        break;
      }
      return new Uint8Array(r);
    },
    _isWS(c) { return c === 32 || c === 9 || c === 10 || c === 13 || c === 11 || c === 12; },
    strip(b, chars) {
      let s = 0, e = b.length;
      if (chars) { const cs = new Set(chars); while (s < e && cs.has(b[s])) s++; while (e > s && cs.has(b[e-1])) e--; }
      else { while (s < e && _jac.bytes._isWS(b[s])) s++; while (e > s && _jac.bytes._isWS(b[e-1])) e--; }
      return b.slice(s, e);
    },
    lstrip(b, chars) {
      let s = 0;
      if (chars) { const cs = new Set(chars); while (s < b.length && cs.has(b[s])) s++; }
      else { while (s < b.length && _jac.bytes._isWS(b[s])) s++; }
      return b.slice(s);
    },
    rstrip(b, chars) {
      let e = b.length;
      if (chars) { const cs = new Set(chars); while (e > 0 && cs.has(b[e-1])) e--; }
      else { while (e > 0 && _jac.bytes._isWS(b[e-1])) e--; }
      return b.slice(0, e);
    },
    removeprefix(b, prefix) {
      if (_jac.bytes.startswith(b, prefix)) return b.slice(prefix.length);
      return b.slice();
    },
    removesuffix(b, suffix) {
      if (suffix.length > 0 && _jac.bytes.endswith(b, suffix)) return b.slice(0, b.length - suffix.length);
      return b.slice();
    },
    split(b, sep, maxsplit) {
      const parts = [];
      let pos = 0, n = 0;
      const max = maxsplit === undefined ? Infinity : maxsplit;
      while (pos <= b.length) {
        if (n >= max) { parts.push(b.slice(pos)); return parts; }
        const idx = _jac.bytes._indexOf(b, sep, pos);
        if (idx === -1) { parts.push(b.slice(pos)); return parts; }
        parts.push(b.slice(pos, idx));
        pos = idx + sep.length; n++;
      }
      if (pos <= b.length) parts.push(b.slice(pos));
      return parts;
    },
    rsplit(b, sep, maxsplit) {
      if (maxsplit === undefined) return _jac.bytes.split(b, sep);
      const parts = [];
      let end = b.length, n = 0;
      while (end >= 0 && n < maxsplit) {
        const idx = _jac.bytes._lastIndexOf(b, sep, 0, end);
        if (idx === -1) break;
        parts.unshift(b.slice(idx + sep.length, end));
        end = idx; n++;
      }
      parts.unshift(b.slice(0, end));
      return parts;
    },
    splitlines(b, keepends) {
      const result = [];
      let start = 0;
      for (let i = 0; i < b.length; i++) {
        if (b[i] === 10 || b[i] === 13) {
          let eol = i + 1;
          if (b[i] === 13 && i + 1 < b.length && b[i + 1] === 10) eol++;
          result.push(keepends ? b.slice(start, eol) : b.slice(start, i));
          start = eol;
          if (eol > i + 1) i++;
        }
      }
      if (start < b.length) result.push(b.slice(start));
      return result;
    },
    join(sep, parts) {
      if (parts.length === 0) return new Uint8Array(0);
      const r = [];
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) for (const x of sep) r.push(x);
        for (const x of parts[i]) r.push(x);
      }
      return new Uint8Array(r);
    },
    partition(b, sep) {
      const idx = _jac.bytes._indexOf(b, sep);
      if (idx === -1) return [b.slice(), new Uint8Array(0), new Uint8Array(0)];
      return [b.slice(0, idx), sep.slice(), b.slice(idx + sep.length)];
    },
    rpartition(b, sep) {
      const idx = _jac.bytes._lastIndexOf(b, sep);
      if (idx === -1) return [new Uint8Array(0), new Uint8Array(0), b.slice()];
      return [b.slice(0, idx), sep.slice(), b.slice(idx + sep.length)];
    },
    _isUp(c) { return c >= 65 && c <= 90; },
    _isLo(c) { return c >= 97 && c <= 122; },
    _isAl(c) { return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); },
    _isDig(c) { return c >= 48 && c <= 57; },
    capitalize(b) {
      if (b.length === 0) return new Uint8Array(0);
      const r = new Uint8Array(b.length);
      r[0] = _jac.bytes._isLo(b[0]) ? b[0] - 32 : b[0];
      for (let i = 1; i < b.length; i++) r[i] = _jac.bytes._isUp(b[i]) ? b[i] + 32 : b[i];
      return r;
    },
    lower(b) {
      const r = new Uint8Array(b.length);
      for (let i = 0; i < b.length; i++) r[i] = _jac.bytes._isUp(b[i]) ? b[i] + 32 : b[i];
      return r;
    },
    upper(b) {
      const r = new Uint8Array(b.length);
      for (let i = 0; i < b.length; i++) r[i] = _jac.bytes._isLo(b[i]) ? b[i] - 32 : b[i];
      return r;
    },
    title(b) {
      const r = new Uint8Array(b.length);
      let prev = false;
      for (let i = 0; i < b.length; i++) {
        if (_jac.bytes._isAl(b[i])) {
          r[i] = prev ? (_jac.bytes._isUp(b[i]) ? b[i] + 32 : b[i]) : (_jac.bytes._isLo(b[i]) ? b[i] - 32 : b[i]);
          prev = true;
        } else { r[i] = b[i]; prev = false; }
      }
      return r;
    },
    swapcase(b) {
      const r = new Uint8Array(b.length);
      for (let i = 0; i < b.length; i++) {
        if (_jac.bytes._isUp(b[i])) r[i] = b[i] + 32;
        else if (_jac.bytes._isLo(b[i])) r[i] = b[i] - 32;
        else r[i] = b[i];
      }
      return r;
    },
    center(b, width, fb) {
      const f = fb || 32;
      if (b.length >= width) return b.slice();
      const total = width - b.length;
      const left = Math.floor(total / 2);
      const r = new Uint8Array(width);
      r.fill(f, 0, left); r.set(b, left); r.fill(f, left + b.length);
      return r;
    },
    ljust(b, width, fb) {
      const f = fb || 32;
      if (b.length >= width) return b.slice();
      const r = new Uint8Array(width);
      r.set(b); r.fill(f, b.length);
      return r;
    },
    rjust(b, width, fb) {
      const f = fb || 32;
      if (b.length >= width) return b.slice();
      const r = new Uint8Array(width);
      const off = width - b.length;
      r.fill(f, 0, off); r.set(b, off);
      return r;
    },
    zfill(b, width) {
      if (b.length >= width) return b.slice();
      const r = new Uint8Array(width);
      let off = 0;
      if (b.length > 0 && (b[0] === 43 || b[0] === 45)) { r[0] = b[0]; off = 1; }
      const pad = width - b.length;
      r.fill(48, off, off + pad);
      for (let i = off; i < b.length; i++) r[pad + i] = b[i];
      return r;
    },
    expandtabs(b, tabsize) {
      const ts = tabsize === undefined ? 8 : tabsize;
      const r = [];
      let col = 0;
      for (let i = 0; i < b.length; i++) {
        if (b[i] === 9) { const sp = ts - (col % ts); for (let j = 0; j < sp; j++) r.push(32); col += sp; }
        else if (b[i] === 10 || b[i] === 13) { r.push(b[i]); col = 0; }
        else { r.push(b[i]); col++; }
      }
      return new Uint8Array(r);
    },
    translate(b, table, del_) {
      const r = [];
      const ds = del_ ? new Set(del_) : null;
      for (let i = 0; i < b.length; i++) {
        if (ds && ds.has(b[i])) continue;
        r.push(table && table[b[i]] !== undefined ? table[b[i]] : b[i]);
      }
      return new Uint8Array(r);
    },
    maketrans(from_, to_) {
      const t = new Uint8Array(256);
      for (let i = 0; i < 256; i++) t[i] = i;
      for (let i = 0; i < from_.length; i++) t[from_[i]] = to_[i];
      return t;
    },
    isalnum(b) {
      if (b.length === 0) return false;
      for (let i = 0; i < b.length; i++) if (!_jac.bytes._isAl(b[i]) && !_jac.bytes._isDig(b[i])) return false;
      return true;
    },
    isalpha(b) {
      if (b.length === 0) return false;
      for (let i = 0; i < b.length; i++) if (!_jac.bytes._isAl(b[i])) return false;
      return true;
    },
    isascii(b) {
      for (let i = 0; i < b.length; i++) if (b[i] > 127) return false;
      return true;
    },
    isdigit(b) {
      if (b.length === 0) return false;
      for (let i = 0; i < b.length; i++) if (!_jac.bytes._isDig(b[i])) return false;
      return true;
    },
    islower(b) {
      let has = false;
      for (let i = 0; i < b.length; i++) {
        if (_jac.bytes._isUp(b[i])) return false;
        if (_jac.bytes._isLo(b[i])) has = true;
      }
      return has;
    },
    isupper(b) {
      let has = false;
      for (let i = 0; i < b.length; i++) {
        if (_jac.bytes._isLo(b[i])) return false;
        if (_jac.bytes._isUp(b[i])) has = true;
      }
      return has;
    },
    isspace(b) {
      if (b.length === 0) return false;
      for (let i = 0; i < b.length; i++) if (!_jac.bytes._isWS(b[i])) return false;
      return true;
    },
    istitle(b) {
      let prev = false, has = false;
      for (let i = 0; i < b.length; i++) {
        if (_jac.bytes._isUp(b[i])) { if (prev) return false; prev = true; has = true; }
        else if (_jac.bytes._isLo(b[i])) { if (!prev) return false; prev = true; has = true; }
        else prev = false;
      }
      return has;
    },
    add(a, b) {
      const r = new Uint8Array(a.length + b.length);
      r.set(a); r.set(b, a.length);
      return r;
    },
    mul(b, n) {
      const r = new Uint8Array(b.length * n);
      for (let i = 0; i < n; i++) r.set(b, i * b.length);
      return r;
    },
    mod(b, args) {
      const s = new TextDecoder().decode(b);
      return new TextEncoder().encode(_jac.str.mod(s, args));
    },
    eq(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    },
    lt(a, b) {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] < b[i]) return true;
        if (a[i] > b[i]) return false;
      }
      return a.length < b.length;
    },
    gt(a, b) { return _jac.bytes.lt(b, a); },
    le(a, b) { return _jac.bytes.eq(a, b) || _jac.bytes.lt(a, b); },
    ge(a, b) { return _jac.bytes.eq(a, b) || _jac.bytes.gt(a, b); },
    contains(b, sub) { return _jac.bytes._indexOf(b, sub) !== -1; }
  },

  tuple: {
    count(arr, val) { return _jac.list.count(arr, val); },
    index(arr, val, start, end) { return _jac.list.index(arr, val, start, end); },
    repeat(arr, n) { return _jac.list.repeat(arr, n); },
    eq(a, b) { return _jac.list.eq(a, b); },
    lt(a, b) { return _jac.list.lt(a, b); },
    gt(a, b) { return _jac.list.gt(a, b); },
    le(a, b) { return _jac.list.le(a, b); },
    ge(a, b) { return _jac.list.ge(a, b); }
  },

  range: {
    count(r, val) {
      if (typeof r[Symbol.iterator] === "function") {
        let c = 0;
        for (const v of r) { if (v === val) c++; }
        return c;
      }
      return 0;
    },
    index(r, val) {
      let i = 0;
      for (const v of r) { if (v === val) return i; i++; }
      throw new _jac.exc.ValueError(val + " is not in range");
    },
    eq(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
      return true;
    },
    contains(r, val) {
      for (const v of r) { if (v === val) return true; }
      return false;
    }
  },

  // Builtin types as first-class values -- `map(int, xs)`, `key=str`,
  // `f = int`, `[str, int]`.  In Python `int` is a single object playing two
  // roles, so it lowers to a single object here too: a callable whose body is
  // generated from the same emitters the direct-call path uses (so
  // `f = int; f(x)` can never drift from `int(x)`), carrying the
  // `__jac_type__` tag that isinstance/issubclass compare against.
  types: (() => {
    const _t = (tag, fn) => Object.assign(fn, {
      __jac_type__: tag,
      toString: () => "<class '" + tag + "'>"
    });
    return {
    any: _t("any", (...a) => (a[0].some(Boolean))),
    bool: _t("bool", (...a) => a.length === 0 ? (false) : a.length === 1 ? (_jac.builtin.bool(a[0])) : (_jac.builtin.bool(a[0], a[1]))),
    bytes: _t("bytes", (...a) => a.length === 0 ? (new Uint8Array()) : (new Uint8Array(a[0]))),
    dict: _t("dict", (...a) => a.length === 0 ? ({}) : (Object.fromEntries(a[0]))),
    float: _t("float", (...a) => a.length === 0 ? (0.0) : (parseFloat(a[0]))),
    int: _t("int", (...a) => a.length === 0 ? (0) : a.length === 1 ? (Math.trunc(Number(a[0]))) : (parseInt(a[0], a[1]))),
    list: _t("list", (...a) => a.length === 0 ? ([]) : (Array.from(a[0]))),
    set: _t("set", (...a) => a.length === 0 ? (new Set()) : (new Set(a[0]))),
    str: _t("str", (...a) => a.length === 0 ? ("") : (String(a[0]))),
    tuple: _t("tuple", (...a) => a.length === 0 ? (Object.freeze([])) : (Object.freeze(Array.from(a[0])))),
    type: _t("type", (...a) => (typeof a[0]))
    };
  })(),

  builtin: {
    round(n, ndigits) {
      if (ndigits === undefined) return Math.round(n);
      const f = Math.pow(10, ndigits);
      return Math.round(n * f) / f;
    },
    sum(iterable, start) {
      let total = start || 0;
      for (const v of iterable) total += v;
      return total;
    },
    sorted(iterable, key, reverse) {
      const arr = [...iterable];
      if (key) {
        arr.sort((a, b) => {
          const ka = key(a), kb = key(b);
          return ka < kb ? -1 : ka > kb ? 1 : 0;
        });
      } else {
        arr.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      }
      if (reverse) arr.reverse();
      return arr;
    },
    enumerate(iterable, start) {
      const s = start || 0;
      return [...iterable].map((v, i) => [s + i, v]);
    },
    zip(...iterables) {
      const arrays = iterables.map(it => [...it]);
      const len = Math.min(...arrays.map(a => a.length));
      const result = [];
      for (let i = 0; i < len; i++) {
        result.push(arrays.map(a => a[i]));
      }
      return result;
    },
    map(fn, ...iterables) {
      // Python hands the callback exactly one element per iterable, while JS's
      // `Array.prototype.map` would also hand it (index, array) -- which a
      // two-arity callable like `int(x, base)` reads as a radix.
      if (iterables.length === 1) return [...iterables[0]].map((v) => fn(v));
      const arrays = iterables.map(it => [...it]);
      const len = Math.min(...arrays.map(a => a.length));
      const result = [];
      for (let i = 0; i < len; i++) {
        result.push(fn(...arrays.map(a => a[i])));
      }
      return result;
    },
    filter(fn, iterable) {
      return [...iterable].filter((v) => fn ? fn(v) : v);
    },
    // The Python type of a builtin-type value, as a tag string.  A builtin type
    // reaches classinfo position in either of the two spellings the compiler
    // emits: the runtime type object (`_jac.types.int`, which carries the tag)
    // or the bare tag itself (an erased annotation, or `_typename` output).
    _typeTag(t) {
      return (t !== null && t !== undefined && t.__jac_type__) || t;
    },
    // Python subclass relation over builtin-type tags. `object` is the
    // universal base and `bool` is a subclass of `int`; `tuple` and `frozenset`
    // share JS representations with `list`/`set`, so fold those aliases to
    // their runtime tag first. One source of truth so isinstance and issubclass
    // can never disagree.
    _tagSubclass(subTag, superTag) {
      const fold = (t) => {
        const tag = _jac.builtin._typeTag(t);
        return tag === "tuple" ? "list" : tag === "frozenset" ? "set" : tag;
      };
      const sub = fold(subTag), sup = fold(superTag);
      if (sup === "object") return true;
      if (sub === sup) return true;
      if (sup === "int" && sub === "bool") return true;
      return false;
    },
    isinstance(o, classinfo) {
      // isinstance(x, (A, B, ...)) -- the tuple of types lowers to a JS array;
      // match if `o` is an instance of any member.
      if (Array.isArray(classinfo)) {
        for (const c of classinfo) {
          if (_jac.builtin.isinstance(o, c)) return true;
        }
        return false;
      }
      // Builtin type: compare the value's runtime type against its tag via the
      // shared subclass relation.  Checked before the constructor branch --
      // a type object is a callable too, and `o instanceof int` is meaningless.
      const tag = _jac.builtin._typeTag(classinfo);
      if (typeof tag === "string") {
        return _jac.builtin._tagSubclass(_jac.poly._typename(o), tag);
      }
      // User archetype / JS constructor.
      if (typeof classinfo === "function") return o instanceof classinfo;
      return false;
    },
    issubclass(cls, classinfo) {
      if (Array.isArray(classinfo)) {
        for (const c of classinfo) {
          if (_jac.builtin.issubclass(cls, c)) return true;
        }
        return false;
      }
      // When either side names a builtin type, compare by the shared subclass
      // relation (covers `object`, `bool` ⊂ `int`, and identity).
      const subTag = _jac.builtin._typeTag(cls);
      const supTag = _jac.builtin._typeTag(classinfo);
      if (typeof subTag === "string" || typeof supTag === "string") {
        return _jac.builtin._tagSubclass(subTag, supTag);
      }
      if (cls === classinfo) return true;
      let proto = cls;
      while (proto) {
        if (proto === classinfo) return true;
        proto = Object.getPrototypeOf(proto);
      }
      return false;
    },
    id(o) {
      if (o === null || o === undefined) return 0;
      if (typeof o === "number") return o;
      return typeof o === "string" ? _jac.builtin._strHash(o) : 0;
    },
    _strHash(s) {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      }
      return h;
    },
    jid(obj) {
      if (obj === null || obj === undefined) {
        throw new _jac.exc.TypeError(
          "jid() called on " + String(obj)
          + " -- the server may have returned an error instead of a node."
          + " Check that your endpoint returned successfully before using jid()."
        );
      }
      if (obj._jac_id === undefined) {
        throw new _jac.exc.TypeError(
          "jid() expected a node or edge with graph identity, but received "
          + (typeof obj === "object" ? JSON.stringify(Object.keys(obj)) : typeof obj)
          + ". Only node and edge archetypes have a jid."
        );
      }
      return obj._jac_id;
    },
    // unsafe_html(x) returns a sentinel object that the JSX flattener
    // recognises and renders as raw HTML via dangerouslySetInnerHTML.
    // Named "unsafe" so the security implication is visible at the use site.
    unsafe_html(html) {
      return { __jacUnsafeHtml: String(html == null ? "" : html) };
    },
    hash(obj) { return _jac.builtin.id(obj); },
    repr(obj) { return JSON.stringify(obj); },
    pow(base, exp, mod) {
      let result = Math.pow(base, exp);
      if (mod !== undefined) result = ((result % mod) + mod) % mod;
      return result;
    },
    next(iter, default_) {
      const result = iter.next();
      if (result.done) {
        if (default_ !== undefined) return default_;
        throw new _jac.exc.StopIteration("StopIteration");
      }
      return result.value;
    },
    vars(o) {
      if (o === undefined) return {};
      const result = {};
      for (const [k, v] of Object.entries(o)) {
        if (typeof v !== "function") result[k] = v;
      }
      return result;
    },
    dir(o) {
      if (o === undefined) return [];
      return Object.getOwnPropertyNames(o).sort();
    },
    open() { throw new _jac.exc.OSError("open() is not supported in client-side JavaScript"); },
    format(value, format_spec) {
      if (!format_spec) return String(value);
      return String(value);
    },
    ascii(obj) {
      if (typeof obj === "string") {
        let r = "'";
        for (const c of obj) {
          const code = c.charCodeAt(0);
          if (c === "\\") r += "\\\\";
          else if (c === "'") r += "\\'";
          else if (code >= 0x20 && code <= 0x7e) r += c;
          else if (code < 0x100) r += "\\x" + code.toString(16).padStart(2, "0");
          else r += "\\u" + code.toString(16).padStart(4, "0");
        }
        return r + "'";
      }
      return String(obj);
    },
    complex(re, im) { return {re: re || 0, im: im || 0}; },
    bool(x) {
      if (x === null || x === undefined || x === false || x === 0 || x === "" || Number.isNaN(x)) return false;
      if (Array.isArray(x)) return x.length > 0;
      if (x instanceof Set || x instanceof Map) return x.size > 0;
      if (typeof x === "object") return Object.keys(x).length > 0;
      return true;
    },
    range(...args) {
      let start, stop, step;
      if (args.length === 1) { start = 0; stop = args[0]; step = 1; }
      else if (args.length === 2) { start = args[0]; stop = args[1]; step = 1; }
      else { start = args[0]; stop = args[1]; step = args[2]; }
      if (step === 0) throw new _jac.exc.ValueError("range() arg 3 must not be zero");
      const result = [];
      if (step > 0) { for (let i = start; i < stop; i += step) result.push(i); }
      else { for (let i = start; i > stop; i += step) result.push(i); }
      return result;
    },
    slice(...args) {
      if (args.length === 1) return { start: null, stop: args[0], step: null };
      return { start: args[0] !== undefined ? args[0] : null, stop: args[1] !== undefined ? args[1] : null, step: args[2] !== undefined ? args[2] : null };
    },
    format(value, format_spec) {
      if (!format_spec || format_spec === "") return String(value);
      const m = format_spec.match(/^([<>^]?)(\d+)?(?:\.(\d+))?([dfseboxXn%]?)$/);
      if (!m) return String(value);
      const [, align, widthStr, precStr, ftype] = m;
      let s;
      const prec = precStr !== undefined ? parseInt(precStr) : undefined;
      if (ftype === "f" || ftype === "") {
        s = prec !== undefined ? Number(value).toFixed(prec) : String(value);
      } else if (ftype === "d") {
        s = String(Math.floor(Number(value)));
      } else if (ftype === "b") {
        s = Number(value).toString(2);
      } else if (ftype === "o") {
        s = Number(value).toString(8);
      } else if (ftype === "x") {
        s = Number(value).toString(16);
      } else if (ftype === "X") {
        s = Number(value).toString(16).toUpperCase();
      } else if (ftype === "e") {
        s = prec !== undefined ? Number(value).toExponential(prec) : Number(value).toExponential();
      } else if (ftype === "%") {
        s = (prec !== undefined ? (Number(value) * 100).toFixed(prec) : (Number(value) * 100).toFixed(6)) + "%";
      } else if (ftype === "s" || ftype === "n") {
        s = String(value);
      } else {
        s = String(value);
      }
      if (widthStr) {
        const width = parseInt(widthStr);
        if (s.length < width) {
          const pad = " ".repeat(width - s.length);
          if (align === "<") s = s + pad;
          else if (align === "^") {
            const left = Math.floor((width - s.length) / 2);
            s = " ".repeat(left) + s + " ".repeat(width - s.length - left);
          }
          else s = pad + s;
        }
      }
      return s;
    }
  },

  exc: (() => {
    class BaseException extends Error { constructor(m) { super(m); this.name = 'BaseException'; } }
    class Exception extends BaseException { constructor(m) { super(m); this.name = 'Exception'; } }
    class ArithmeticError extends Exception { constructor(m) { super(m); this.name = 'ArithmeticError'; } }
    class ZeroDivisionError extends ArithmeticError { constructor(m) { super(m); this.name = 'ZeroDivisionError'; } }
    class OverflowError extends ArithmeticError { constructor(m) { super(m); this.name = 'OverflowError'; } }
    class FloatingPointError extends ArithmeticError { constructor(m) { super(m); this.name = 'FloatingPointError'; } }
    class LookupError extends Exception { constructor(m) { super(m); this.name = 'LookupError'; } }
    class IndexError extends LookupError { constructor(m) { super(m); this.name = 'IndexError'; } }
    class KeyError extends LookupError { constructor(m) { super(m); this.name = 'KeyError'; } }
    class ValueError extends Exception { constructor(m) { super(m); this.name = 'ValueError'; } }
    class TypeError_ extends Exception { constructor(m) { super(m); this.name = 'TypeError'; } }
    class AttributeError extends Exception { constructor(m) { super(m); this.name = 'AttributeError'; } }
    class RuntimeError extends Exception { constructor(m) { super(m); this.name = 'RuntimeError'; } }
    class NotImplementedError extends RuntimeError { constructor(m) { super(m); this.name = 'NotImplementedError'; } }
    class RecursionError extends RuntimeError { constructor(m) { super(m); this.name = 'RecursionError'; } }
    class OSError extends Exception { constructor(m) { super(m); this.name = 'OSError'; } }
    class FileNotFoundError extends OSError { constructor(m) { super(m); this.name = 'FileNotFoundError'; } }
    class FileExistsError extends OSError { constructor(m) { super(m); this.name = 'FileExistsError'; } }
    class PermissionError extends OSError { constructor(m) { super(m); this.name = 'PermissionError'; } }
    class TimeoutError extends OSError { constructor(m) { super(m); this.name = 'TimeoutError'; } }
    class IsADirectoryError extends OSError { constructor(m) { super(m); this.name = 'IsADirectoryError'; } }
    class NotADirectoryError extends OSError { constructor(m) { super(m); this.name = 'NotADirectoryError'; } }
    class AssertionError extends Exception { constructor(m) { super(m); this.name = 'AssertionError'; } }
    class ImportError extends Exception { constructor(m) { super(m); this.name = 'ImportError'; } }
    class ModuleNotFoundError extends ImportError { constructor(m) { super(m); this.name = 'ModuleNotFoundError'; } }
    class NameError extends Exception { constructor(m) { super(m); this.name = 'NameError'; } }
    class UnboundLocalError extends NameError { constructor(m) { super(m); this.name = 'UnboundLocalError'; } }
    class StopIteration extends Exception { constructor(m) { super(m); this.name = 'StopIteration'; } }
    class StopAsyncIteration extends Exception { constructor(m) { super(m); this.name = 'StopAsyncIteration'; } }
    class EOFError extends Exception { constructor(m) { super(m); this.name = 'EOFError'; } }
    class MemoryError extends Exception { constructor(m) { super(m); this.name = 'MemoryError'; } }
    class ReferenceError_ extends Exception { constructor(m) { super(m); this.name = 'ReferenceError'; } }
    class KeyboardInterrupt extends BaseException { constructor(m) { super(m); this.name = 'KeyboardInterrupt'; } }
    class SystemExit extends BaseException { constructor(m) { super(m); this.name = 'SystemExit'; } }
    class GeneratorExit extends BaseException { constructor(m) { super(m); this.name = 'GeneratorExit'; } }
    const _all = { BaseException, Exception, ArithmeticError, ZeroDivisionError, OverflowError, FloatingPointError, LookupError, IndexError, KeyError, ValueError, TypeError: TypeError_, AttributeError, RuntimeError, NotImplementedError, RecursionError, OSError, FileNotFoundError, FileExistsError, PermissionError, TimeoutError, IsADirectoryError, NotADirectoryError, AssertionError, ImportError, ModuleNotFoundError, NameError, UnboundLocalError, StopIteration, StopAsyncIteration, EOFError, MemoryError, ReferenceError: ReferenceError_, KeyboardInterrupt, SystemExit, GeneratorExit };
    function matches(e, name) {
      if (name === 'BaseException') return true;
      if (name === 'Exception') return (e instanceof _all.Exception) || !(e instanceof _all.BaseException);
      const cls = _all[name];
      return cls ? (e instanceof cls) : false;
    }
    return Object.assign(_all, { matches });
  })()
};
async function __nativeInvoke(kind, name, node, fields) {
  let token = (__getLocalStorage("jac_token") || "");
  let payload = {"kind": kind, "name": name, "node": node, "fields": fields, "token": token};
  return await globalThis.__jac_invoke(JSON.stringify(payload));
}
function __nativeErrorMsg(response) {
  try {
    return response["body"]["error"]["message"];
  } catch (__jac_e) {
    if (_jac.exc.matches(__jac_e, "Exception")) {} else {
      throw __jac_e;
    }
  }
  return "Unknown error";
}
function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(Reflect.construct(PopStateEvent, ["popstate"]));
}
function __createJacSchema(zodLib) {
  let handler = {"apply": (target, thisArg, argumentsList) => {
    return zodLib.object.apply(zodLib, argumentsList);
  }, "get": (target, prop, receiver) => {
    return _jac.poly.getitem(zodLib, prop);
  }};
  let dummyFunc = schema => {
    return zodLib.object(schema);
  };
  return Reflect.construct(Proxy, [dummyFunc, handler]);
}
async function __jacSpawn(left, right = "", fields = {}) {
  if (((((left === "login") || (left === "signup")) || (left === "logout")) || (left === "refresh_token"))) {
    return await __doWalkerFetch(left, right, fields);
  }
  let endpoint_key = `walker:${left}`;
  let args_key = `${endpoint_key}:${right}:${JSON.stringify(fields)}`;
  return await __cachedEndpointCall(endpoint_key, args_key, () => {
    return __doWalkerFetch(left, right, fields);
  });
}
function jacSpawn(left, right = "", fields = {}) {
  return __jacSpawn(left, right, fields);
}
async function __jacCallFunction(function_name, args = {}) {
  let endpoint_key = `func:${function_name}`;
  let args_key = `${endpoint_key}:${JSON.stringify(args)}`;
  return await __cachedEndpointCall(endpoint_key, args_key, () => {
    return __doFuncFetch(function_name, args);
  });
}
function __normalizeIdentity(x) {
  if (((x !== null) && (Object.prototype.toString.call(x) === "[object Object]"))) {
    return x;
  }
  return {"type": "username", "value": x};
}
function __normalizeCredential(x) {
  if (((x !== null) && (Object.prototype.toString.call(x) === "[object Object]"))) {
    return x;
  }
  return {"type": "password", "password": x};
}
function __errorMessage(err) {
  if ((err === null)) {
    return "";
  }
  if ((Object.prototype.toString.call(err) === "[object Object]")) {
    return (err["message"] ? err["message"] : "");
  }
  return String(err);
}
async function jacSignup(identities_or_username, credential_or_password, profile = null) {
  let base_url = __getApiBaseUrl();
  let credential = __normalizeCredential(credential_or_password);
  let identities = (Array.isArray(identities_or_username) ? identities_or_username : [__normalizeIdentity(identities_or_username)]);
  let body = {"identities": identities, "credential": credential};
  if ((profile !== null)) {
    body["profile"] = profile;
  }
  let response = await fetch(`${base_url}/user/register`, {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(body)});
  if (response.ok) {
    let body_text = await response.text();
    let user_id = null;
    try {
      let data = JSON.parse(body_text);
      if ((data["data"] && data["data"]["user_id"])) {
        user_id = data["data"]["user_id"];
      }
    } catch (__jac_e) {
      if (_jac.exc.matches(__jac_e, "Exception")) {
        let e = __jac_e;
        return {"success": false, "error": `Signup response was not valid JSON: ${e}`};
      } else {
        throw __jac_e;
      }
    }
    return {"success": true, "user_id": user_id};
  } else {
    let error_text = await response.text();
    try {
      let error_data = JSON.parse(error_text);
      let message = __errorMessage(error_data["error"]);
      return {"success": false, "error": (message || "Signup failed")};
    } catch (__jac_e) {
      if (_jac.exc.matches(__jac_e, "Exception")) {
        return {"success": false, "error": error_text};
      } else {
        throw __jac_e;
      }
    }
  }
}
async function jacLogin(identity_or_username, credential_or_password) {
  let base_url = __getApiBaseUrl();
  let identity = __normalizeIdentity(identity_or_username);
  let credential = __normalizeCredential(credential_or_password);
  let response = await fetch(`${base_url}/user/login`, {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify({"identity": identity, "credential": credential})});
  if (response.ok) {
    let data = JSON.parse(await response.text());
    let token = null;
    try {
      if ((data["data"] && data["data"]["token"])) {
        token = data["data"]["token"];
      }
    } catch (__jac_e) {
      if (_jac.exc.matches(__jac_e, "Exception")) {
        let e = __jac_e;
        console.warn("Failed to extract login token:", e);
      } else {
        throw __jac_e;
      }
    }
    if (token) {
      jacSetToken(token);
      return true;
    }
  }
  return false;
}
function jacLogout() {
  __jacClearCache();
  __removeLocalStorage("jac_token");
  let broker = __jacDesktopBroker();
  if (broker) {
    try {
      fetch(`${broker}/session`, {"method": "DELETE"}).catch(e => console.warn("[jac-client] broker session clear failed:", e));
    } catch (__jac_e) {
      if ((__jac_e instanceof e)) {
        console.warn("[jac-client] broker session clear failed:", e);
      } else {
        throw __jac_e;
      }
    }
  }
}
function jacIsLoggedIn() {
  let token = __getLocalStorage("jac_token");
  return ((token !== null) && (token !== ""));
}
async function jacSsoLogin(platform, api_base = "", operation = "login") {
  let base = (api_base || __getApiBaseUrl());
  let broker = __jacDesktopBroker();
  if (broker) {
    let start_url = ((`${broker}/oauth/start?platform=${encodeURIComponent(platform)}` + `&operation=${encodeURIComponent(operation)}`) + `&api_base=${encodeURIComponent(base)}`);
    let started = await fetch(start_url);
    if (!started.ok) {
      console.warn("[jac-client] oauth/start failed:", started.status);
      return false;
    }
    let token = await __jacPollBrokerSession(broker, 300000, 1000);
    if (token) {
      jacSetToken(token);
      return true;
    }
    return false;
  }
  window.location.href = `${base}/sso/${encodeURIComponent(platform)}/${encodeURIComponent(operation)}`;
  return true;
}
function jacSetToken(token) {
  __jacClearCache();
  __setLocalStorage("jac_token", token);
}
function __jacClearCache() {
  let state = __getCacheState();
  for (const key of _jac.poly.call(Object, "keys", state["cache"])) {
    Reflect.deleteProperty(state["cache"], key);
  }
  state["order"].splice(0, state["order"].length);
}
function __jacDesktopBroker() {
  if ((window.__JAC_DESKTOP__ && window.__JAC_BROKER__)) {
    return window.__JAC_BROKER__;
  }
  return "";
}
async function __jacPollBrokerSession(broker, timeout_ms, interval_ms) {
  let deadline = (Date.now() + timeout_ms);
  while ((Date.now() < deadline)) {
    try {
      let resp = await fetch(`${broker}/session`);
      if (resp.ok) {
        let data = await resp.json();
        let token = (data["token"] || "");
        if (token) {
          return token;
        }
      }
    } catch (__jac_e) {
      if ((__jac_e instanceof e)) {
        console.warn("[jac-client] session poll failed:", e);
      } else {
        throw __jac_e;
      }
    }
    await __jacSleep(interval_ms);
  }
  return "";
}
async function __jacSleep(ms) {
  await Reflect.construct(Promise, [resolve => setTimeout(resolve, ms)]);
}
function __getApiBaseUrl() {
  return (globalThis.__JAC_API_BASE_URL__ || "");
}
function __getLocalStorage(key) {
  let storage = globalThis.localStorage;
  return (storage ? storage.getItem(key) : "");
}
function __setLocalStorage(key, value) {
  let storage = globalThis.localStorage;
  if (storage) {
    storage.setItem(key, value);
  }
}
function __removeLocalStorage(key) {
  let storage = globalThis.localStorage;
  if (storage) {
    storage.removeItem(key);
  }
}
function __getEndpointEffects() {
  if (!globalThis.__jacEndpointEffects__) {
    let initEl = null;
    if (globalThis.document) {
      try {
        initEl = document.getElementById("__jac_init__");
      } catch (__jac_e) {
        if (_jac.exc.matches(__jac_e, "Exception")) {
          let e = __jac_e;
          console.warn("[jac-client] Failed to find __jac_init__ element:", e);
        } else {
          throw __jac_e;
        }
      }
    }
    if (initEl) {
      try {
        let data = JSON.parse(initEl.textContent);
        globalThis.__jacEndpointEffects__ = (data["endpointEffects"] || {});
      } catch (__jac_e) {
        if (_jac.exc.matches(__jac_e, "Exception")) {
          let e = __jac_e;
          console.warn("[jac-client] Failed to parse __jac_init__ data, using empty effects:", e);
          globalThis.__jacEndpointEffects__ = {};
        } else {
          throw __jac_e;
        }
      }
    } else {
      globalThis.__jacEndpointEffects__ = {};
    }
  }
  return globalThis.__jacEndpointEffects__;
}
function __getCacheState() {
  if (!globalThis.__jacCacheState__) {
    globalThis.__jacCacheState__ = {"cache": {}, "order": [], "pending": {}, "config": {"maxEntries": 500, "defaultTtlMs": 60000}};
  }
  return globalThis.__jacCacheState__;
}
function __isFresh(entry) {
  if (!_jac.builtin.bool(entry)) {
    return false;
  }
  let age = (Date.now() - entry["timestamp"]);
  return (age < entry["ttl"]);
}
function __cacheGet(key) {
  let state = __getCacheState();
  let entry = _jac.poly.getitem(state["cache"], key);
  if (!entry) {
    return null;
  }
  let idx = state["order"].indexOf(key);
  if ((idx > (-1))) {
    state["order"].splice(idx, 1);
  }
  state["order"].push(key);
  return entry;
}
function __cacheSet(key, data, ttl) {
  let state = __getCacheState();
  if (_jac.poly.getitem(state["cache"], key)) {
    let idx = state["order"].indexOf(key);
    if ((idx > (-1))) {
      state["order"].splice(idx, 1);
    }
  }
  while ((state["order"].length >= state["config"]["maxEntries"])) {
    __evictOldest();
  }
  state["cache"][key] = {"data": data, "timestamp": Date.now(), "ttl": ttl};
  state["order"].push(key);
}
function __evictOldest() {
  let state = __getCacheState();
  if ((state["order"].length > 0)) {
    let oldest = state["order"].shift();
    if ((oldest && _jac.poly.getitem(state["cache"], oldest))) {
      Reflect.deleteProperty(state["cache"], oldest);
    }
  }
}
async function __doWalkerFetch(walker, nodeId, fields) {
  if ((globalThis.__JAC_NATIVE__ && globalThis.__jac_invoke)) {
    let response = await __nativeInvoke("walker", walker, nodeId, fields);
    if (!response["ok"]) {
      if ((response["status"] === 401)) {
        __removeLocalStorage("jac_token");
        window.location.reload();
        return {};
      }
      throw new _jac.exc.Exception(`Walker ${walker} failed: ${__nativeErrorMsg(response)}`);
    }
    return (response["body"]["data"] ? response["body"]["data"] : {});
  }
  let token = __getLocalStorage("jac_token");
  let base_url = __getApiBaseUrl();
  let url = `${base_url}/walker/${walker}`;
  if ((nodeId !== "")) {
    url = `${base_url}/walker/${walker}/${nodeId}`;
  }
  let headers = {"Content-Type": "application/json", "Accept": "application/json"};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let response = await fetch(url, {"method": "POST", "headers": headers, "body": JSON.stringify(fields)});
  if (!response.ok) {
    if ((response.status === 401)) {
      __removeLocalStorage("jac_token");
      window.location.reload();
      return {};
    }
    let error_text = await response.text();
    let walker_name = (nodeId ? `${walker}/${nodeId}` : walker);
    throw new _jac.exc.Exception(`Walker ${walker_name} failed: ${error_text}`);
  }
  let payload = await response.json();
  return (payload["data"] ? payload["data"] : {});
}
async function __doFuncFetch(function_name, args) {
  if ((globalThis.__JAC_NATIVE__ && globalThis.__jac_invoke)) {
    let response = await __nativeInvoke("function", function_name, "", args);
    if (!response["ok"]) {
      if ((response["status"] === 401)) {
        __removeLocalStorage("jac_token");
        window.location.reload();
        return {};
      }
      throw new _jac.exc.Exception(`Function ${function_name} failed: ${__nativeErrorMsg(response)}`);
    }
    let result = null;
    try {
      let data = response["body"]["data"];
      if ((data && _jac.poly.contains(data, "result"))) {
        result = data["result"];
      }
    } catch (__jac_e) {
      if (_jac.exc.matches(__jac_e, "Exception")) {
        let e = __jac_e;
        console.warn(`Failed to extract result for ${function_name} (native):`, e);
      } else {
        throw __jac_e;
      }
    }
    return result;
  }
  let token = __getLocalStorage("jac_token");
  let base_url = __getApiBaseUrl();
  let headers = {"Content-Type": "application/json"};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let response = await fetch(`${base_url}/function/${function_name}`, {"method": "POST", "headers": headers, "body": JSON.stringify(args)});
  if (!response.ok) {
    if ((response.status === 401)) {
      __removeLocalStorage("jac_token");
      window.location.reload();
      return {};
    }
    let error_text = await response.text();
    throw new _jac.exc.Exception(`Function ${function_name} failed: ${error_text}`);
  }
  let payload = await response.json();
  if (!payload["ok"]) {
    let error_msg = (__errorMessage(payload["error"]) || "Unknown error");
    throw new _jac.exc.Exception(`Function ${function_name} failed: ${error_msg}`);
  }
  let result = null;
  try {
    if ((payload["data"] && _jac.poly.contains(payload["data"], "result"))) {
      result = payload["data"]["result"];
    }
  } catch (__jac_e) {
    if (_jac.exc.matches(__jac_e, "Exception")) {
      let e = __jac_e;
      console.warn(`Failed to extract result for ${function_name}:`, e);
    } else {
      throw __jac_e;
    }
  }
  return result;
}
async function __cachedEndpointCall(endpoint_key, args_key, fetch_fn) {
  let effects = __getEndpointEffects();
  let info = effects[endpoint_key];
  let state = __getCacheState();
  if ((info && !info["is_writer"])) {
    let cached = __cacheGet(args_key);
    if (_jac.builtin.bool(_jac.poly.and_(cached, () => __isFresh(cached)))) {
      return cached["data"];
    }
    if (_jac.poly.getitem(state["pending"], args_key)) {
      return await _jac.poly.getitem(state["pending"], args_key);
    }
    let fetch_promise = fetch_fn();
    state["pending"][args_key] = fetch_promise;
    try {
      let data = await fetch_promise;
      __cacheSet(args_key, data, state["config"]["defaultTtlMs"]);
      return data;
    } finally {
      Reflect.deleteProperty(state["pending"], args_key);
    }
  }
  if ((info && info["is_writer"])) {
    let data = await fetch_fn();
    let writer_touches = info["touches"];
    for (const endpoint_name of _jac.poly.call(Object, "keys", effects)) {
      let reader_info = effects[endpoint_name];
      if ((reader_info && !reader_info["is_writer"])) {
        if ((writer_touches.includes("*") || __overlaps(reader_info["touches"], writer_touches))) {
          __invalidateEndpoint(endpoint_name);
        }
      }
    }
    return data;
  }
  return await fetch_fn();
}
function __invalidateEndpoint(endpoint_key) {
  let state = __getCacheState();
  let keys_to_delete = [];
  for (const key of _jac.poly.call(Object, "keys", state["cache"])) {
    if (key.startsWith(endpoint_key)) {
      keys_to_delete.push(key);
    }
  }
  for (const key of keys_to_delete) {
    Reflect.deleteProperty(state["cache"], key);
    let idx = state["order"].indexOf(key);
    if ((idx > (-1))) {
      state["order"].splice(idx, 1);
    }
  }
}
function __overlaps(list1, list2) {
  for (const item of list1) {
    if (list2.includes(item)) {
      return true;
    }
  }
  return false;
}
function __jacReportError(message, stack = "", url = "", source = "", componentStack = "") {
  try {
    let baseUrl = __getApiBaseUrl();
    fetch(`${baseUrl}/cl/__error__`, {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify({"message": message, "stack": stack, "url": (url || window.location.href), "source": source, "componentStack": componentStack, "timestamp": Reflect.construct(Date, []).toISOString()})});
  } catch (__jac_e) {
    if (_jac.exc.matches(__jac_e, "Exception")) {} else {
      throw __jac_e;
    }
  }
}
function __jacInstallErrorHandlers() {
  if (window.__jacErrorHandlersInstalled) {
    return;
  }
  window.__jacErrorHandlersInstalled = true;
  window.addEventListener("error", event => __jacReportError((event.message || "Unknown error"), (event.error ? event.error.stack : ""), (event.filename || ""), "window.onerror"));
  window.addEventListener("unhandledrejection", event => {
    let reason = event.reason;
    let message = "";
    let stack = "";
    if (reason) {
      message = (reason.message || String(reason));
      stack = (reason.stack || "");
    } else {
      message = "Unhandled promise rejection";
    }
    __jacReportError(message, stack, "", "unhandledrejection");
  });
}
function ErrorFallback(props) {
  const {error, resetErrorBoundary} = props;
  return __jacJsx("div", {"role": "alert", "style": {minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif"}}, [__jacJsx("div", {"role": "alert", "style": {minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif"}}, [__jacJsx("h2", {"style": {color: "#dc2626", marginBottom: "12px"}}, ["🚨 Something went wrong"]), __jacJsx("p", {"style": {color: "#374151", marginBottom: "16px"}}, ["An unexpected error occurred. Please try again."]), __jacJsx("pre", {"style": {color: "#991b1b", background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px", overflowX: "auto", marginBottom: "16px"}}, [error.message]), __jacJsx("button", {"onClick": () => resetErrorBoundary(), "style": {backgroundColor: "#2563eb", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px"}}, ["🔄 Try again"])])]);
}
function ErrorOverlay(props) {
  const {filePath, errors} = props;
  return __jacJsx("div", {"style": {position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.85)", color: "#fff", fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace", fontSize: 14, zIndex: 999999, overflow: "auto", padding: 20, boxSizing: "border-box"}}, [__jacJsx("div", {"style": {maxWidth: 1200, margin: "0 auto"}}, [__jacJsx("div", {"style": {background: "#d32f2f", color: "white", padding: "16px 24px", borderRadius: "8px 8px 0 0", fontSize: 18, fontWeight: "bold"}}, ["⚠️ Compilation Error"]), __jacJsx("div", {"style": {background: "#1e1e1e", padding: 24, borderRadius: "0 0 8px 8px"}}, [__jacJsx("div", {"style": {marginBottom: 16}}, [__jacJsx("div", {"style": {color: "#888", marginBottom: 8}}, ["File:"]), __jacJsx("div", {"style": {color: "#64b5f6", fontWeight: "bold"}}, [filePath])]), __jacJsx("div", {}, [__jacJsx("div", {"style": {color: "#888", marginBottom: 8}}, ["Error:"]), __jacJsx("pre", {"style": {background: "#2d2d2d", padding: 16, borderRadius: 4, overflowX: "auto", margin: 0, borderLeft: "4px solid #d32f2f", lineHeight: 1.6, color: "#ff6b6b"}}, [errors])]), __jacJsx("div", {"style": {marginTop: 24, paddingTop: 16, borderTop: "1px solid #444", color: "#888", fontSize: 13}}, ["💡 Fix the error and save the file to continue development."])])])]);
}
const errorOverlay = ErrorOverlay;
function __jacReactErrorHandler(error, info) {
  try {
    let message = (error ? error.message : "Unknown error");
    let stack = (error ? error.stack : "");
    let componentStack = (info ? info.componentStack : "");
    __jacReportError(message, stack, "", "ErrorBoundary", componentStack);
  } catch (__jac_e) {
    if (_jac.exc.matches(__jac_e, "Exception")) {} else {
      throw __jac_e;
    }
  }
}
function __unwrapFormSchema(schema) {
  let actualSchema = schema;
  try {
    if (!schema.shape) {
      if ((schema._def && schema._def.schema)) {
        actualSchema = schema._def.schema;
      } else if ((schema.def && schema.def.schema)) {
        actualSchema = schema.def.schema;
      }
    }
  } catch (__jac_e) {
    if (_jac.exc.matches(__jac_e, "Exception")) {
      let e = __jac_e;
      console.warn("Failed to unwrap schema:", e);
    } else {
      throw __jac_e;
    }
  }
  return actualSchema;
}
export {ErrorFallback, __cacheGet, __cacheSet, __cachedEndpointCall, __createJacSchema, __doFuncFetch, __doWalkerFetch, __errorMessage, __evictOldest, __getApiBaseUrl, __getCacheState, __getEndpointEffects, __getLocalStorage, __invalidateEndpoint, __isFresh, __jacCallFunction, __jacClearCache, __jacDesktopBroker, __jacInstallErrorHandlers, __jacPollBrokerSession, __jacReactErrorHandler, __jacReportError, __jacSleep, __jacSpawn, __normalizeCredential, __normalizeIdentity, __overlaps, __removeLocalStorage, __setLocalStorage, __unwrapFormSchema, errorOverlay, jacIsLoggedIn, jacLogin, jacLogout, jacSetToken, jacSignup, jacSpawn, jacSsoLogin, navigate};
//# sourceMappingURL=client_runtime_core.js.map
