export type BarangayOption = { code: string; name: string };
export type MunicipalityOption = { code: string; name: string; barangays: BarangayOption[] };
export type ProvinceOption = { code: string; name: string; municipalities: MunicipalityOption[] };

// System-wide default location (requested prefill)
export const DEFAULT_PROVINCE = "Sultan Kudarat";
export const DEFAULT_MUNICIPALITY = "Tacurong City";

// Minimal but relevant fallback data for Region XII (SOCCSKSARGEN) — Sultan Kudarat focus
const fallbackLocations: ProvinceOption[] = [
  {
    code: "PH-12-SK",
    name: "Sultan Kudarat",
    municipalities: [
      {
        code: "SK-TC",
        name: "Tacurong City",
        barangays: [
          "Buenaflor",
          "Calean",
          "Carmen",
          "D'Ledesma",
          "EJC Montilla",
          "Grino",
          "Kalandagan",
          "Lancheta",
          "Lower Katungal",
          "New Carmen",
          "New Isabela",
          "New Lagao",
          "New Passi",
          "Poblacion",
          "San Antonio",
          "San Emmanuel",
          "San Pablo",
          "San Rafael",
          "Tina",
          "Tinago",
          "Tuka",
          "Upper Katungal",
        ].map((name, idx) => ({ code: `SK-TC-${idx + 1}`, name })),
      },
      {
        code: "SK-ISL",
        name: "Isulan",
        barangays: ["Bambad", "Kalawag I", "Kalawag II", "Kalawag III", "Kolambog", "Laguilayan", "Poblacion"].map(
          (name, idx) => ({ code: `SK-ISL-${idx + 1}`, name })
        ),
      },
      {
        code: "SK-LBY",
        name: "Lambayong",
        barangays: ["Caromatan", "Madanding", "Mamali", "Poblacion", "Tambak"].map((name, idx) => ({
          code: `SK-LBY-${idx + 1}`,
          name,
        })),
      },
      {
        code: "SK-ESP",
        name: "Esperanza",
        barangays: ["Daguma", "Laguinding", "New Panay", "Paitan", "Poblacion"].map((name, idx) => ({
          code: `SK-ESP-${idx + 1}`,
          name,
        })),
      },
      {
        code: "SK-BGB",
        name: "Bagumbayan",
        barangays: ["Bai Sarifinang", "Daguma", "Kapaya", "Poblacion", "Sison"].map((name, idx) => ({
          code: `SK-BGB-${idx + 1}`,
          name,
        })),
      },
    ],
  },
];

// Public PSGC-derived datasets often expose barangay rows with province/municipality fields.
const REMOTE_DATA_URL =
  "https://raw.githubusercontent.com/psgc-data/psgc-data/main/barangays.json";

type RemoteBarangayRow = {
  code?: string;
  brgyCode?: string;
  barangayCode?: string;
  name?: string;
  barangayName?: string;
  brgyName?: string;
  cityMunCode?: string;
  municipalityCode?: string;
  cityCode?: string;
  cityMunicipalityName?: string;
  municipalityName?: string;
  cityName?: string;
  provCode?: string;
  provinceCode?: string;
  provinceName?: string;
  regionCode?: string;
};

const pick = (row: RemoteBarangayRow, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = (row as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

const buildLocationsFromRemote = (rows: RemoteBarangayRow[]): ProvinceOption[] => {
  const provinceMap = new Map<string, { code: string; name: string; municipalities: Map<string, MunicipalityOption> }>();

  rows.forEach((row) => {
    const provinceName = pick(row, ["provinceName", "provName", "province"]);
    const provinceCode = pick(row, ["provinceCode", "provCode"]) || provinceName;
    const municipalityName =
      pick(row, ["cityMunicipalityName", "municipalityName", "cityName", "municipality"]) || "";
    const municipalityCode = pick(row, ["cityMunCode", "municipalityCode", "cityCode"]) || municipalityName;
    const barangayName = pick(row, ["barangayName", "brgyName", "name", "barangay"]);
    const barangayCode = pick(row, ["barangayCode", "brgyCode", "code"]) || barangayName;

    if (!provinceName || !municipalityName || !barangayName) return;

    if (!provinceMap.has(provinceCode || provinceName)) {
      provinceMap.set(provinceCode || provinceName, {
        code: provinceCode || provinceName,
        name: provinceName,
        municipalities: new Map(),
      });
    }

    const provinceEntry = provinceMap.get(provinceCode || provinceName)!;
    if (!provinceEntry.municipalities.has(municipalityCode)) {
      provinceEntry.municipalities.set(municipalityCode, {
        code: municipalityCode,
        name: municipalityName,
        barangays: [],
      });
    }

    const municipalityEntry = provinceEntry.municipalities.get(municipalityCode)!;
    municipalityEntry.barangays.push({ code: barangayCode || barangayName, name: barangayName });
  });

  return Array.from(provinceMap.values()).map((province) => ({
    code: province.code,
    name: province.name,
    municipalities: Array.from(province.municipalities.values()).map((muni) => ({
      ...muni,
      barangays: muni.barangays.sort((a, b) => a.name.localeCompare(b.name)),
    })),
  }));
};

export const fetchPhilippineLocations = async (): Promise<ProvinceOption[]> => {
  try {
    const response = await fetch(REMOTE_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Remote dataset returned ${response.status}`);
    const rows = (await response.json()) as RemoteBarangayRow[];
    if (!Array.isArray(rows)) throw new Error("Unexpected dataset shape");
    const provinces = buildLocationsFromRemote(rows);
    if (provinces.length) return provinces;
  } catch (error) {
    console.warn("Falling back to built-in PH locations", error);
  }
  return fallbackLocations;
};
