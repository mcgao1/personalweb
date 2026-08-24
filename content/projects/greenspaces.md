# Eindhoven 城市绿地研究:公园面积之外的故事

## 一句话简介
用NLP情感分析+地理空间分析发现,埃因霍温居民对公园的评价主要取决于可达性和维护质量,而非公园面积大小。

## 背景
这是乌特勒支大学"可持续发展数据分析"(Data Analytics for Sustainability)课程的小组项目,与同学 Alexandra Alexiou 合作完成(报告作者署名为 Alexandra Alexiou、Manchen Gao)。研究对象是荷兰埃因霍温市(Eindhoven)的城市绿地。

研究动机是:传统城市规划评估绿地时,常用"公园总面积"或"人均绿地公顷数"这类单一指标,默认公园越大越好、离得越近越好。但已有文献提示,空间分布、可达性、公园质量和居民主观感受可能比单纯的面积更重要——一个位置偏远的大公园可能服务不到多少居民,而一个维护良好、位置居中的小公园反而能带来更高的居民满意度。埃因霍温近年来经历快速城市化,绿地面积有所减少,空气质量也在恶化,这让"绿地究竟该怎么规划"变得更紧迫。研究的核心问题是:公园面积本身能在多大程度上解释居民对绿地的实际使用暴露(exposure)和主观感受差异?

## 我做了什么(过程)
本人在项目中主要负责**情感与情绪分析(NLP部分)、R代码审查,以及最终可复现报告和网站的制作**。项目整体分为NLP文本分析和地理空间分析两条线,最终在R/Quarto中合并成一份可复现报告:

**1. 语料构建。** 通过 LexisNexis Uni 数据库检索2024-2026年间的荷兰语新闻文章(如《Eindhovens Dagblad》《AD》等),先用宽泛关键词("Eindhoven" AND 绿地相关词)初筛,人工审查后发现大量噪音(体育新闻、交通事故、广告等),于是构建了一个很长的排除词表(排除PSV足球、KLM航班、圣诞节、犯罪新闻等几十个无关主题),迭代精炼出高精度的布尔查询,最终获得609篇文章。

**2. 地点识别:两阶段方法。** 第一阶段尝试用 `dslim/bert-large-NER` 命名实体识别模型(通过Python `transformers` 库,经R的 `reticulate` 调用)做探索性地点抽取,但发现模型对地名的识别有噪音(如把"Eindhoven"这个城市名和具体公园名混淆、出现"##hoven"这类分词碎片)。因此第二阶段改用基于关键词字典的定向抽取法,用一份验证过的9个主要绿地"白名单"(如Genneper、Dommel、Karpendonk等)在句子层面做正则匹配,并对标题去重以避免重复计数。初步统计后发现样本量在不同公园间严重不均(如Dommel被提及81次,而Wandelpark只有5次),于是针对样本不足的公园做了补充查询("滚雪球采样"),最终锁定7个公园作为核心研究对象:Dommel、Genneper Parken、Karpendonkse Plas、Stratumse Heide、Philips de Jongh Wandelpark、Henri Dunantpark、Stadswandelpark。

**3. 情感分析。** 因为文本是荷兰语,选用支持多语言的 `cardiffnlp/twitter-xlm-roberta-base-sentiment` 模型(而非基于词表的传统方法,以更好处理语境和否定句)对每个句子做正/负/中性三分类打分,再按公园聚合、做Z-score标准化,得到每个公园相对于全市均值的情感表现。

**4. 主题与情绪深挖(TF-IDF + VAD)。** 在情感极性之外,进一步用TF-IDF提取每个公园的特征词(自建了一套荷兰语停用词表,剔除公园名本身、时间填充词、街道名等噪音),把高频特征词人工归类为六大主题(生态价值、景观通道、文化遗产、休闲游憩、环境风险、地理背景)。同时用 `RobroKools/vad-bert` 模型给每句话打Valence(效价)/Arousal(唤醒度)/Dominance(支配感)三维情绪分数并按公园聚合,从而不只看"正面/负面",还能看出"平静的正面(疗愈型)"和"兴奋的正面(社交型)"之间的差异。

