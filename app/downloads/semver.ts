export type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[] | null;
};

export function parseSemver(value: string): ParsedSemver | null {
  const cleaned = value.trim().replace(/^v/i, "");
  const match = cleaned.match(/(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?/);

  if (!match) {
    return null;
  }

  const prerelease = match[4] ? match[4].split(".") : null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
  };
}

export function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  if (!a.prerelease && !b.prerelease) return 0;
  if (!a.prerelease) return 1;
  if (!b.prerelease) return -1;

  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < length; i += 1) {
    const aId = a.prerelease[i];
    const bId = b.prerelease[i];

    if (aId === undefined) return -1;
    if (bId === undefined) return 1;
    if (aId === bId) continue;

    const aNum = /^[0-9]+$/.test(aId) ? Number(aId) : null;
    const bNum = /^[0-9]+$/.test(bId) ? Number(bId) : null;

    if (aNum !== null && bNum !== null) {
      return aNum - bNum;
    }

    if (aNum !== null && bNum === null) return -1;
    if (aNum === null && bNum !== null) return 1;

    if (aId < bId) return -1;
    if (aId > bId) return 1;
  }

  return 0;
}
