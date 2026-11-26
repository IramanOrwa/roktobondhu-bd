import type { Language, LocationSelection } from '@/types';

export interface VillageNode {
  id: string;
  en: string;
  bn: string;
}

export interface PostOfficeNode {
  id: string;
  en: string;
  bn: string;
  postCode: string;
  villages: VillageNode[];
}

export interface UpazilaNode {
  id: string;
  en: string;
  bn: string;
  postOffices: PostOfficeNode[];
}

export interface DistrictNode {
  id: string;
  en: string;
  bn: string;
  upazilas: UpazilaNode[];
}

export interface DivisionNode {
  id: string;
  en: string;
  bn: string;
  districts: DistrictNode[];
}

/**
 * Official 5-Tier Bangladesh Administrative Hierarchy:
 * Division -> District -> Upazila/Thana -> Post Office (with Post Code) -> Village/Area
 * Covers all 8 Divisions of Bangladesh with rich bilingual (EN/BN) data.
 */
export const BANGLADESH_LOCATIONS: DivisionNode[] = [
  {
    id: 'div-dhaka',
    en: 'Dhaka',
    bn: 'ঢাকা',
    districts: [
      {
        id: 'dist-dhaka',
        en: 'Dhaka',
        bn: 'ঢাকা',
        upazilas: [
          {
            id: 'upz-dhanmondi',
            en: 'Dhanmondi',
            bn: 'ধানমন্ডি',
            postOffices: [
              {
                id: 'po-dhanmondi-1205',
                en: 'New Market / Dhanmondi',
                bn: 'নিউ মার্কেট / ধানমন্ডি',
                postCode: '1205',
                villages: [
                  { id: 'vil-dhanmondi-27', en: 'Dhanmondi Road 27', bn: 'ধানমন্ডি রোড ২৭' },
                  { id: 'vil-kalabagan', en: 'Kalabagan', bn: 'কলাবাগান' },
                  { id: 'vil-green-road', en: 'Green Road', bn: 'গ্রিন রোড' },
                ],
              },
              {
                id: 'po-jigatala-1209',
                en: 'Jigatala',
                bn: 'জিগাতলা',
                postCode: '1209',
                villages: [
                  { id: 'vil-shankar', en: 'Shankar', bn: 'শংকর' },
                  { id: 'vil-hazaribagh', en: 'Hazaribagh Border', bn: 'হাজারীবাগ বর্ডার' },
                  { id: 'vil-satmasjid', en: 'Satmasjid Road', bn: 'সাতমসজিদ রোড' },
                ],
              },
            ],
          },
          {
            id: 'upz-mirpur',
            en: 'Mirpur',
            bn: 'মিরপুর',
            postOffices: [
              {
                id: 'po-mirpur-1216',
                en: 'Mirpur TSO',
                bn: 'মিরপুর টিএসও',
                postCode: '1216',
                villages: [
                  { id: 'vil-mirpur-10', en: 'Mirpur Section 10', bn: 'মিরপুর সেকশন ১০' },
                  { id: 'vil-mirpur-11', en: 'Mirpur Section 11', bn: 'মিরপুর সেকশন ১১' },
                  { id: 'vil-pallabi', en: 'Pallabi', bn: 'পল্লবী' },
                ],
              },
              {
                id: 'po-kafrul-1206',
                en: 'Dhaka Cantonment / Kafrul',
                bn: 'ঢাকা সেনানিবাস / কাফরুল',
                postCode: '1206',
                villages: [
                  { id: 'vil-shewrapara', en: 'Shewrapara', bn: 'শেওড়াপাড়া' },
                  { id: 'vil-kazipara', en: 'Kazipara', bn: 'কাজীপাড়া' },
                ],
              },
            ],
          },
          {
            id: 'upz-uttara',
            en: 'Uttara',
            bn: 'উত্তরা',
            postOffices: [
              {
                id: 'po-uttara-1230',
                en: 'Uttara Model Town',
                bn: 'উত্তরা মডেল টাউন',
                postCode: '1230',
                villages: [
                  { id: 'vil-uttara-sec7', en: 'Uttara Sector 7', bn: 'উত্তরা সেক্টর ৭' },
                  { id: 'vil-uttara-sec11', en: 'Uttara Sector 11', bn: 'উত্তরা সেক্টর ১১' },
                  { id: 'vil-diabari', en: 'Diabari', bn: 'দিয়াবাড়ি' },
                ],
              },
            ],
          },
          {
            id: 'upz-shahbagh',
            en: 'Shahbagh',
            bn: 'শাহবাগ',
            postOffices: [
              {
                id: 'po-dhaka-gpo-1000',
                en: 'Dhaka GPO / Ramna',
                bn: 'ঢাকা জিপিও / রমনা',
                postCode: '1000',
                villages: [
                  { id: 'vil-dmch-area', en: 'DMCH & Bakshibazar', bn: 'ঢামেক ও বকশীবাজার' },
                  { id: 'vil-pg-hospital', en: 'BMU / Shahbagh Circle', bn: 'বিএমইউ / শাহবাগ চত্বর' },
                  { id: 'vil-elephant-road', en: 'Elephant Road', bn: 'এলিফ্যান্ট রোড' },
                ],
              },
            ],
          },
          {
            id: 'upz-savar',
            en: 'Savar',
            bn: 'সাভার',
            postOffices: [
              {
                id: 'po-savar-1340',
                en: 'Savar Head Post Office',
                bn: 'সাভার প্রধান ডাকঘর',
                postCode: '1340',
                villages: [
                  { id: 'vil-savar-bazar', en: 'Savar Bazar', bn: 'সাভার বাজার' },
                  { id: 'vil-enam-med', en: 'Bank Town / Enam Medical Area', bn: 'ব্যাংক টাউন / এনাম মেডিকেল এলাকা' },
                ],
              },
              {
                id: 'po-ashulia-1341',
                en: 'Dairy Farm / Ashulia',
                bn: 'ডেইরি ফার্ম / আশুলিয়া',
                postCode: '1341',
                villages: [
                  { id: 'vil-ju-campus', en: 'Jahangirnagar Campus Area', bn: 'জাহাঙ্গীরনগর ক্যাম্পাস এলাকা' },
                  { id: 'vil-jamgora', en: 'Jamgora', bn: 'জামগড়া' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-gazipur',
        en: 'Gazipur',
        bn: 'গাজীপুর',
        upazilas: [
          {
            id: 'upz-gazipur-sadar',
            en: 'Gazipur Sadar',
            bn: 'গাজীপুর সদর',
            postOffices: [
              {
                id: 'po-gazipur-1700',
                en: 'Gazipur Sadar PO',
                bn: 'গাজীপুর সদর ডাকঘর',
                postCode: '1700',
                villages: [
                  { id: 'vil-joydebpur', en: 'Joydebpur Bazar', bn: 'জয়দেবপুর বাজার' },
                  { id: 'vil-chourasta', en: 'Chandana Chowrasta', bn: 'চান্দনা চৌরাস্তা' },
                ],
              },
            ],
          },
          {
            id: 'upz-tongi',
            en: 'Tongi',
            bn: 'টঙ্গী',
            postOffices: [
              {
                id: 'po-tongi-1710',
                en: 'Tongi TSO',
                bn: 'টঙ্গী টিএসও',
                postCode: '1710',
                villages: [
                  { id: 'vil-college-gate', en: 'College Gate', bn: 'কলেজ গেট' },
                  { id: 'vil-station-road', en: 'Station Road', bn: 'স্টেশন রোড' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-narayanganj',
        en: 'Narayanganj',
        bn: 'নারায়ণগঞ্জ',
        upazilas: [
          {
            id: 'upz-narayanganj-sadar',
            en: 'Narayanganj Sadar',
            bn: 'নারায়ণগঞ্জ সদর',
            postOffices: [
              {
                id: 'po-narayanganj-1400',
                en: 'Narayanganj Head PO',
                bn: 'নারায়ণগঞ্জ প্রধান ডাকঘর',
                postCode: '1400',
                villages: [
                  { id: 'vil-chashara', en: 'Chashara', bn: 'চাষাঢ়া' },
                  { id: 'vil-fatullah', en: 'Fatullah', bn: 'ফতুল্লা' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-chattogram',
    en: 'Chattogram',
    bn: 'চট্টগ্রাম',
    districts: [
      {
        id: 'dist-chattogram',
        en: 'Chattogram',
        bn: 'চট্টগ্রাম',
        upazilas: [
          {
            id: 'upz-panchlaish',
            en: 'Panchlaish',
            bn: 'পাঁচলাইশ',
            postOffices: [
              {
                id: 'po-chawkbazar-4203',
                en: 'Chawkbazar',
                bn: 'চকবাজার',
                postCode: '4203',
                villages: [
                  { id: 'vil-cmch-area', en: 'Chattogram Medical Area', bn: 'চট্টগ্রাম মেডিকেল এলাকা' },
                  { id: 'vil-probartak', en: 'Probartak Circle', bn: 'প্রবর্তক মোড়' },
                  { id: 'vil-muradpur', en: 'Muradpur', bn: 'মুরাদপুর' },
                ],
              },
            ],
          },
          {
            id: 'upz-kotwali-ctg',
            en: 'Kotwali',
            bn: 'কোতোয়ালী',
            postOffices: [
              {
                id: 'po-ctg-gpo-4000',
                en: 'Chattogram GPO',
                bn: 'চট্টগ্রাম জিপিও',
                postCode: '4000',
                villages: [
                  { id: 'vil-anderkilla', en: 'Anderkilla', bn: 'আন্দরকিল্লা' },
                  { id: 'vil-jamalkhan', en: 'Jamalkhan', bn: 'জামালখান' },
                ],
              },
            ],
          },
          {
            id: 'upz-halishahar',
            en: 'Halishahar',
            bn: 'হালিশহর',
            postOffices: [
              {
                id: 'po-halishahar-4216',
                en: 'Halishahar Housing Estate',
                bn: 'হালিশহর হাউজিং এস্টেট',
                postCode: '4216',
                villages: [
                  { id: 'vil-agrabad', en: 'Agrabad Access Road', bn: 'আগ্রাবাদ এক্সেস রোড' },
                  { id: 'vil-boropole', en: 'Boropole', bn: 'বড়পোল' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-coxsbazar',
        en: "Cox's Bazar",
        bn: 'কক্সবাজার',
        upazilas: [
          {
            id: 'upz-coxsbazar-sadar',
            en: "Cox's Bazar Sadar",
            bn: 'কক্সবাজার সদর',
            postOffices: [
              {
                id: 'po-coxsbazar-4700',
                en: "Cox's Bazar Sadar PO",
                bn: 'কক্সবাজার সদর ডাকঘর',
                postCode: '4700',
                villages: [
                  { id: 'vil-kolatoli', en: 'Kolatoli', bn: 'কলাতলী' },
                  { id: 'vil-jhautala', en: 'Jhautala', bn: 'ঝাউতলা' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-cumilla',
        en: 'Cumilla',
        bn: 'কুমিল্লা',
        upazilas: [
          {
            id: 'upz-cumilla-sadar',
            en: 'Cumilla Adarsha Sadar',
            bn: 'কুমিল্লা আদর্শ সদর',
            postOffices: [
              {
                id: 'po-cumilla-3500',
                en: 'Cumilla Head PO',
                bn: 'কুমিল্লা প্রধান ডাকঘর',
                postCode: '3500',
                villages: [
                  { id: 'vil-kandirpar', en: 'Kandirpar', bn: 'কান্দিরপাড়' },
                  { id: 'vil-tomchom-bridge', en: 'Tomchom Bridge', bn: 'টমছম ব্রিজ' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-rajshahi',
    en: 'Rajshahi',
    bn: 'রাজশাহী',
    districts: [
      {
        id: 'dist-rajshahi',
        en: 'Rajshahi',
        bn: 'রাজশাহী',
        upazilas: [
          {
            id: 'upz-boalia',
            en: 'Boalia',
            bn: 'বোয়ালিয়া',
            postOffices: [
              {
                id: 'po-rajshahi-gpo-6000',
                en: 'Rajshahi GPO',
                bn: 'রাজশাহী জিপিও',
                postCode: '6000',
                villages: [
                  { id: 'vil-shaheb-bazar', en: 'Shaheb Bazar', bn: 'সাহেব বাজার' },
                  { id: 'vil-laxmipur-rmc', en: 'Laxmipur (RMCH)', bn: 'লক্ষ্মীপুর (রামেক)' },
                ],
              },
            ],
          },
          {
            id: 'upz-motihar',
            en: 'Motihar',
            bn: 'মতিহার',
            postOffices: [
              {
                id: 'po-ru-6205',
                en: 'Rajshahi University PO',
                bn: 'রাজশাহী বিশ্ববিদ্যালয় ডাকঘর',
                postCode: '6205',
                villages: [
                  { id: 'vil-binodpur', en: 'Binodpur Bazar', bn: 'বিনোদপুর বাজার' },
                  { id: 'vil-kazla', en: 'Kazla Gate', bn: 'কাজলা গেট' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-bogura',
        en: 'Bogura',
        bn: 'বগুড়া',
        upazilas: [
          {
            id: 'upz-bogura-sadar',
            en: 'Bogura Sadar',
            bn: 'বগুড়া সদর',
            postOffices: [
              {
                id: 'po-bogura-5800',
                en: 'Bogura Head PO',
                bn: 'বগুড়া প্রধান ডাকঘর',
                postCode: '5800',
                villages: [
                  { id: 'vil-satmatha', en: 'Satmatha', bn: 'সাতমাথা' },
                  { id: 'vil-silimpur', en: 'Silimpur (SZMCH)', bn: 'সিলিমপুর (শজিমেক)' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-khulna',
    en: 'Khulna',
    bn: 'খুলনা',
    districts: [
      {
        id: 'dist-khulna',
        en: 'Khulna',
        bn: 'খুলনা',
        upazilas: [
          {
            id: 'upz-sonadanga',
            en: 'Sonadanga',
            bn: 'সোনাডাঙ্গা',
            postOffices: [
              {
                id: 'po-sonadanga-9100',
                en: 'Khulna University / Sonadanga',
                bn: 'খুলনা বিশ্ববিদ্যালয় / সোনাডাঙ্গা',
                postCode: '9100',
                villages: [
                  { id: 'vil-boira', en: 'Boira (KMCH)', bn: 'বয়রা (খুমেক)' },
                  { id: 'vil-shib-bari', en: 'Shibbari More', bn: 'শিববাড়ি মোড়' },
                ],
              },
            ],
          },
          {
            id: 'upz-daulatpur',
            en: 'Daulatpur',
            bn: 'দৌলতপুর',
            postOffices: [
              {
                id: 'po-daulatpur-9202',
                en: 'Daulatpur PO',
                bn: 'দৌলতপুর ডাকঘর',
                postCode: '9202',
                villages: [
                  { id: 'vil-fulbarigate', en: 'Fulbarigate (KUET)', bn: 'ফুলবাড়িগেট (কুয়েট)' },
                  { id: 'vil-religate', en: 'Religate', bn: 'রেলিগেট' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-jashore',
        en: 'Jashore',
        bn: 'যশোর',
        upazilas: [
          {
            id: 'upz-jashore-sadar',
            en: 'Jashore Sadar',
            bn: 'যশোর সদর',
            postOffices: [
              {
                id: 'po-jashore-7400',
                en: 'Jashore Head PO',
                bn: 'যশোর প্রধান ডাকঘর',
                postCode: '7400',
                villages: [
                  { id: 'vil-chachra', en: 'Chachra', bn: 'চাঁচড়া' },
                  { id: 'vil-daratana', en: 'Daratana', bn: 'দড়াটানা' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-sylhet',
    en: 'Sylhet',
    bn: 'সিলেট',
    districts: [
      {
        id: 'dist-sylhet',
        en: 'Sylhet',
        bn: 'সিলেট',
        upazilas: [
          {
            id: 'upz-sylhet-sadar',
            en: 'Sylhet Sadar',
            bn: 'সিলেট সদর',
            postOffices: [
              {
                id: 'po-sylhet-3100',
                en: 'Sylhet GPO',
                bn: 'সিলেট জিপিও',
                postCode: '3100',
                villages: [
                  { id: 'vil-kajolshah', en: 'Kajolshah (SOMCH)', bn: 'কাজলশাহ (সিওমেক)' },
                  { id: 'vil-zindabazar', en: 'Zindabazar', bn: 'জিন্দাবাজার' },
                  { id: 'vil-amberkhana', en: 'Amberkhana', bn: 'আম্বরখানা' },
                ],
              },
              {
                id: 'po-sust-3114',
                en: 'Akhalia / SUST',
                bn: 'আখালিয়া / শাবিপ্রবি',
                postCode: '3114',
                villages: [
                  { id: 'vil-akhalia', en: 'Akhalia', bn: 'আখালিয়া' },
                  { id: 'vil-modina-market', en: 'Modina Market', bn: 'মদিনা মার্কেট' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'dist-moulvibazar',
        en: 'Moulvibazar',
        bn: 'মৌলভীবাজার',
        upazilas: [
          {
            id: 'upz-sreemangal',
            en: 'Sreemangal',
            bn: 'শ্রীমঙ্গল',
            postOffices: [
              {
                id: 'po-sreemangal-3210',
                en: 'Sreemangal PO',
                bn: 'শ্রীমঙ্গল ডাকঘর',
                postCode: '3210',
                villages: [
                  { id: 'vil-chaubazar', en: 'Choumuhona', bn: 'চৌমুহনা' },
                  { id: 'vil-bhanugach', en: 'Bhanugach Road', bn: 'ভানুগাছ রোড' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-barishal',
    en: 'Barishal',
    bn: 'বরিশাল',
    districts: [
      {
        id: 'dist-barishal',
        en: 'Barishal',
        bn: 'বরিশাল',
        upazilas: [
          {
            id: 'upz-barishal-sadar',
            en: 'Barishal Sadar',
            bn: 'বরিশাল সদর',
            postOffices: [
              {
                id: 'po-barishal-8200',
                en: 'Barishal Head PO',
                bn: 'বরিশাল প্রধান ডাকঘর',
                postCode: '8200',
                villages: [
                  { id: 'vil-band-road', en: 'Band Road (SBMCH)', bn: 'বান্দ রোড (শেবাচিম)' },
                  { id: 'vil-nathullabad', en: 'Nathullabad', bn: 'নথুল্লাবাদ' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-rangpur',
    en: 'Rangpur',
    bn: 'রংপুর',
    districts: [
      {
        id: 'dist-rangpur',
        en: 'Rangpur',
        bn: 'রংপুর',
        upazilas: [
          {
            id: 'upz-rangpur-sadar',
            en: 'Rangpur Sadar',
            bn: 'রংপুর সদর',
            postOffices: [
              {
                id: 'po-rangpur-5400',
                en: 'Rangpur Head PO',
                bn: 'রংপুর প্রধান ডাকঘর',
                postCode: '5400',
                villages: [
                  { id: 'vil-medical-more', en: 'Medical More (RpMCH)', bn: 'মেডিকেল মোড় (রমেক)' },
                  { id: 'vil-jahaj-company', en: 'Jahaj Company More', bn: 'জাহাজ কোম্পানি মোড়' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'div-mymensingh',
    en: 'Mymensingh',
    bn: 'ময়মনসিংহ',
    districts: [
      {
        id: 'dist-mymensingh',
        en: 'Mymensingh',
        bn: 'ময়মনসিংহ',
        upazilas: [
          {
            id: 'upz-mymensingh-sadar',
            en: 'Mymensingh Sadar',
            bn: 'ময়মনসিংহ সদর',
            postOffices: [
              {
                id: 'po-mymensingh-2200',
                en: 'Mymensingh Head PO',
                bn: 'ময়মনসিংহ প্রধান ডাকঘর',
                postCode: '2200',
                villages: [
                  { id: 'vil-charpara', en: 'Charpara (MMCH)', bn: 'চরপাড়া (মমেক)' },
                  { id: 'vil-ganginarpar', en: 'Ganginarpar', bn: 'গাঙ্গিনারপাড়' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getDivisions(): DivisionNode[] {
  return BANGLADESH_LOCATIONS;
}

export function getDistrictsByDivision(divisionId: string): DistrictNode[] {
  return BANGLADESH_LOCATIONS.find((d) => d.id === divisionId)?.districts ?? [];
}

export function getUpazilasByDistrict(divisionId: string, districtId: string): UpazilaNode[] {
  return (
    getDistrictsByDivision(divisionId).find((dist) => dist.id === districtId)?.upazilas ?? []
  );
}

export function getPostOfficesByUpazila(
  divisionId: string,
  districtId: string,
  upazilaId: string
): PostOfficeNode[] {
  return (
    getUpazilasByDistrict(divisionId, districtId).find((u) => u.id === upazilaId)?.postOffices ??
    []
  );
}

export function getVillagesByPostOffice(
  divisionId: string,
  districtId: string,
  upazilaId: string,
  postOfficeId: string
): VillageNode[] {
  return (
    getPostOfficesByUpazila(divisionId, districtId, upazilaId).find(
      (po) => po.id === postOfficeId
    )?.villages ?? []
  );
}

export interface ResolvedLocationNames {
  division: string;
  district: string;
  upazila: string;
  postOffice: string;
  postCode?: string;
  village: string;
  compact: string;
  fullBreadcrumb: string;
}

export function resolveLocationNames(
  loc: Partial<LocationSelection> & { villageOrArea?: string | null },
  lang: Language = 'en'
): ResolvedLocationNames {
  const div = BANGLADESH_LOCATIONS.find((d) => d.id === loc.divisionId);
  const dist = div?.districts.find((d) => d.id === loc.districtId);
  const upz = dist?.upazilas.find((u) => u.id === loc.upazilaId);
  const po = upz?.postOffices.find((p) => p.id === loc.postOfficeId);
  const vil = po?.villages.find((v) => v.id === loc.villageId);

  const division = div ? div[lang] : '';
  const district = dist ? dist[lang] : '';
  const upazila = upz ? upz[lang] : '';
  const postOffice = po ? `${po[lang]} (${po.postCode})` : '';
  const village = vil ? vil[lang] : loc.villageOrArea || '';

  const compactParts = [upazila, district].filter(Boolean);
  const fullParts = [village, postOffice, upazila, district, division].filter(Boolean);

  return {
    division,
    district,
    upazila,
    postOffice,
    postCode: po?.postCode,
    village,
    compact: compactParts.join(', '),
    fullBreadcrumb: fullParts.join(' → '),
  };
}
