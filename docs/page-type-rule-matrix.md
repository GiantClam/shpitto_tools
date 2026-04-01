# 页面类型-规则矩阵（自动导出）

- generatedAt: 2026-03-31T10:18:10.316Z
- source: builder/src/lib/agent/page-rule-matrix.ts

## 页面规则

| pageType | sectionPriority | nav | hero | content | sectionRepeatBudget |
| --- | --- | --- | --- | --- | --- |
| home | navigation > hero > story > approach > products > socialproof > cta > footer | variant=withCTA, maxWidth=xl, paddingY=sm | preset=H01, structure=split, density=spacious, align=start, media=image-right, list=cards, motion=stagger, rhythm=slow | structure=triple, list=cards | navigation:1, hero:1, products:1, approach:1, socialproof:1, footer:1 |
| products | navigation > hero > products > approach > socialproof > contact > cta > footer | variant=withDropdown, maxWidth=2xl, paddingY=sm | preset=H02, structure=dual, density=normal, align=start, media=image-left, list=rows, motion=fadeUp, rhythm=medium | structure=dual, list=rows | navigation:1, hero:1, products:1, approach:1, socialproof:1, contact:1, footer:1 |
| solutions | navigation > hero > approach > products > story > socialproof > contact > cta > footer | variant=withCTA, maxWidth=2xl, paddingY=md | preset=H03, structure=split, density=normal, align=start, media=image-right, list=rows, motion=fadeUp, rhythm=fast | structure=split, list=rows | navigation:1, hero:1, approach:1, products:1, story:1, contact:1, footer:1 |
| cases | navigation > hero > socialproof > products > story > contact > cta > footer | variant=simple, maxWidth=lg, paddingY=md | preset=H02, structure=dual, density=normal, align=start, media=image-left, list=tiles, motion=fadeIn, rhythm=fast | structure=dual, list=tiles | navigation:1, hero:1, products:1, socialproof:1, story:1, footer:1 |
| about | navigation > hero > story > approach > socialproof > contact > cta > footer | variant=simple, maxWidth=xl, paddingY=sm | preset=H03, structure=single, density=spacious, align=center, media=background, list=cards, motion=fadeIn, rhythm=slow | structure=dual, list=cards | navigation:1, hero:1, story:1, approach:1, socialproof:1, footer:1 |
| contact | navigation > hero > contact > socialproof > story > cta > footer | variant=withCTA, maxWidth=lg, paddingY=md | preset=H03, structure=single, density=compact, align=start, media=background, list=rows, motion=fadeUp, rhythm=fast | structure=single, list=rows | navigation:1, hero:1, contact:1, cta:1, footer:1 |
| pricing | navigation > hero > products > socialproof > contact > cta > footer | variant=withCTA, maxWidth=xl, paddingY=sm | preset=H02, structure=dual, density=normal, align=start, media=image-right, list=cards, motion=fadeUp, rhythm=medium | structure=triple, list=cards | navigation:1, hero:1, products:1, socialproof:1, contact:1, footer:1 |
| support | navigation > hero > story > approach > contact > cta > footer | variant=simple, maxWidth=xl, paddingY=sm | preset=H03, structure=single, density=normal, align=start, media=background, list=rows, motion=fadeIn, rhythm=medium | structure=single, list=rows | navigation:1, hero:1, story:1, approach:1, contact:1, footer:1 |
| blog | navigation > hero > story > products > socialproof > cta > footer | variant=simple, maxWidth=xl, paddingY=sm | preset=H03, structure=single, density=normal, align=start, media=background, list=tiles, motion=fadeIn, rhythm=medium | structure=triple, list=tiles | navigation:1, hero:1, story:1, products:1, socialproof:1, footer:1 |
| legal | navigation > story > footer | variant=simple, maxWidth=lg, paddingY=sm | preset=H03, structure=single, density=compact, align=start, media=none, list=rows, motion=fadeIn, rhythm=slow | structure=single, list=rows | navigation:1, story:1, footer:1 |
| generic | navigation > hero > story > approach > products > socialproof > contact > cta > footer | variant=withCTA, maxWidth=xl, paddingY=sm | preset=H01, structure=dual, density=normal, align=start, media=image-right, list=cards, motion=stagger, rhythm=medium | structure=dual, list=cards | navigation:1, hero:1, footer:1, other:2 |

## 策略建议规则

| suggest | allowedCurrent | constraints |
| --- | --- | --- |
| template_first | hybrid, template_first | minStructuredSignals=2, minHighConfidenceCount=2, requireInteriorPageType=true |
| hybrid | template_first | maxStructuredSignals=0 |

- interiorPageTypes: products, solutions, cases, about, contact
