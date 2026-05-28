# Algae Watch HE2I v1.0beta

No-build static Cloudflare Pages deployment.

## Cloudflare Pages settings

- Framework preset: None
- Build command: leave empty
- Build output directory: `.`
- Root directory: leave empty

## Telegram environment variables

Add in Cloudflare Pages project settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Architecture

Algae Watch — powered by P-BBFC NEXUS-UI3A, an AI/ML control system for predictive coastal biomass-flow management, including forecasting of floating seaweed mats and generation of mission decisions for controlled biomass interception.

Human reports are treated as bio-informational sensor inputs within the hybrid sensing / observation layer.
