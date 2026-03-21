"use client";

type UpdateSettingsActionsProps = {
  href: string;
  className?: string;
};

export function UpdateSettingsActions({ href, className }: UpdateSettingsActionsProps) {
  const handleOpen = () => {
    window.location.assign(href);
  };

  return (
    <div className={className}>
      <button type="button" className="btn btn-primary update-banner-cta" onClick={handleOpen}>
        Open Settings
      </button>
    </div>
  );
}
