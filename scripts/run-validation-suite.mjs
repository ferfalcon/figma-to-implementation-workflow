#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const validationSteps = [
  { name: 'schema drift', script: 'scripts/generate-workflow-schema.mjs', args: ['--check'] },
  { name: 'contract compatibility drift', script: 'scripts/generate-contract-compatibility.mjs', args: ['--check'] },
  { name: 'semantic contract drift', script: 'scripts/generate-semantic-contract.mjs', args: ['--check'] },
  { name: 'repository contract', script: 'scripts/validate-workflow.mjs' },
  { name: 'contract compatibility behavior', script: 'scripts/test-contract-compatibility.mjs' },
  { name: 'validation runner', script: 'scripts/test-validation-runner.mjs' },
  { name: 'path safety', script: 'scripts/test-path-safety.mjs' },
  { name: 'release metadata', script: 'scripts/test-release-metadata.mjs' },
  { name: 'Figma preparation authority', script: 'scripts/test-figma-preparation-authority.mjs' },
  { name: 'agent bootstrap authority', script: 'scripts/test-agent-bootstrap-authority.mjs' },
  { name: 'installation artifact', script: 'scripts/test-installation-artifact.mjs' },
  { name: 'project configuration', script: 'scripts/test-project-configuration.mjs' },
  { name: 'consumer bundle', script: 'scripts/test-consumer-bundle.mjs' },
  { name: 'Astro implementation scaffold', script: 'scripts/test-astro-scaffold.mjs' },
  { name: 'Astro development fixture', script: 'scripts/test-astro-fixture.mjs' },
  { name: 'evidence boundary', script: 'scripts/test-evidence-boundary.mjs' },
  { name: 'ChatGPT product experience', script: 'scripts/test-product-experience.mjs' },
  { name: 'adapter catalog', script: 'scripts/test-adapter-catalog.mjs' },
  { name: 'source adapters', script: 'scripts/test-source-adapters.mjs' },
  { name: 'implementation adapters', script: 'scripts/test-implementation-adapters.mjs' },
  { name: 'execution transports', script: 'scripts/test-execution-transports.mjs' },
  { name: 'semantic contract behavior', script: 'scripts/test-semantic-contract.mjs' },
  { name: 'CLI layering', script: 'scripts/test-cli-layering.mjs' },
  { name: 'workflow validation architecture', script: 'scripts/test-workflow-validation-architecture.mjs' },
  { name: 'workflow record', script: 'scripts/test-workflow-record.mjs' },
  { name: 'canonical invariants', script: 'scripts/test-canonical-invariants.mjs' },
  { name: 'architecture contract', script: 'scripts/test-architecture-contract.mjs' },
  { name: 'stage gates', script: 'scripts/test-stage-gates.mjs' },
  { name: 'generated state', script: 'scripts/test-generated-state.mjs' },
  { name: 'agent projection', script: 'scripts/test-agent-projection.mjs' },
  { name: 'record concurrency', script: 'scripts/test-record-concurrency.mjs' },
  { name: 'artifact renderer', script: 'scripts/test-artifact-renderer.mjs' },
  { name: 'task phases', script: 'scripts/test-task-phases.mjs' },
  { name: 'orchestration', script: 'scripts/test-orchestration.mjs' },
  { name: 'toolkit source', script: 'scripts/test-toolkit-source.mjs' },
  { name: 'packed install', script: 'scripts/test-packed-install.mjs' },
  { name: 'subject integrity', script: 'scripts/test-subject-integrity.mjs' },
  { name: 'agent context', script: 'scripts/test-agent-context.mjs' },
  { namYNˆ	ØÛÛ[X[™İÛ™\œÚ\	ËØÜš\ˆ	ÜØÜš\Ëİ\İXÛÛ[X[™[İÛ™\œÚ\›ZœÉÈKˆÈ˜[YNˆ	ÑÚ]ÛÜšİ™YHÛXŞIËØÜš\ˆ	ÜØÜš\Ëİ\İYÚ]]ÛÜšİ™YK\ÛXŞK›ZœÉÈKˆÈ˜[YNˆ	Ü™\ÜÚ]ÜHÜXš[]IËØÜš\ˆ	ÜØÜš\Ëİ\İ\™\ÜÚ]ÜK\ÜXš[]K›ZœÉÈKˆÈ˜[YNˆ	İÛÜšÜÜXÙH™\ÛÛ][Û‰ËØÜš\ˆ	ÜØÜš\Ëİ\İ]ÛÜšÜÜXÙK\™\ÛÛ][Û‹›ZœÉÈKˆÈ˜[YNˆ	İ\ÚÈİ\ÚXÚÜÚ[ÉËØÜš\ˆ	ÜØÜš\Ëİ\İ]\ÚË\İ\XÚXÚÜÚ[Ë›ZœÉÈKˆÈ˜[YNˆ	Ü™\[›š[™È˜[œÚ][ÛœÉËØÜš\ˆ	ÜØÜš\Ëİ\İ\™\[›š[™Ë]˜[œÚ][ÛœË›ZœÉÈKˆÈ˜[YNˆ	ĞÓIËØÜš\ˆ	ÜØÜš\Ëİ\İXÛK›ZœÉÈKˆÈ˜[YNˆ	ÜÙ\]Y[X[\ÚÈ[™XYÙIËØÜš\ˆ	ÜØÜš\Ëİ\İ\Ù\]Y[X[]\ÚË[[™XYÙK›ZœÉÈKˆÈ˜[YNˆ	ÑÚ]Xˆ™[[İHÛÛ[X[™œšYÙIËØÜš\ˆ	ÜØÜš\Ëİ\İYÚ]X‹\™[[İKXÛÛ[X[™›ZœÉÈKˆÈ˜[YNˆ	ÑÚ]Xˆ™[[İH]]Üš^˜][Û‰ËØÜš\ˆ	ÜØÜš\Ëİ\İYÚ]X‹\™[[İKX]]Üš^˜][Û‹›ZœÉÈKˆÈ˜[YNˆ	ÑÚ]Xˆ™[[İHš[\Ş\İ[HÛÛZ[›Y[	ËØÜš\ˆ	ÜØÜš\Ëİ\İYÚ]X‹\™[[İK\]Ë›ZœÉÈKˆÈ˜[YNˆ	ÑÚ]XˆXİ[ÛœÈ[›š[™ÉËØÜš\ˆ	ÜØÜš\Ëİ\İYÚ]X‹XXİ[ÛœË\[›š[™Ë›ZœÉÈKˆÈ˜[YNˆ	ÜXÚØYÙHX[šY™\İ	ËØÜš\ˆ	ÜØÜš\Ëİ\İ\XÚØYÙK[X[šY™\İ›ZœÉÈK—NÂ‚™[˜İ[Ûˆ›Ü›X]\˜][ÛŠ\˜][Û“\ÊHÂˆYˆ
\˜][Û“\ÈL
H™]\›ˆ	ÓX]œ›İ[™
\˜][Û“\Ê_H\ØÂˆ™]\›ˆ	Ê\˜][Û“\ÈÈL
KÑš^Y
Š_HØÂŸB‚™[˜İ[Ûˆ[”İ\
İ\ÈİÙH›Ûİİ[ÈH	Ú[š\š]	ËÙÈHÛÛœÛÛK›ÙÈHHßJHÂˆÛÛœİİ\Y]H\™›Ü›X[˜ÙK››İÊ
NÂˆÙÊ¸¡¤ˆ	Üİ\›˜[Y_X
NÂ‚ˆÛÛœİ™\İ[HÜ]Û”Ş[˜Ê›ØÙ\ÜË™^XÔ]Üİ\œØÜš\‹‹Šİ\˜\™ÜÈÏÈ×JWKÂˆİÙˆİ[ËˆJNÂˆÛÛœİ\˜][Û“\ÈH\™›Ü›X[˜ÙK››İÊ
HHİ\Y]ÂˆÛÛœİ\ÜÙYH™\İ[œİ]\ÈOOH	‰ˆ\™\İ[™\œ›ÜÂ‚ˆYˆ
™\İ[™\œ›ÜŠHÂˆÙÊ	Ü™\İ[™\œ›Ü‹›Y\ÜØYÙ_X
NÂˆH[ÙHYˆ
™\İ[œÚYÛ˜[
HÂˆÙÊ\›Z[˜]YHÚYÛ˜[	Ü™\İ[œÚYÛ˜[X
NÂˆB‚ˆÙÊ	Ü\ÜÙYÈ	ÔTÔÉÈˆ	ÑRS	ßH	Üİ\›˜[Y_H
	Ù›Ü›X]\˜][ÛŠ\˜][Û“\Ê_JX
NÂ‚ˆ™]\›ˆÂˆ˜[YNˆİ\›˜[YKˆ\ÜÙYˆİ]\Îˆ™\İ[œİ]\ËˆÚYÛ˜[ˆ™\İ[œÚYÛ˜[ÏÈ[ˆ\œ›Üˆ™\İ[™\œ›ÜË›Y\ÜØYÙHÏÈ[ˆ\˜][Û“\ËˆNÂŸB‚™^Ü[˜İ[Ûˆ[•˜[Y][Û”İZ]Jİ\ÈH˜[Y][Û”İ\ËÜ[ÛœÈHßJHÂˆÛÛœİÙÈHÜ[ÛœË›ÙÈÏÈÛÛœÛÛK›ÙÎÂˆÛÛœİ™\İ[ÈH×NÂˆÛÛœİİ\Y]H\™›Ü›X[˜ÙK››İÊ
NÂ‚ˆ›Üˆ
ÛÛœİİ\Ùˆİ\ÊHÂˆ™\İ[Ëœ\Ú
[”İ\
İ\È‹‹›Ü[ÛœËÙÈJJNÂˆB‚ˆÛÛœİ\˜][Û“\ÈH\™›Ü›X[˜ÙK››İÊ
HHİ\Y]ÂˆÛÛœİ˜Z[\™\ÈH™\İ[Ë™š[\Š
™\İ[
HOˆ\™\İ[œ\ÜÙY
NÂ‚ˆÙÊ	×•˜[Y][Ûˆİ[[X\IÊNÂˆ›Üˆ
ÛÛœİ™\İ[Ùˆ™\İ[ÊHÂˆÙÊ	Ü™\İ[œ\ÜÙYÈ	ÔTÔÉÈˆ	ÑRS	ßH	Ü™\İ[›˜[Y_H
	Ù›Ü›X]\˜][ÛŠ™\İ[™\˜][Û“\Ê_JX
NÂˆBˆÙÊ‰Ü™\İ[Ë›[™İH˜Z[\™\Ë›[™İH\ÜÙY	Ù˜Z[\™\Ë›[™İH˜Z[Y[ˆ	Ù›Ü›X]\˜][ÛŠ\˜][Û“\Ê_K˜
NÂ‚ˆYˆ
˜Z[\™\Ë›[™İˆ
HÂˆÙÊ	Ñ˜Z[YÚXÚÜÎ‰ÊNÂˆ›Üˆ
ÛÛœİ˜Z[\™HÙˆ˜Z[\™\ÊHÙÊH	Ù˜Z[\™K›˜[Y_X
NÂˆB‚ˆ™]\›ˆÂˆ\ÜÙYˆ˜Z[\™\Ë›[™İOOHˆ™\İ[Ëˆ˜Z[\™\Ëˆ\˜][Û“\ËˆNÂŸB‚˜ÛÛœİ\™Xİ[›ØØ][ÛˆH›ØÙ\ÜË˜\™İ–ÌWBˆÈ™\ÛÛ™J›ØÙ\ÜË˜\™İ–ÌWJHOOHš[UT“Ô]
[\Ü›Y]K\›
Bˆˆ˜[ÙNÂ‚šYˆ
\™Xİ[›ØØ][ÛŠHÂˆÛÛœİ™\ÜH[•˜[Y][Û”İZ]J
NÂˆYˆ
\™\Üœ\ÜÙY
H›ØÙ\ÜË™^]ÛÙHHNÂŸB