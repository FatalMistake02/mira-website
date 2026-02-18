import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

const values = [
  {
    title: "Focused Workflows",
    text: "Mira is shaped around reducing tab fatigue, making context-switching calmer, and helping you stay in flow.",
  },
  {
    title: "Built in Public",
    text: "Development is open source by default, with visible discussions, transparent roadmaps, and community pull requests.",
  },
  {
    title: "Personal by Design",
    text: "From themes to layouts, Mira treats customization as a core feature, not a premium afterthought.",
  },
];

type GitHubRelease = {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
};

type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
};

type RoadmapItem = {
  done: boolean;
  text: string;
};

type RoadmapMilestone = {
  heading: string;
  version: ParsedSemver;
  items: RoadmapItem[];
};

type UpcomingReleasePlan = {
  currentVersion: string | null;
  nextVersionHeading: string;
  items: string[];
  sourceUrl: string | null;
  hasNextVersion: boolean;
} | null;

const REPO_OWNER = "FatalMistake02";
const REPO_NAME = "mira";
const ROADMAP_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/ROADMAP.md`;

function parseSemver(value: string): ParsedSemver | null {
  const cleaned = value.trim().replace(/^v/i, "");
  const match = cleaned.match(/(\d+)\.(\d+)\.(\d+)\b/);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatSemver(value: ParsedSemver): string {
  return `v${value.major}.${value.minor}.${value.patch}`;
}

function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function parseRoadmapMarkdown(markdown: string): RoadmapMilestone[] {
  const lines = markdown.split(/\r?\n/);
  const milestones: RoadmapMilestone[] = [];
  let current: RoadmapMilestone | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const versionMatch = heading.match(/v?(\d+\.\d+\.\d+)\b/i);
      const version = versionMatch ? parseSemver(versionMatch[1]) : null;

      if (version) {
        current = { heading, version, items: [] };
        milestones.push(current);
      } else {
        current = null;
      }
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch && current) {
      current.items.push({
        done: taskMatch[1].toLowerCase() === "x",
        text: taskMatch[2].trim(),
      });
    }
  }

  return milestones;
}

async function fetchCurrentStableVersion(): Promise<ParsedSemver | null> {
  const latestResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "mira-website",
    },
    next: { revalidate: 300 },
  });

  if (latestResponse.ok) {
    const latest = (await latestResponse.json()) as GitHubRelease;
    const latestVersion = parseSemver(latest.tag_name);
    if (latestVersion) {
      return latestVersion;
    }
  }

  const releasesResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=10`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "mira-website",
    },
    next: { revalidate: 300 },
  });

  if (releasesResponse.ok) {
    const releases = (await releasesResponse.json()) as GitHubRelease[];
    const stableRelease = releases.find((release) => !release.prerelease && !release.draft);

    if (stableRelease) {
      const stableVersion = parseSemver(stableRelease.tag_name);
      if (stableVersion) {
        return stableVersion;
      }
    }
  }

  const latestPageResponse = await fetch(`https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
    headers: {
      Accept: "text/html",
      "User-Agent": "mira-website",
    },
    redirect: "follow",
    next: { revalidate: 300 },
  });

  if (latestPageResponse.ok) {
    const resolvedUrl = latestPageResponse.url;
    const tagMatch = resolvedUrl.match(/\/tag\/([^/?#]+)/i);
    if (tagMatch) {
      const parsedFromUrl = parseSemver(tagMatch[1]);
      if (parsedFromUrl) {
        return parsedFromUrl;
      }
    }
  }

  return null;
}

async function fetchRoadmapMarkdown(): Promise<{ markdown: string; sourceUrl: string } | null> {
  const contentsResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/ROADMAP.md?ref=main`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "mira-website",
      },
      next: { revalidate: 600 },
    },
  );

  if (contentsResponse.ok) {
    const data = (await contentsResponse.json()) as { content?: string; encoding?: string };
    if (data.encoding === "base64" && typeof data.content === "string") {
      const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
      if (decoded.trim().length > 0) {
        return {
          markdown: decoded,
          sourceUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/ROADMAP.md`,
        };
      }
    }
  }

  const rawResponse = await fetch(ROADMAP_URL, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "mira-website",
    },
    next: { revalidate: 600 },
  });

  if (!rawResponse.ok) {
    return null;
  }

  const markdown = await rawResponse.text();
  if (!markdown.trim()) {
    return null;
  }

  return {
    markdown,
    sourceUrl: ROADMAP_URL,
  };
}

async function fetchUpcomingReleasePlan(): Promise<UpcomingReleasePlan> {
  try {
    const roadmap = await fetchRoadmapMarkdown();
    if (!roadmap) {
      return null;
    }

    const milestones = parseRoadmapMarkdown(roadmap.markdown).sort((a, b) =>
      compareSemver(a.version, b.version),
    );
    if (milestones.length === 0) {
      return null;
    }

    const currentVersion = await fetchCurrentStableVersion();
    let nextMilestone: RoadmapMilestone | undefined;

    if (currentVersion) {
      nextMilestone = milestones.find((milestone) => compareSemver(milestone.version, currentVersion) > 0);

      if (!nextMilestone) {
        const firstUpcomingWithWork = milestones.find((milestone) => milestone.items.some((item) => !item.done));
        if (firstUpcomingWithWork) {
          const uncheckedFallback = firstUpcomingWithWork.items
            .filter((item) => !item.done)
            .map((item) => item.text);

          return {
            currentVersion: formatSemver(currentVersion),
            nextVersionHeading: firstUpcomingWithWork.heading,
            items: uncheckedFallback.length > 0 ? uncheckedFallback : ["No tasks listed for this milestone."],
            sourceUrl: roadmap.sourceUrl,
            hasNextVersion: true,
          };
        }

        return {
          currentVersion: formatSemver(currentVersion),
          nextVersionHeading: "No newer roadmap milestone listed yet",
          items: ["ROADMAP.md currently has no version higher than the latest stable release."],
          sourceUrl: roadmap.sourceUrl,
          hasNextVersion: false,
        };
      }
    } else {
      const baseline = milestones[0];
      nextMilestone =
        milestones.find((milestone) => compareSemver(milestone.version, baseline.version) > 0) ??
        milestones.find((milestone) => milestone.items.some((item) => !item.done)) ??
        milestones[0];
    }

    const uncheckedItems = nextMilestone.items.filter((item) => !item.done).map((item) => item.text);
    const items = uncheckedItems.length > 0 ? uncheckedItems : nextMilestone.items.map((item) => item.text);

    return {
      currentVersion: currentVersion ? formatSemver(currentVersion) : null,
      nextVersionHeading: nextMilestone.heading,
      items: items.length > 0 ? items : ["No tasks listed for this milestone."],
      sourceUrl: roadmap.sourceUrl,
      hasNextVersion: true,
    };
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "About Mira",
  description: "Learn what Mira is, why it exists, and where it is heading.",
  alternates: {
    canonical: `${getSiteUrl()}/about`,
  },
};

export default async function AboutPage() {
  const upcomingPlan = await fetchUpcomingReleasePlan();

  return (
    <main className="page-enter about-page">
      <section className="about-hero section">
        <div className="container">
          <p className="eyebrow animate-fade-up" style={{ animationDelay: "70ms" }}>
            About Mira
          </p>
          <h2 className="about-title animate-fade-up" style={{ animationDelay: "150ms" }}>
            A browser shaped for builders, tinkerers, and focused everyday work
          </h2>
          <p className="lead animate-fade-up" style={{ animationDelay: "240ms" }}>
            Mira exists to make desktop browsing feel fast, intentional, and deeply customizable without
            sacrificing simplicity.
          </p>
          <div className="about-actions animate-fade-up" style={{ animationDelay: "320ms" }}>
            <Link href="/downloads" className="btn btn-primary">
              Get Mira
            </Link>
            <a
              href="https://github.com/FatalMistake02/mira"
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              Explore the Repo
            </a>
          </div>
          <div className="about-orb about-orb-a" aria-hidden />
          <div className="about-orb about-orb-b" aria-hidden />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="about-section-title animate-fade-up" style={{ animationDelay: "120ms" }}>
            What guides Mira
          </h2>
          <div className="feature-grid">
            {values.map((value, idx) => (
              <article
                key={value.title}
                className="feature-card animate-fade-up"
                style={{ animationDelay: `${180 + idx * 110}ms` }}
              >
                <h2>{value.title}</h2>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="feature-card about-roadmap-card animate-fade-in-scale" style={{ animationDelay: "180ms" }}>
            <div>
              <p className="eyebrow">Roadmap</p>
              <h2>
                {upcomingPlan
                  ? upcomingPlan.hasNextVersion
                    ? `Coming in ${upcomingPlan.nextVersionHeading}`
                    : upcomingPlan.nextVersionHeading
                  : "What comes next"}
              </h2>
            </div>
            {upcomingPlan ? (
              <>
                <ul className="about-roadmap">
                  {upcomingPlan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {upcomingPlan.sourceUrl && (
                  <p className="muted-note">
                    Source:{" "}
                    <a href={upcomingPlan.sourceUrl} target="_blank" rel="noreferrer">
                      ROADMAP.md on main
                    </a>
                  </p>
                )}
              </>
            ) : (
              <p className="muted-note">
                Couldn&apos;t load next release plans right now. Check back soon.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
