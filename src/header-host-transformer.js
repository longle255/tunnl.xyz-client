import stream from 'stream';
import util from 'util';

let Transform = stream.Transform;

class HeaderHostTransformer extends Transform {
  constructor(options) {
    super(options);
    if (!(this instanceof HeaderHostTransformer)) {
      return new HeaderHostTransformer(options);
    }

    options = options || {};

    this.host = options.host || 'localhost';
    this.replaced = false;
  }

  _transform(chunk, enc, cb) {
    chunk = chunk.toString();

    // after replacing the first instance of the Host header
    // we just become a regular passthrough
    if (!this.replaced) {
      this.push(chunk.replace(/(\r\nHost: )\S+/, (match, $1) => {
        this.replaced = true;
        return $1 + this.host;
      }));
    } else {
      this.push(chunk);
    }
    return cb();
  }
}

export default HeaderHostTransformer;
