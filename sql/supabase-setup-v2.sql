
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
    "name": "Akif Bin Sayeed",
    "logoText": "ABS",
    "brandSubtitle": "Research / GIS / Leadership",
    "pageTitle": "Akif Bin Sayeed | Portfolio",
    "metaDescription": "Portfolio of Akif Bin Sayeed: agricultural economics, GIS and remote sensing, youth leadership, research and sustainability work.",
    "footerText": "Designed for field research, spatial thinking, and youth-led innovation.",
    "footerCredit": "Built with care for Akif Bin Sayeed"
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
    "title": "Akif Bin Sayeed",
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
        "label": "View Experience",
        "url": "#experience",
        "style": "primary"
      },
      {
        "label": "Contact Me",
        "url": "#contact",
        "style": "secondary"
      }
    ],
    "floatingLabels": [
      {
        "label": "UAV",
        "x": 55,
        "y": 4
      },
      {
        "label": "Drone Mapping",
        "x": 74,
        "y": 18
      },
      {
        "label": "GEE",
        "x": 7,
        "y": 30
      },
      {
        "label": "R",
        "x": 53,
        "y": 35
      },
      {
        "label": "Climate Action",
        "x": 8,
        "y": 13
      },
      {
        "label": "Youth Leadership",
        "x": 65,
        "y": 53
      },
      {
        "label": "Agribusiness",
        "x": 5,
        "y": 62
      },
      {
        "label": "Google Colab",
        "x": 30,
        "y": 69
      },
      {
        "label": "Survey Ops",
        "x": 50,
        "y": 75
      },
      {
        "label": "Spatial Data",
        "x": 16,
        "y": 86
      },
      {
        "label": "ArcGIS",
        "x": 43,
        "y": 92
      },
      {
        "label": "SPSS",
        "x": 83,
        "y": 64
      },
      {
        "label": "Field Research",
        "x": 75,
        "y": 87
      },
      {
        "label": "Startup Mentor",
        "x": 73,
        "y": 38
      }
    ]
  },
  "sections": {
    "about": {
      "eyebrow": "Profile",
      "title": "About Akif",
      "subtitle": "A practical profile shaped by fieldwork, research coordination, GIS exposure, and youth leadership."
    },
    "experience": {
      "eyebrow": "Work",
      "title": "Research & Professional Experience",
      "subtitle": "A timeline of field-based research, data work, coordination, and leadership responsibilities."
    },
    "projects": {
      "eyebrow": "Selected Work",
      "title": "Projects & Research Focus",
      "subtitle": "Highlighted research, fieldwork, and innovation activities."
    },
    "skills": {
      "eyebrow": "Capability",
      "title": "Skills & Tools",
      "subtitle": "Technical, research, field, and leadership strengths."
    },
    "certificates": {
      "eyebrow": "Recognition",
      "title": "Certificate Corner",
      "subtitle": "Certificates, awards, and formal recognitions can be uploaded and managed here."
    },
    "gallery": {
      "eyebrow": "Visual Notes",
      "title": "Gallery",
      "subtitle": "Fieldwork, events, certificates, and research moments shown without forced cropping."
    },
    "posts": {
      "eyebrow": "Journal",
      "title": "Updates & Notes",
      "subtitle": "Short posts, announcements, or reflections from research and leadership activities."
    },
    "contact": {
      "eyebrow": "Connect",
      "title": "Contact",
      "subtitle": "For research collaboration, PhD opportunities, programs, consulting, or speaking."
    }
  },
  "about": {
    "paragraphs": [
      "Dynamic young professional with multidisciplinary experience spanning agricultural economics, agribusiness research, GIS & remote sensing, youth leadership, entrepreneurship development, and large-scale event management.",
      "Experienced in coordinating innovation programs, conducting field-based socioeconomic and agricultural research, mentoring student entrepreneurs, and managing youth initiatives with sustainability and community impact."
    ],
    "stats": [
      {
        "value": "2000+",
        "label": "Survey responses supervised"
      },
      {
        "value": "60+",
        "label": "Universities reached through Hult Prize programs"
      },
      {
        "value": "500+",
        "label": "Trees planted through sustainability campaigns"
      },
      {
        "value": "5+",
        "label": "Research and field projects"
      }
    ]
  },
  "education": [
    {
      "degree": "MS in Agroforestry and Environment",
      "institution": "Bangladesh Agricultural University / Gazipur Agricultural University",
      "year": "Ongoing",
      "details": "GIS & Remote Sensing, environmental sustainability, climate-smart agriculture, agroforestry systems, and spatial data analysis."
    },
    {
      "degree": "BS in Agricultural Economics",
      "institution": "Bangabandhu Sheikh Mujibur Rahman Agricultural University",
      "year": "Completed 2025",
      "details": "Agricultural economics, agribusiness management, agricultural finance, rural development, statistics, and data analysis."
    },
    {
      "degree": "HSC, Science",
      "institution": "Government Ananda Mohan College",
      "year": "2019",
      "details": "GPA 5.00"
    },
    {
      "degree": "SSC, Science",
      "institution": "Mymensingh Zilla School",
      "year": "2017",
      "details": "GPA 5.00"
    }
  ],
  "experiences": [
    {
      "title": "Research Assistant",
      "organization": "GIS & Remote Sensing Laboratory, GAU",
      "period": "2025 – Present",
      "category": "GIS & Remote Sensing",
      "description": "Supporting agricultural and environmental research using spatial datasets, drone imagery, multispectral data, and satellite imagery.",
      "bullets": [
        "Assisted crop monitoring and precision agriculture field experiments.",
        "Worked with ArcGIS / ArcMap 10.8, Google Earth Engine, Pix4D, and drone-based data collection.",
        "Supported RGB, RedEdge, and infrared imagery integration for agricultural analysis."
      ],
      "tags": [
        "GIS",
        "Drone imagery",
        "Spatial analysis"
      ]
    },
    {
      "title": "Research Assistant",
      "organization": "Feasibility Study on Feedstock Oil Crop Cultivation for Sustainable Aviation Fuel",
      "period": "July 2025",
      "category": "Sustainability Research",
      "description": "Field and socioeconomic research across Chittagong Hill Tracts for feedstock oil crop feasibility and SAF supply chain development.",
      "bullets": [
        "Collected socioeconomic, land use, water availability, and environmental data from 200+ respondents.",
        "Worked with indigenous and tribal communities in remote field conditions.",
        "Supported sustainability and greenhouse gas-related data analysis."
      ],
      "tags": [
        "SAF",
        "Field survey",
        "Sustainability"
      ]
    },
    {
      "title": "Data Enumerator & Data Analyst",
      "organization": "Carp Biosecurity and Aquaculture Supply Chain Project",
      "period": "January 2025",
      "category": "Aquaculture Economics",
      "description": "Supported USAID Feed the Future-funded aquaculture research involving hatchery owners, fish farmers, and supply chain actors.",
      "bullets": [
        "Collected field data across multiple districts of Bangladesh.",
        "Supported data cleaning, organization, and preliminary statistical analysis.",
        "Worked with R and SPSS-based analysis."
      ],
      "tags": [
        "Survey",
        "Biosecurity",
        "R",
        "SPSS"
      ]
    },
    {
      "title": "On-Campus Coordinator",
      "organization": "Hult Prize Bangladesh National Team",
      "period": "2024 – Present",
      "category": "Youth Leadership",
      "description": "Mentoring campus directors, supporting innovation programs, and coordinating national entrepreneurship activities.",
      "bullets": [
        "Supported campus directors from universities across Bangladesh.",
        "Mentored winning and finalist teams from Bangladesh, India, and Pakistan.",
        "Contributed to expanding student entrepreneurship participation."
      ],
      "tags": [
        "Leadership",
        "Startup mentorship",
        "Event execution"
      ]
    }
  ],
  "projects": [
    {
      "title": "SAF Feedstock Oil Crop Feasibility",
      "type": "Research",
      "summary": "Survey and sustainability-focused fieldwork to evaluate non-edible/feedstock oil crop cultivation potential for sustainable aviation fuel in Bangladesh.",
      "tags": [
        "SAF",
        "Sustainability",
        "Field research"
      ],
      "image_url": ""
    },
    {
      "title": "GIS & Remote Sensing Crop Monitoring",
      "type": "Research Support",
      "summary": "Use of spatial datasets, UAV imagery, satellite images, and mapping tools for agricultural and environmental analysis.",
      "tags": [
        "GIS",
        "UAV",
        "GEE"
      ],
      "image_url": ""
    },
    {
      "title": "Hult Prize Campus and National Coordination",
      "type": "Leadership",
      "summary": "Campus-level and national-level entrepreneurship program coordination, startup mentoring, and youth innovation ecosystem support.",
      "tags": [
        "Hult Prize",
        "Entrepreneurship",
        "Youth leadership"
      ],
      "image_url": ""
    }
  ],
  "skills": [
    {
      "group": "Data Analysis & Statistics",
      "items": [
        "R Programming",
        "SPSS",
        "Microsoft Excel",
        "Google Sheets",
        "Data cleaning",
        "Quantitative and qualitative survey analysis"
      ]
    },
    {
      "group": "GIS & Remote Sensing",
      "items": [
        "ArcGIS / ArcMap 10.8",
        "Google Earth Engine",
        "Drone data collection",
        "Pix4D",
        "Satellite image processing",
        "Spatial data analysis"
      ]
    },
    {
      "group": "Research & Fieldwork",
      "items": [
        "Survey design",
        "Questionnaire development",
        "Socioeconomic research",
        "Agricultural economic analysis",
        "Consumer behavior analysis",
        "Rural field coordination"
      ]
    },
    {
      "group": "Leadership & Communication",
      "items": [
        "Public speaking",
        "Event management",
        "Team leadership",
        "Stakeholder communication",
        "Training and mentoring",
        "Volunteer coordination"
      ]
    }
  ],
  "researchHighlights": [
    {
      "title": "Agricultural economics and profitability analysis",
      "text": "Farm-level cost, return, BCR, consumer preference, and rural market perception studies."
    },
    {
      "title": "GIS, UAV, and spatial data analysis",
      "text": "Growing exposure to drone imagery, satellite data, crop monitoring, and precision agriculture."
    },
    {
      "title": "Sustainability and climate action",
      "text": "Interest in SAF feedstock systems, climate-smart agriculture, agroforestry, and ecosystem restoration."
    }
  ],
  "contact": {
    "email": "akif.sayeed01@gmail.com",
    "phone": "",
    "location": "Gazipur, Bangladesh",
    "social": [
      {
        "label": "LinkedIn",
        "url": ""
      },
      {
        "label": "ResearchGate",
        "url": ""
      },
      {
        "label": "GitHub",
        "url": ""
      }
    ]
  }
}$json$::jsonb, now())
on conflict (id) do update set content = excluded.content, updated_at = now();

-- Optional demo items for the dynamic tables. These keep the website from looking empty before you upload real images.
insert into posts (title, body, published, sort_order)
values
('Portfolio Version 2.0 is live', 'This update connects the public website with a private mobile-friendly dashboard, editable titles, image upload, messages, gallery, certificates, and posts.', true, 1),
('Research collaboration note', 'Open to research collaboration in GIS, remote sensing, agribusiness, sustainability, SAF feedstock systems, and youth innovation programs.', true, 2)
on conflict do nothing;
