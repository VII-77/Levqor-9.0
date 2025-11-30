"use client";

import { useEffect, useState } from "react";

interface VersionInfo {
  commitShort: string;
  branch: string;
}

export default function VersionBadge() {
  const [version, setVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data.commitShort && data.commitShort !== "unknown") {
          setVersion({ commitShort: data.commitShort, branch: data.branch });
        }
      })
      .catch(() => {});
  }, []);

  if (!version) return null;

  return (
    <span className="text-neutral-600 font-mono text-[10px]">
      v{version.commitShort}
    </span>
  );
}
