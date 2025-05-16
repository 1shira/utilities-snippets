function chk6sum(str: string, seed: number = 0) {
  /**
   * uses the adler-32 checksum algorithm and generates a 6-char alphanum string based off of it
   *
   * @returns a 6-character alphanumeric string based on input
   *
   * @param string - the string to make a checksum of
   * @param seed - the seed to use as additional salt
   */

  seed = Number(seed);

  let nums: number[] = str
    .split("")
    .map((el) => Number(el.charCodeAt(0).toString(10)));

  let a: number = 1;
  let b: number = 1;

  a = (1 + nums.reduce((a, b) => a + b, 0)) % 65521;

  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j <= i; j++) {
      b = b + 1 + nums[j];
    }
  }
  b = b % 65521;

  let chk: number = b * 65536 + a;

  let r1: () => number = sfc32(
    (a * (seed + 1)) ^ (b << 10),
    a | chk,
    (a << 4) | (a >> 28),
    Math.floor((b + chk / 2) | (a & 9))
  );
  let r2: () => number = sfc32(
    a * 2 + b * (seed + 1),
    (b ^ a) | (seed << 6),
    (b << 8) | (b >> 24),
    b | chk
  );

  let m: number =
    (Math.ceil(r1() * (seed + 31)) + Math.ceil(r2() * (seed + 17))) << 2;

  for (let i = 0; i < (1 + seed) * m; i++) {
    r1();
    r2();
  }

  let i1: number = Math.ceil(r1() * 32);
  let i2: number = Math.ceil(r2() * 32);

  let bin: string = chk.toString(2).padStart(32, "0");

  let res: string[] = [];

  let chars: string[] = shuffleArray(
    "0123456789abcdefghijklmnopqrstuvwxyz".split(""),
    [r1, r2][seed % 2]
  );

  let ix: number = 0;

  for (let i = 0; i < 6; i++) {
    let bits: string = "";
    for (let j = 0; j < 5; j++) {
      if (ix === i1 || ix === i2) ix++;
      if (ix === i1 || ix === i2) ix++;
      bits += bin[ix];
      ix++;
    }

    let r: () => number = sfc32(
      chk,
      a << 4,
      b << 8,
      (chk >> 5) | (parseInt(bits, 2) << 27)
    );
    res.push(chars[Math.ceil(r() * 35)]);
  }

  return res.join("");
}

function sfc32(a: number, b: number, c: number, d: number) {
  /**
   * generates a seeded randomness function
   *
   * @params - seeds entropy
   *
   * @returns random() function
   */

  return function: () => number () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t: number = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
function shuffleArray(arr: any[], random: () => number) {
  /**
   * shuffles an array in-place
   *
   * @param arr - the array to shuffleArray
   * @param random - a function to generate a random number in [0;1]
   *
   * @retuns shuffled array
   */
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export { chk6sum };
