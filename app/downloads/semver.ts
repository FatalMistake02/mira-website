export type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[] | null;
};

export function parseSemver(value: string): ParsedSemver | null {
  const cleaned = value.trim().replace(/^v/i, "");
  // Build metadata does not affect precedence, so ignore it for parsing.
  const withoutBuild = cleaned.split("+", 1)[0] ?? cleaned;
  // Split "1.2.3-rc.1" into core and prerelease parts.
  const prereleaseSeparator = withoutBuild.indexOf("-");
  const core =
    prereleaseSeparator === -1 ? withoutBuild : withoutBuild.slice(0, prereleaseSeparator);
  const prereleaseRaw =
    prereleaseSeparator === -1 ? "" : withoutBuild.slice(prereleaseSeparator + 1);
  // Core must be strict major.minor.patch.
  const coreMatch = core.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!coreMatch) {
    return null;
  }

  const prerelease = prereleaseRaw ? prereleaseRaw.split(".") : null;

  return {
    major: Number(coreMatch[1]),
    minor: Number(coreMatch[2]),
    patch: Number(coreMatch[3]),
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