**5. 地理空间分析(合作者主导,本人参与代码审查与整合)。** 从 OpenStreetMap 抓取公园边界多边形(因API超时问题,后改为手动从 overpass-turbo.eu 下载并本地读取),转换到荷兰国家坐标系(Amersfoort/RD New)计算面积;Karpendonkse Plas 因在OSM中被归类为水体而非公园,做了单独抓取和合并;并手动修正了Genneper Parken因OSM多边形碎片化导致的面积低估问题(纠正为约85公顷)。从市政府开放数据门户加载街区边界和居民满意度调查数据(公园树木维护满意度、绿地设计满意度、绿地维护满意度、环境滋扰感受等),将荷兰语字段名翻译为英文。用300m/600m/1000m三档步行距离缓冲区分析每个公园能覆盖到的街区数量,并构建了一个距离加权的可达性指数(越近的街区权重越高,而非简单的"是否落在缓冲区内"的二元判断)。最后将NLP情感数据、GIS可达性数据、居民满意度数据按公园名做匹配合并(处理了跨数据源的公园命名不一致问题,如"dommel"对应GIS里的"dommelplantsoen")。

**6. 统计建模与最终报告制作。** 本人负责对R代码做审查和整理,并将全部分析封装为一份可复现的 Quarto (.qmd) 报告,渲染为最终的HTML网站/报告。统计部分做了相关性分析和三组线性回归模型(仅面积 / 可达性+媒体曝光度 / 全模型),对比各模型的解释力(R²)。

## 结果/成果
- **公园面积与可达性呈负相关(r ≈ -0.44 至 -0.45)**:大公园(如85公顷的Genneper Parken、45公顷的Stratumse Heide)往往位于城市边缘,600米步行范围内只能覆盖约8个街区;而更小的公园(如12.5公顷的Dommelplantsoen、8.3公顷的Philips de Jongh Wandelpark)因位置更居中,反而能覆盖12-14个街区。
- **可达性与情感呈中等正相关(r ≈ 0.45)**:更容易到达的公园倾向于获得更正面的媒体情感评价,支持"日常可达的公园更容易成为社交枢纽"的假设。(报告摘要处另有 r=0.12 的表述,判断为早期草稿数值,网站统一采用 Figure 2 细分析中的 0.45)
- **居民满意度调查与新闻情感分析呈中等正相关(r ≈ 0.38)**:两个独立的感知测量方式(市政满意度调查 vs 新闻文本情感)相互印证,说明媒体叙事确实能反映居民的真实体验。例如 Dommelplantsoen 满意度指数71.2、平均情感+0.027(均偏正面);而 Stratumse Heide 满意度指数64.8、平均情感-0.268(明显偏负面)。
- **回归模型对比**:仅用面积一个变量解释情感分数的R²约为0.15(解释力很弱);加入可达性、媒体曝光量后R²提升;加入居民满意度指数后的全模型R²高达约0.99(但样本量仅7个公园,统计效力有限,需谨慎解读)。满意度指数在全模型中是统计显著的正向预测变量。
- **七个公园按功能主题呈现明显分化**:Dommel(生态修复型,低唤醒高支配,适合独自散步冥想)与Stratumse Heide(同为生态型但因维护不善、抱怨集中在基础设施破损,情感分数全场最低-0.268)对比,说明"生态资源好"不等于"公众评价好",维护质量是关键变量;Genneper(文化+游憩混合型,情感偏正面)与Karpendonk(几乎纯商业餐饮属性,唤醒度高但情感偏负,说明商业刺激难以建立深层情感联结)对比;Henri Dunantpark(高效价高唤醒,社交活力型,全场情感最积极)与Philips de Jongh Wandelpark(被行政/规划争议话语主导,情感偏负面)对比。
- **结论**:维护质量差(Stratumse Heide)和治理/规划争议(Philips de Jongh)是负面情感的主要驱动因素;疗愈型自然体验(Dommel)和社交活力(Henri Dunant)是正面情感的主要驱动因素;纯商业化(Karpendonk)能制造兴奋感但难以转化为深层满意度。

## 技术/工具
- **NLP/文本分析**:Python `transformers`(Hugging Face)库,通过R的 `reticulate` 调用;命名实体识别模型 `dslim/bert-large-NER`;情感分类模型 `cardiffnlp/twitter-xlm-roberta-base-sentiment`;情绪维度模型 `RobroKools/vad-bert`;R的 `tidytext`(TF-IDF、分词)、`LexisNexisTools`(文献库数据读取)
- **地理空间分析**:R的 `sf`、`tmap`、`terra`、`osmdata`(OpenStreetMap数据抓取)
- **数据整理与可视化**:RStudio / R(`dplyr`、`ggplot2`、`tidyr`、`patchwork`)
- **报告与网站产出**:Quarto(.qmd → 可复现HTML报告/网站)
- **数据源**:LexisNexis Uni新闻数据库、OpenStreetMap、埃因霍温市政府开放数据门户(Eindhoven in Cijfers)

