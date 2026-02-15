import hex from './hex';
import md51 from './md51';
import add32 from './add32'; // Add this import

function md5(string: string): string {
  let fn;
  const check = hex(md51('hello'));
  if (check !== '5d41402abc4b2a76b9719d911017c592') {
    fn = add32; // Use imported function
  }

  return hex(md51(string, fn));
}

export { md5 };
