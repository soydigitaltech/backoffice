type UserAvatarProps = {
  name: string;
  size?: "sm" | "md";
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function UserAvatar({
  name,
  size = "md",
}: UserAvatarProps) {
  const sizeClasses =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : "h-11 w-11 text-sm";

  return (
    <div
      aria-label={`Avatar de ${name}`}
      className={`flex shrink-0 items-center justify-center rounded-full bg-admin-accent font-bold text-admin ${sizeClasses}`}
    >
      {getInitials(name)}
    </div>
  );
}