import { Shield, Lock, Globe, DollarSign } from "lucide-react";

interface LicenseBadgeProps {
  licenseType: string;
}

export function LicenseBadge({ licenseType }: LicenseBadgeProps) {
  const getLicenseInfo = (license: string) => {
    switch (license.toLowerCase()) {
      case "mit":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          icon: Globe,
          label: "MIT License"
        };
      case "cc by 4.0":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: Globe,
          label: "CC BY 4.0"
        };
      case "cc by-sa 4.0":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: Globe,
          label: "CC BY-SA 4.0"
        };
      case "gpl-3.0":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          icon: Shield,
          label: "GPL 3.0"
        };
      case "commercial":
        return {
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          icon: DollarSign,
          label: "Commercial"
        };
      case "restricted":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: Lock,
          label: "Restricted"
        };
      case "open data":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          icon: Globe,
          label: "Open Data"
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: Shield,
          label: license
        };
    }
  };

  const { color, icon: Icon, label } = getLicenseInfo(licenseType);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}