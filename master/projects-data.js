window.PROJECTS = [
  {
    id: 'thesis',
    title: 'Investment Feasibility of BIPV Across High-Rise Clusters in Kunming',
    subtitle: "Master's thesis · Dec 2025 – Jul 2026",
    tagline: 'Does building-integrated solar actually pay off? It depends on one variable most people ignore.',
    background: "This was my master's thesis. Building-integrated photovoltaics (BIPV) is often pitched as the answer for decarbonising dense cities, but nobody had systematically quantified what happens to the investment case when tall buildings sit close together and shade each other. That's exactly the situation in Kunming's high-rise office clusters.",
    process: [
      'Modelled four real high-rise clusters in central Kunming (including Hanglong, Qicai, Tongde and Wanda) in 3D and ran solar-radiation simulations to find out how much light each building actually receives once mutual shading is accounted for.',
      'Built a financial model (DCF/NPV) comparing two deployment strategies (covering every available roof surface versus only the best-lit sections) across 24+ urban-form scenarios.',
      'Ran a Monte Carlo simulation to quantify investment risk, plus a subsidy-threshold sensitivity analysis to find the tipping point where each scenario turns profitable.'
    ],
    result: "Core finding: treating the radiation cutoff itself as something to optimise, deploying panels only where they actually pay off (a 'sweet-spot' strategy), flips most scenarios from a loss into a profit. The analysis also shows that roof-utilisation is a bigger driver of investment risk than the choice of PV technology itself, meaning decisions made at the architectural-design stage matter more than which panels get installed later. That should be useful for anyone working on urban renewal or green-building policy.",
    tech: 'Solar-radiation simulation (Rhino / Grasshopper / Ladybug), DCF/NPV financial modelling, Monte Carlo risk simulation, R for data processing',
    role: 'Project designer and lead researcher (independent)',
    images: [
      { src: '../项目4_硕士论文/论文的图/Fig_T1_SweetSpot_GradientDot_2x2_Darker.png', caption: "The 'sweet-spot' deployment strategy compared across scenarios" },
      { src: '../项目4_硕士论文/论文的图/Fig_NPV_per_m2_TwoTone.png', caption: 'Net present value per m² under each strategy' },
      { src: '../项目4_硕士论文/论文的图/Fig_Subsidy_Sensitivity_Pro.png', caption: 'Subsidy-threshold sensitivity analysis' }
    ],
    videoNote: 'There are also 4 short animations from the radiation simulations (currently in the "gif" folder). I\'ll edit these into clips for this section.'
  },
  {
    id: 'greenspaces',
    title: 'Green Spaces in Eindhoven: Beyond Park Size',
    subtitle: 'Course project · Nov 2025 – Feb 2026 · with Alexandra Alexiou',
    tagline: 'Everyone assumes bigger parks are more loved. The data says not really.',
    background: 'A two-person project for a Data Analytics for Sustainability course. We wanted to find out what actually makes a park popular with Eindhoven residents: is it size, or something else? I led the sentiment and emotion analysis, the R pipeline, and the final report/website; Alexandra led the spatial-data side.',
    process: [
      'Scraped Dutch news coverage (2024–2026, via LexisNexis) mentioning 7 Eindhoven parks and built an R sentiment-analysis pipeline, going beyond positive/negative into finer emotion dimensions (valence, arousal, dominance).',
      "Ran a geospatial analysis of each park's 600m walking catchment to quantify accessibility.",
      'Regressed sentiment against accessibility, park size and other variables to see what actually drives public opinion.'
    ],
    result: "Park size and accessibility turned out to be negatively correlated (r≈-0.44): bigger parks tend to sit on the city edge, so they're often less reachable. Accessibility and media sentiment showed a moderate positive correlation (r≈0.45), supporting the idea that parks people can easily reach on a daily basis are the ones that become social hubs. In short, how easy a park is to reach and how well it's maintained matters more than how big it is, a useful nudge for how cities allocate green-space budgets.",
    tech: 'R (NLP sentiment analysis, geospatial analysis), Quarto for publishing',
    role: 'Sentiment/emotion analysis, R pipeline, final report and website',
    images: [
      { src: '../项目5_Eindhoven_Greenspace/Eindhoven_Greenspace/Eindhoven_Greensapce_files/figure-html/fig-nlp-composite-1.png', caption: 'Sentiment analysis results across the 7 parks' },
      { src: '../项目5_Eindhoven_Greenspace/Eindhoven_Greenspace/Eindhoven_Greensapce_files/figure-html/unnamed-chunk-21-1.png', caption: 'Park size vs. accessibility vs. sentiment' }
    ]
  },
  {
    id: 'sdg',
    title: 'SDG Challenge: Sustainable Commuting for Healthcare Staff, Eindhoven',
    subtitle: 'Sep 2025 – Jan 2026 · team of 7',
    tagline: "How do you get hospital staff to actually bike or carpool? Preaching sustainability doesn't work, the incentive design has to.",
    background: 'Commissioned by Brainport Bereikbaar, Archipel and Vitalis to design a scheme that would meaningfully increase green commuting among staff at two healthcare providers in Eindhoven, built to plug into the existing Trappers commuting app.',
    process: [
      'Designed a distance-tiered, CO₂-based points system (4 distance bands, 60–100% multipliers) so the reward scales with how much someone actually reduces emissions by switching.',
      'Benchmarked 3 competing commuting apps (Pave Commute, Reiswijs, Fynch) to see what worked and what didn\'t in their incentive design.',
      "Validated the scheme against staff commuting-survey data, and designed a behavioural-psychology-based poster campaign ('Riding a bike feels like…') that leads with emotion rather than argument."
    ],
    result: "90% of surveyed staff commute within 12.5 km, meaning distance was never really the barrier for most people, the incentive was. That insight is what the points system was built around.",
    tech: 'Reward-scheme design, competitor benchmarking, survey data analysis, behavioural-psychology-based campaign design',
    role: 'Reward design & data analysis',
    images: []
  },
  {
    id: 'greenscreen',
    title: 'Supplying the Dutch Media Industry with Zero Emissions',
    subtitle: 'GreenScreen × BFF · Mar 2025 – Jul 2025 · team of 6',
    tagline: 'Can 92 vehicles from 9 suppliers actually hit zero-emission targets by 2035 without losing money?',
    background: "A real client project for BFF (the Dutch media-industry vehicle-fleet association) and the GreenScreen sustainability initiative, assessing whether and how media-industry supplier fleets can meet Amsterdam's 2030 zero-emission zone rules.",
    process: [
      'Designed and ran a fleet survey across 9 suppliers and 92 vehicles, then cleaned and structured the resulting dataset.',
      'Built a three-scenario Excel financial model (business-as-usual / full electrification / phased transition), projecting emissions and cost through 2035, with formulas covering Scope 1/2 emissions, depreciation and residual value.',
      'Sourced real market parameters (EV prices €28K to €330K, diesel price €1.604/L) and delivered a model the client could reuse and adjust themselves.'
    ],
    result: "Only 6.5% of these 92 vehicles' driving range currently falls inside Amsterdam's zero-emission zone, out of roughly 1.21 million km driven per year. That's a clear illustration of the scale and time pressure the industry is facing, and a basis for comparing what each transition path would actually cost.",
    tech: 'Excel financial modelling, fleet emissions accounting, supplier survey design',
    role: 'Quantitative modelling & data processing',
    images: [
      { src: '../项目1_Greenscreen/Poster_GreenScreenx BFF_Wina.pdf', caption: 'Project summary poster' },
      { src: '../项目1_Greenscreen/给客户发ins的.jpg', caption: 'Promo graphic delivered to the client' },
      { src: '../项目1_Greenscreen/合照.jpg', caption: 'Team photo' }
    ]
  },
  {
    id: 'policybrief',
    title: 'From Regional Strengths to National Impact',
    subtitle: 'Policy course term paper · with Fengdi Miao',
    tagline: "Why do the Netherlands' alt-protein researchers and its alt-protein market never quite talk to each other?",
    background: "A term paper for a policy-analysis course, looking at the regional innovation system behind the Dutch alternative-protein industry. We found a structural gap: Gelderland concentrates most of the R&D (centred on Wageningen University), while Noord-Holland is the market and capital hub (centred on Amsterdam), but the two barely connect. That's a textbook 'valley of death' between research and commercialisation.",
    process: [
      'Used patent and publication data to quantify how the output, and the type of output, differs between the two provinces.',
      'Mapped the collaboration network between innovation actors (companies, investors, service providers) in each province, to show visually who is working with whom, and who is isolated.',
      'Built policy recommendations on cross-regional coordination using the Comparative Regional Innovation System (CRIS) framework.'
    ],
    result: "Gelderland produced 718 publications versus 148 in Noord-Holland, but patent output and market-facing actors (suppliers/producers) skew the other way. That mismatch between 'strong on research, weak on commercialisation' and 'strong on market, weak on research' is exactly where we recommend policy should focus on bridging the gap.",
    tech: 'Patent & publication bibliometrics, Comparative Regional Innovation System (CRIS) framework, policy writing',
    role: 'Data analysis & policy recommendations',
    images: [
      { src: '../项目3_policybrief/我很满意的一张图.jpg', caption: 'Patent and publication output across Dutch provinces in alt-protein' },
      { src: '../项目3_policybrief/微信图片_20260822234715_45_109.jpg', caption: 'Late-night deadline session with my project partner' }
    ]
  },
  {
    id: 'siu-plastics',
    title: 'Hard Plastic Waste Segregation in a Biotech Lab',
    subtitle: 'Stichting Incubator Utrecht · Nov 2024 – Jan 2025',
    tagline: 'The plastic waste nobody manages in a lab turns out to hide a real, calculable saving.',
    background: 'Stichting Incubator Utrecht (SIU), a biotech incubator at Utrecht Science Park, came to us with a problem: tenant labs use large amounts of single-use plastic under strict contamination-control rules, and some of it gets classified as hazardous waste simply for having touched toxic, biohazardous or GMO material, with no proper sorting system in place, wasting both money and recycling potential. We used Polpharma Biologics, a pharma company based at SIU, as our case study.',
    process: [
      'Interviewed SIU management to select a suitable case-study tenant, then ran two rounds of semi-structured interviews with Polpharma Biologics staff, plus a site visit to observe the lab in practice.',
      'Interviewed the waste-management partner PreZero to understand the actual pricing structure behind different waste streams.',
      'Built a cost-benefit and environmental-impact model comparing the status quo against introducing a separate hard-plastic stream, focused on the two most common lab plastics (PP and PS).'
    ],
    result: 'Adding a separate hard-plastic stream is projected to save roughly €1,268 per year and cut emissions by about 66.7 tCO₂-eq per year. The final recommendation was to add dedicated hard-plastic bins in the lab, alongside a regulatory review to work out which waste can reasonably be reclassified out of the mandatory hazardous-waste stream, widening what can actually be recycled.',
    tech: 'Cost-benefit analysis (CBA), environmental impact assessment, semi-structured stakeholder interviews',
    role: 'Data analysis & stakeholder interviews',
    images: [
      { src: '../项目6硬塑料/去实验室实地调查合照.jpg', caption: 'On-site visit to the lab' }
    ]
  }
];
