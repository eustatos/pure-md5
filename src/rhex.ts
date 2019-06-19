import hex_chr from "./hex_chr";

function rhex(n) {
  let s = "";
  for (let j = 0; j < 4; j++)
    s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
  return s;
}

export default rhex;