## 与CV版本的对比
CV bullet写道:"Built an R sentiment-analysis pipeline over a Dutch news corpus (LexisNexis, 2024–2026) to score public perception of seven Eindhoven parks, showing perception is driven by a park's function and upkeep rather than its size" 以及 "Handled the project's R code review and produced the final reproducible report and website (Quarto / RStudio)"。

对照原始报告后发现:
1. **CV准确概括了核心结论**("功能和维护比面积更重要"),这一点与报告的Discussion/Conclusion部分完全吻合,没有夸大或简化失真。
2. CV完全没提到**两阶段地点识别方法(NER探索 → 关键词字典定向抽取)**这个方法论细节,也没提到中途因NER噪音问题切换方法、以及因样本不均做"滚雪球采样"补充查询的过程——这些体现了很强的问题排查和方法迭代能力,适合在展开版里强调。
3. CV没提到**VAD情绪三维分析(Valence/Arousal/Dominance)**这个更精细的分析层——这是报告里除了基础情感极性分析外的加分项,能讲出"疗愈型 vs 兴奋型正面情感"这种更有洞察力的故事。
4. CV没有量化任何具体数字(相关系数、R²、满意度对比数值),而报告里其实有相当丰富的定量结果可以支撑一句"data-backed"的表述。
5. CV的角色描述("sentiment & emotion analysis, R and reporting")与本人实际贡献(NLP情感/情绪分析部分 + R代码审查 + 最终报告/网站制作)高度吻合,但报告作者栏显示这是与 Alexandra Alexiou 合作完成的双人项目,地理空间分析部分（OSM抓取、缓冲区分析、街区满意度整合）看起来主要由合作者完成,CV没有明确说明这是合作项目——建议网站上视情况注明合作者信息,避免给人"全部独立完成"的印象。

## 可用素材
项目文件夹:`D:\新建文件夹\OneDrive - Universiteit Utrecht\桌面\job\项目5_Eindhoven_Greenspace\Eindhoven_Greenspace`

- `Eindhoven_Greensapce.html` —— 渲染完成的完整Quarto报告(交互式HTML,含目录、代码块、所有图表),图片路径已在此前会话中修复,可直接作为网站上的"查看完整报告"链接或iframe嵌入。这是本项目最核心、最完整的展示素材。
- `Eindoven_Greenspace.qmd` —— 报告源码(R+Markdown混排),适合截取方法论段落文字用于网站文案(比HTML更易读取纯文本),不建议直接展示给访客(代码块较多,阅读体验不如渲染后的HTML)。
- `Eindhoven_Greensapce_files/figure-html/` 文件夹,4张PNG图表,均为报告中已生成的最终图表,适合直接用作网站配图:
  - `fig-nlp-composite-1.png` —— 报告Figure 3"NLP多维文本分析"组合图,展示各公园TF-IDF主题词分布(面板A/B)和VAD情绪地形图(面板C,颜色=支配感、大小=提及量)。信息密度最高,最能体现NLP分析深度,建议作为核心配图。
  - `unnamed-chunk-20-1.png` —— 对应报告Figure 1"公园与街区满意度空间分布地图"(公园按情感着色、叠加600米步行缓冲区)。
  - `unnamed-chunk-21-1.png` —— 对应报告Figure 2"公园面积 vs 可达性/情感"双面板散点图,直观展示"面积-可达性负相关""可达性-情感正相关"两个核心发现。
  - `unnamed-chunk-22-1.png` —— 对应报告Figure 4"多维绩效对比热力图"。

## 待确认
1. **这是与同学 Alexandra Alexiou 合作完成的双人课程项目**,报告署名顺序为"Alexandra Alexiou, Manchen Gao"。地理空间分析(OSM数据抓取、缓冲区/可达性计算、居民满意度数据整合)部分的代码风格与NLP部分不同,推测主要由合作者完成,但本人做了"R code review"和最终报告整合,具体分工边界建议本人确认,以便网站文案准确描述贡献范围。
2. ~~相关系数不一致~~ 已按用户要求处理:网站统一使用 r=0.45(Figure 2 细分析数值),本人后续核对原始数据后如需更正可再调整。
3. `Eindhoven_Greensapce.html` 文件名中的"Greensapce"疑似是"Greenspace"的拼写笔误(项目文件夹和.qmd源文件名也有同样拼写不一致的情况),网站上引用文件路径时需注意保留原始文件名拼写以免链接失效。
