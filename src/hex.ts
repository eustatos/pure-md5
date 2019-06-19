import rhex from "./rhex";

function hex(x) {
  const l = x.length;
  for (let i = 0; i < l; i++) x[i] = rhex(x[i]);
  return x.join("");
}

export default hex;
