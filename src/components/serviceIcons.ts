import { BadgeCheck, Container, Drill, FileCheck2, Handshake, Plane, Ship, Truck, Warehouse, type LucideIcon } from "lucide-react";
import type { ServiceSlug } from "@/content/site";

export const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  "customs-clearance": FileCheck2,
  "saber-certification": BadgeCheck,
  "import-export-agency": Handshake,
  "sea-freight": Ship,
  "air-freight": Plane,
  "land-freight": Truck,
  "oil-gas-projects": Drill,
  warehousing: Warehouse,
  containers: Container,
};
