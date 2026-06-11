
-- Akif Portfolio Version 2.0 Supabase setup
-- Run this in Supabase SQL Editor. It keeps the demo content and makes all titles editable from /app/.
-- Admin email: akif.sayeed01@gmail.com

create extension if not exists pgcrypto;

create table if not exists site_settings (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamp with time zone default now()
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  image_url text not null,
  published boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  year text,
  image_url text,
  published boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  published boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table site_settings enable row level security;
alter table gallery enable row level security;
alter table certificates enable row level security;
alter table posts enable row level security;
alter table messages enable row level security;

drop policy if exists "public can read site settings" on site_settings;
drop policy if exists "admin can insert site settings" on site_settings;
drop policy if exists "admin can update site settings" on site_settings;
drop policy if exists "admin can delete site settings" on site_settings;
create policy "public can read site settings" on site_settings for select using (true);
create policy "admin can insert site settings" on site_settings for insert with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can update site settings" on site_settings for update using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can delete site settings" on site_settings for delete using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

drop policy if exists "public can read gallery" on gallery;
drop policy if exists "admin can manage gallery" on gallery;
create policy "public can read gallery" on gallery for select using (published = true or auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can manage gallery" on gallery for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

drop policy if exists "public can read certificates" on certificates;
drop policy if exists "admin can manage certificates" on certificates;
create policy "public can read certificates" on certificates for select using (published = true or auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can manage certificates" on certificates for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

drop policy if exists "public can read posts" on posts;
drop policy if exists "admin can manage posts" on posts;
create policy "public can read posts" on posts for select using (published = true or auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can manage posts" on posts for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

drop policy if exists "anyone can send message" on messages;
drop policy if exists "admin can read messages" on messages;
drop policy if exists "admin can update messages" on messages;
drop policy if exists "admin can delete messages" on messages;
create policy "anyone can send message" on messages for insert with check (true);
create policy "admin can read messages" on messages for select using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can update messages" on messages for update using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');
create policy "admin can delete messages" on messages for delete using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile', 'profile', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery', 'gallery', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif']),
  ('certificates', 'certificates', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif','application/pdf']),
  ('posts', 'posts', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read portfolio storage" on storage.objects;
drop policy if exists "admin can manage portfolio storage" on storage.objects;
create policy "public can read portfolio storage" on storage.objects for select using (bucket_id in ('profile','gallery','certificates','posts'));
create policy "admin can manage portfolio storage" on storage.objects for all using (bucket_id in ('profile','gallery','certificates','posts') and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com') with check (bucket_id in ('profile','gallery','certificates','posts') and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

insert into site_settings (id, content, updated_at)
values ('main', $json${
  "site": {
    "name": "AKIF BIN SAYEED",
    "logoText": "ABS",
    "logoImage": "",
    "logoAlt": "AKIF BIN SAYEED logo",
    "brandSubtitle": "Research / GIS / Leadership",
    "pageTitle": "AKIF BIN SAYEED | Portfolio",
    "metaDescription": "Portfolio of Akif Bin Sayeed: agricultural economics, GIS and remote sensing, youth leadership, research and sustainability work.",
    "footerText": "Custom portfolio for research visibility.",
    "footerCredit": "Designed with a custom editorial interface — no template look."
  },
  "nav": {
    "about": "About",
    "experience": "Experience",
    "projects": "Projects",
    "skills": "Skills",
    "certificates": "Certificates",
    "gallery": "Gallery",
    "posts": "Updates",
    "contact": "Contact"
  },
  "hero": {
    "eyebrow": "Field notes / GIS / Agribusiness",
    "availability": "Open to research collaboration, PhD opportunities, consulting, and innovation programs",
    "title": "AKIF\nBIN SAYEED",
    "headline": "Agricultural Economics | GIS & Remote Sensing | Youth Leadership",
    "summary": "A multidisciplinary young professional working across agricultural economics, agribusiness research, GIS & remote sensing, sustainability, entrepreneurship development, and national-level youth initiatives.",
    "location": "Gazipur, Bangladesh",
    "profileImage": "",
    "profileAlt": "Akif Bin Sayeed profile photo",
    "visualTitle": "ABS",
    "visualCaption": "Interactive research profile space",
    "visualFooterTitle": "Gazipur, Bangladesh",
    "visualFooterText": "Field research, spatial analysis, agribusiness studies, and youth innovation programs.",
    "tags": [
      "Agribusiness Research",
      "GIS & Remote Sensing",
      "Climate-Smart Agriculture",
      "Youth Innovation"
    ],
    "buttons": [
      {
        "label": "Explore Work",
        "url": "#projects",
        "style": "primary"
      },
      {
        "label": "Collaborate",
        "url": "#contact",
        "style": "secondary"
      }
    ],
    "floatingLabels": [
      {
        "label": "GIS",
        "x": 54,
        "y": 1,
        "delay": 0
      },
      {
        "label": "RS",
        "x": 8,
        "y": 8,
        "delay": 0.18
      },
      {
        "label": "Drone Mapping",
        "x": 78,
        "y": 10,
        "delay": 0.36
      },
      {
        "label": "GEE",
        "x": 9,
        "y": 23,
        "delay": 0.54
      },
      {
        "label": "Spatial Data",
        "x": 58,
        "y": 30,
        "delay": 0.72
      },
      {
        "label": "Field Research",
        "x": 80,
        "y": 24,
        "delay": 0.9
      },
      {
        "label": "Agribusiness",
        "x": 72,
        "y": 43,
        "delay": 1.08
      },
      {
        "label": "Youth Leadership",
        "x": 6,
        "y": 62,
        "delay": 0
      },
      {
        "label": "UAV",
        "x": 35,
        "y": 70,
        "delay": 0.18
      },
      {
        "label": "ArcGIS",
        "x": 55,
        "y": 76,
        "delay": 0.36
      },
      {
        "label": "Pix4D",
        "x": 18,
        "y": 82,
        "delay": 0.54
      },
      {
        "label": "R",
        "x": 48,
        "y": 96,
        "delay": 0.72
      },
      {
        "label": "SPSS",
        "x": 82,
        "y": 88,
        "delay": 0.9
      },
      {
        "label": "Google Colab",
        "x": 60,
        "y": 84,
        "delay": 1.08
      },
      {
        "label": "Survey Ops",
        "x": 4,
        "y": 48,
        "delay": 0
      },
      {
        "label": "Climate Action",
        "x": 94,
        "y": 56,
        "delay": 0.18
      },
      {
        "label": "Startup Mentor",
        "x": 90,
        "y": 66,
        "delay": 0.36
      }
    ]
  },
  "sections": {
    "about": {
      "eyebrow": "Profile",
      "title": "Research-driven, field-tested, and community-focused",
      "subtitle": "A practical profile shaped by fieldwork, research coordination, GIS exposure, and youth leadership."
    },
    "experience": {
      "eyebrow": "Experience",
      "title": "Research, leadership, and program coordination",
      "subtitle": "Fieldwork, spatial research, national coordination, entrepreneurship support, and youth-led community programs in one timeline."
    },
    "projects": {
      "eyebrow": "Projects",
      "title": "Selected work with people, places, and data",
      "subtitle": "Research and innovation projects can be updated later with publications, field photos, reports, code links, or Google Colab resources."
    },
    "skills": {
      "eyebrow": "Skills",
      "title": "Tools, field methods, and leadership strengths",
      "subtitle": "Technical, research, field, and leadership strengths."
    },
    "certificates": {
      "eyebrow": "Certificate Corner",
      "title": "Credentials, awards, and proof of work",
      "subtitle": "Add certificate images later from the private owner panel or by uploading files to assets/images/certificates/."
    },
    "gallery": {
      "eyebrow": "Gallery",
      "title": "Fieldwork, events, and presentations",
      "subtitle": "Replace placeholders with field survey, drone/GIS, summit, training, and community photos."
    },
    "posts": {
      "eyebrow": "Updates",
      "title": "Updates & Notes",
      "subtitle": "Short posts, announcements, or reflections from research and leadership activities."
    },
    "contact": {
      "eyebrow": "Send Message",
      "title": "Let’s collaborate on sustainable agriculture, spatial research, and youth innovation.",
      "subtitle": "I am interested in research collaboration, PhD opportunities, GIS/RS projects, agribusiness studies, youth innovation programs and field-based data collection projects."
    }
  },
  "about": {
    "paragraphs": [
      "I combine agricultural economics, field-based socioeconomic research, GIS and remote sensing, and youth leadership to support practical solutions for sustainable agriculture and rural development.",
      "My experience includes research assistance in GIS and remote sensing laboratories, sustainable aviation fuel feedstock feasibility studies, aquaculture supply-chain research, farm profitability analysis, consumer preference studies, and large-scale survey operations.",
      "Alongside research, I have led and coordinated national-level entrepreneurship and youth programs, mentoring students, managing teams, and building active innovation communities."
    ],
    "focusAreas": [
      "Agricultural Economics and Agribusiness",
      "GIS, Remote Sensing, UAV and Satellite Data",
      "Sustainability, Climate Action and Agroforestry",
      "Survey Design, Data Collection and Analysis",
      "Youth Leadership and Entrepreneurship Development"
    ],
    "stats": [
      {
        "label": "Survey responses supervised",
        "value": "2000+"
      },
      {
        "label": "Universities coordinated",
        "value": "60+"
      },
      {
        "label": "Trees planted through campaigns",
        "value": "500+"
      },
      {
        "label": "Weekly hours mentoring innovators",
        "value": "25-30"
      }
    ]
  },
  "education": [
    {
      "degree": "Master of Science (MS) in Agroforestry and Environment",
      "institution": "Bangladesh Agricultural University / Gazipur Agricultural University (GAU)",
      "year": "Ongoing",
      "details": "GIS & Remote Sensing; Environmental Sustainability; Climate-Smart Agriculture; Agroforestry Systems; Spatial Data Analysis"
    },
    {
      "degree": "Bachelor of Science (BS) in Agricultural Economics",
      "institution": "Bangabandhu Sheikh Mujibur Rahman Agricultural University (BSMRAU), Gazipur",
      "year": "Completed: 2025",
      "details": "CGPA: Approximately 2.86; Agricultural Economics; Agribusiness Management; Agricultural Finance; Rural Development; Statistics and Data Analysis"
    },
    {
      "degree": "Higher Secondary Certificate (HSC)",
      "institution": "Government Ananda Mohan College",
      "year": "2019",
      "details": "GPA: 5.00"
    },
    {
      "degree": "Secondary School Certificate (SSC)",
      "institution": "Mymensingh Zilla School",
      "year": "2017",
      "details": "GPA: 5.00"
    }
  ],
  "experiences": [
    {
      "title": "Research Assistant",
      "organization": "GIS & Remote Sensing Laboratory, Gazipur Agricultural University (GAU)",
      "period": "2025 - Present",
      "category": "Research",
      "location": "Gazipur, Bangladesh",
      "description": "Supporting GIS and remote sensing-based agricultural and environmental research using spatial datasets, drone imagery, multispectral imagery, and satellite data.",
      "bullets": [
        "Assisting with crop monitoring and precision agriculture field experiments.",
        "Supporting data management, preprocessing, and interpretation of remotely sensed data.",
        "Working with RGB, RedEdge, infrared and satellite imagery for agricultural analysis."
      ],
      "tags": [
        "ArcGIS",
        "Google Earth Engine",
        "Drone Data",
        "Pix4D",
        "Spatial Analysis"
      ]
    },
    {
      "title": "Research Assistant",
      "organization": "Feasibility Study on Feedstock Oil Crop Cultivation for Sustainable Aviation Fuel",
      "period": "July 2025",
      "category": "Research",
      "location": "Khagrachhari, Rangamati, Baghaichhari, Lama, Rowangchhari",
      "description": "Sponsored by Euglena Co., Ltd., Japan, this field study assessed the feasibility of feedstock oil crop production for SAF supply-chain development in Bangladesh.",
      "bullets": [
        "Conducted field surveys among indigenous and tribal communities in the Chittagong Hill Tracts.",
        "Collected socioeconomic, land-use, water availability and environmental data from more than 200 respondents.",
        "Supported sustainability and greenhouse-gas-related data analysis."
      ],
      "tags": [
        "SAF",
        "Survey",
        "Sustainability",
        "GHG",
        "Field Research"
      ]
    },
    {
      "title": "Research Assistant",
      "organization": "Coffee Consumer Preference and Origin Perception Study, Department of Agribusiness",
      "period": "2025",
      "category": "Research",
      "location": "Bandarban, Bangladesh",
      "description": "Worked on farm-level and consumer-level research connecting tribal coffee farmers, urban consumers, origin perception and agribusiness economics.",
      "bullets": [
        "Collected data from more than 80 tribal coffee farmers and more than 200 urban consumers.",
        "Assisted questionnaire development and refinement.",
        "Integrated farm-level economic analysis including variable cost and BCR estimation."
      ],
      "tags": [
        "Consumer Behavior",
        "BCR",
        "Coffee",
        "Agribusiness",
        "Rural Entrepreneurship"
      ]
    },
    {
      "title": "Data Enumerator & Data Analyst",
      "organization": "Carp Biosecurity and Aquaculture Supply Chain Project",
      "period": "January 2025",
      "category": "Research",
      "location": "Mymensingh, Jashore, Khulna, Cumilla, Chattogram",
      "description": "Funded by USAID Feed the Future, Texas State University, Mississippi State University and Bangladesh Agricultural University.",
      "bullets": [
        "Interviewed hatchery owners, fish farmers and supply-chain actors across Bangladesh.",
        "Supported biosecurity-related research in aquaculture systems.",
        "Participated in data cleaning, organization and preliminary statistical analysis."
      ],
      "tags": [
        "Aquaculture",
        "Biosecurity",
        "Supply Chain",
        "R",
        "SPSS"
      ]
    },
    {
      "title": "Research Intern",
      "organization": "Bangladesh Institute of Nuclear Agriculture (BINA)",
      "period": "December 2024 - March 2025",
      "category": "Research",
      "location": "Bangladesh",
      "description": "Project: Financial Profitability Analysis of Binadhan-16 at Farm Level.",
      "bullets": [
        "Evaluated profitability indicators including cost, return and net benefit.",
        "Collected farmer-level production and management data.",
        "Prepared analytical reports and findings."
      ],
      "tags": [
        "Profitability",
        "Farm Economics",
        "Survey",
        "Agricultural Reporting"
      ]
    },
    {
      "title": "Field Interviewer → Supervisor → Recruiter & Data Collection Trainer",
      "organization": "Crystal Research & Consultancy",
      "period": "August 2024 - October 2024",
      "category": "Research",
      "location": "Bangladesh",
      "description": "Progressed from field interviewer to supervisory and recruitment responsibilities based on performance in market research operations.",
      "bullets": [
        "Supervised survey teams across multiple districts.",
        "Collected and monitored over 2,000 survey responses.",
        "Recruited and trained data collectors while ensuring survey quality control."
      ],
      "tags": [
        "Team Management",
        "QA",
        "Survey Operations",
        "Training"
      ]
    },
    {
      "title": "On-Campus Coordinator",
      "organization": "Hult Prize Bangladesh National Team",
      "period": "2024 - Present",
      "category": "Leadership",
      "location": "Bangladesh",
      "description": "Mentoring campus directors and coordinating national-level entrepreneurship and innovation activities across Bangladesh.",
      "bullets": [
        "Spending approximately 25-30 hours weekly supporting entrepreneurial ecosystems.",
        "Guiding students in startup development, pitching and competition preparation.",
        "Mentored winning and finalist teams from Bangladesh, India and Pakistan."
      ],
      "tags": [
        "Leadership",
        "Startup Mentorship",
        "Team Coordination",
        "Strategic Planning"
      ]
    },
    {
      "title": "Campus Director",
      "organization": "Hult Prize at BSMRAU",
      "period": "2024",
      "category": "Leadership",
      "location": "BSMRAU, Gazipur",
      "description": "Led campus-wide execution of Hult Prize programs, including recruitment, logistics, sponsorship communication and team management.",
      "bullets": [
        "Reached approximately 1,500 students through promotional campaigns.",
        "Organized workshops, promotional activities and startup-focused events.",
        "Built a large and active organizing team."
      ],
      "tags": [
        "Event Execution",
        "Student Engagement",
        "Sponsorship",
        "Innovation"
      ]
    },
    {
      "title": "Secretary General",
      "organization": "Prothom Alo Bondhushava - GAU / BSMRAU Unit",
      "period": "Recent",
      "category": "Leadership",
      "location": "Gazipur, Bangladesh",
      "description": "Led an active student volunteer organization organizing social awareness, cultural, mental health and youth development programs.",
      "bullets": [
        "Managed large-scale events with audiences ranging from hundreds to over a thousand participants.",
        "Coordinated membership expansion and volunteer management.",
        "Organized mental health awareness and youth engagement programs."
      ],
      "tags": [
        "Volunteer Management",
        "Public Relations",
        "Community Mobilization"
      ]
    },
    {
      "title": "Organizer",
      "organization": "Hult Prize National Summit Bangladesh 2025, Chittagong University",
      "period": "2025",
      "category": "Events",
      "location": "Chittagong University",
      "description": "Contributed to a national entrepreneurship summit with participation from more than 60 universities.",
      "bullets": [
        "Managed logistics, communication and stakeholder coordination.",
        "Supported networking among students, mentors, judges and entrepreneurs."
      ],
      "tags": [
        "National Summit",
        "Logistics",
        "Stakeholders",
        "Entrepreneurship"
      ]
    },
    {
      "title": "Organizer",
      "organization": "Career Compass: Mastering Corporate World & Personal Branding",
      "period": "2025",
      "category": "Events",
      "location": "Bangladesh",
      "description": "Organized youth-focused career development sessions on corporate skills and personal branding.",
      "bullets": [
        "Coordinated speakers, participants and promotional activities."
      ],
      "tags": [
        "Career Development",
        "Personal Branding",
        "Youth"
      ]
    },
    {
      "title": "Organizer",
      "organization": "Master Class on Agribusiness Career & Entrepreneurship",
      "period": "2026",
      "category": "Events",
      "location": "Bangladesh",
      "description": "Promoted agribusiness entrepreneurship and career awareness among students.",
      "bullets": [
        "Managed speaker communication and event execution."
      ],
      "tags": [
        "Agribusiness",
        "Entrepreneurship",
        "Professional Development"
      ]
    }
  ],
  "projects": [
    {
      "title": "GIS & Remote Sensing for Crop Monitoring",
      "type": "Research Focus",
      "summary": "Integration of drone imagery, multispectral data, satellite imagery and spatial analysis for crop growth monitoring, precision agriculture and environmental assessment.",
      "tags": [
        "ArcGIS",
        "Google Earth Engine",
        "Pix4D",
        "UAV Imagery"
      ],
      "image_url": "",
      "link": "#"
    },
    {
      "title": "Feedstock Oil Crop Cultivation for Sustainable Aviation Fuel",
      "type": "Field Research",
      "summary": "Feasibility assessment of feedstock oil crops for sustainable aviation fuel production in Bangladesh using field surveys, land-use information and sustainability-related data.",
      "tags": [
        "Survey Design",
        "Socioeconomic Data",
        "Sustainability Assessment"
      ],
      "image_url": "",
      "link": "#"
    },
    {
      "title": "Coffee Origin Perception and Consumer Preference",
      "type": "Agribusiness Research",
      "summary": "A study involving tribal coffee farmers and urban consumers to understand coffee origin perception, purchasing behavior and farm-level profitability.",
      "tags": [
        "Consumer Survey",
        "BCR",
        "Farm Economics"
      ],
      "image_url": "",
      "link": "#"
    },
    {
      "title": "Carp Biosecurity and Aquaculture Supply Chain",
      "type": "Survey & Data Analysis",
      "summary": "Research support for aquaculture biosecurity and supply-chain analysis across multiple districts in Bangladesh.",
      "tags": [
        "R",
        "SPSS",
        "Survey",
        "Supply Chain"
      ],
      "image_url": "",
      "link": "#"
    }
  ],
  "skills": [
    {
      "group": "Data Analysis & Statistical Tools",
      "items": [
        "R Programming",
        "SPSS",
        "Microsoft Excel",
        "Google Sheets",
        "Data Cleaning",
        "Quantitative and Qualitative Survey Analysis"
      ]
    },
    {
      "group": "GIS & Remote Sensing",
      "items": [
        "ArcGIS / ArcMap 10.8",
        "Google Earth Engine",
        "Drone Data Collection",
        "Pix4D",
        "Satellite Image Processing",
        "Spatial Data Analysis"
      ]
    },
    {
      "group": "Research & Field Skills",
      "items": [
        "Survey Design",
        "Questionnaire Development",
        "Socioeconomic Research",
        "Agricultural Economic Analysis",
        "Consumer Behavior Analysis",
        "Rural Field Coordination",
        "Report Writing"
      ]
    },
    {
      "group": "Communication & Leadership",
      "items": [
        "Public Speaking",
        "Event Management",
        "Team Leadership",
        "Stakeholder Communication",
        "Training & Mentoring",
        "Volunteer Coordination",
        "Organizational Development"
      ]
    }
  ],
  "researchHighlights": [
    {
      "title": "Agricultural economics and agribusiness",
      "text": "Farm-level profitability, BCR estimation, consumer preference, rural development and market perception studies."
    },
    {
      "title": "GIS, UAV, and spatial data analysis",
      "text": "Growing work with drone imagery, satellite data, Google Earth Engine, ArcGIS, Pix4D and spatial analysis for agriculture."
    },
    {
      "title": "Sustainability, climate action and agroforestry",
      "text": "Interest in SAF feedstock systems, climate-smart agriculture, agroforestry, ecosystem restoration and rural sustainability."
    }
  ],
  "contact": {
    "email": "akif.sayeed01@gmail.com",
    "phone": "",
    "location": "Gazipur, Bangladesh",
    "social": [
      {
        "label": "LinkedIn",
        "url": "#"
      },
      {
        "label": "ResearchGate",
        "url": "#"
      },
      {
        "label": "Google Scholar",
        "url": "#"
      },
      {
        "label": "Facebook",
        "url": "#"
      }
    ]
  },
  "gallery": [
    {
      "image": "",
      "title": "Add event photo",
      "caption": "Use the admin panel to upload and caption a real photo."
    },
    {
      "image": "",
      "title": "Add field research photo",
      "caption": "Add a strong fieldwork image from your research."
    },
    {
      "image": "",
      "title": "Add presentation photo",
      "caption": "Add a photo from workshops, summits or academic presentations."
    }
  ],
  "certificates": [
    {
      "type": "Competition",
      "year": "2022",
      "image": "",
      "title": "Hult Prize OnCampus Champion",
      "issuer": "Hult Prize at BSMRAU",
      "description": "Recognized as champion in the campus-level entrepreneurship competition."
    },
    {
      "type": "Competition",
      "year": "2021",
      "image": "",
      "title": "First Runner-Up & Regional Finalist",
      "issuer": "Hult Prize OnCampus / Kolkata Regional",
      "description": "Regional finalist recognition from the Hult Prize entrepreneurship pathway."
    },
    {
      "type": "Summit",
      "year": "2022",
      "image": "",
      "title": "Mumbai Impact Summit Participant",
      "issuer": "Hult Prize / Impact Summit",
      "description": "Participation in an international impact and innovation summit."
    },
    {
      "type": "Leadership",
      "year": "2024",
      "image": "",
      "title": "Campus Director Recognition",
      "issuer": "Hult Prize at BSMRAU",
      "description": "Led campus-wide execution, participant engagement, promotion, and organizing team coordination."
    },
    {
      "type": "National Team",
      "year": "2024–Present",
      "image": "",
      "title": "On-Campus Coordinator",
      "issuer": "Hult Prize Bangladesh National Team",
      "description": "Supporting campus directors and mentoring student innovators across Bangladesh and South Asia."
    }
  ],
  "achievements": [
    "First Runner-Up and Regional Finalist (Kolkata) - Hult Prize OnCampus 2021",
    "Champion - Hult Prize OnCampus 2022",
    "Participant - Mumbai Impact Summit 2022",
    "Chief of Staff - Hult Prize BSMRAU 2023",
    "Campus Director - Hult Prize BSMRAU 2024",
    "On-Campus Coordinator - Hult Prize Bangladesh National Team",
    "Mentored and supported winning/finalist teams across South Asia"
  ],
  "visual": {
    "chipBehavior": {
      "hoverMode": "vanish",
      "hoverScale": "0.65",
      "moveDistance": "90",
      "vanishOpacity": "0"
    }
  }
}$json$::jsonb, now())
on conflict (id) do update set content = excluded.content, updated_at = now();
