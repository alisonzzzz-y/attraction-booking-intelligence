#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${1:-/tmp/rome-place-candidates.json}"
TEMP_RESULTS="$(mktemp)"

cleanup() {
  rm -f "${TEMP_RESULTS}"
}

trap cleanup EXIT

if [[ ! -f "${PROJECT_ROOT}/.env" ]]; then
  echo "Missing ${PROJECT_ROOT}/.env" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "${PROJECT_ROOT}/.env"
set +a

if [[ -z "${GOOGLE_PLACES_API_KEY:-}" ]]; then
  echo "GOOGLE_PLACES_API_KEY is missing from ${PROJECT_ROOT}/.env" >&2
  exit 1
fi

queries=(
  "colosseum|Colosseum, Rome, Italy"
  "roman-forum|Roman Forum, Rome, Italy"
  "palatine-hill|Palatine Hill, Rome, Italy"
  "vatican-museums|Vatican Museums, Vatican City"
  "sistine-chapel|Sistine Chapel, Vatican City"
  "st-peters-basilica|St. Peter's Basilica, Vatican City"
  "pantheon|Pantheon, Rome, Italy"
  "borghese-gallery|Borghese Gallery, Rome, Italy"
  "castel-sant-angelo|Castel Sant'Angelo, Rome, Italy"
  "capitoline-museums|Capitoline Museums, Rome, Italy"
  "baths-of-caracalla|Baths of Caracalla, Rome, Italy"
  "domus-aurea|Domus Aurea, Rome, Italy"
  "trevi-fountain|Trevi Fountain, Rome, Italy"
)

for entry in "${queries[@]}"; do
  catalog_key="${entry%%|*}"
  text_query="${entry#*|}"
  request_body="$(jq -n --arg query "${text_query}" '{textQuery: $query, languageCode: "en"}')"

  response="$(
    curl --silent --show-error --fail-with-body \
      --connect-timeout 5 \
      --max-time 20 \
      --request POST \
      --url "https://places.googleapis.com/v1/places:searchText" \
      --header "Content-Type: application/json" \
      --header "X-Goog-Api-Key: ${GOOGLE_PLACES_API_KEY}" \
      --header "X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location" \
      --data "${request_body}"
  )"

  jq -n \
    --arg catalogKey "${catalog_key}" \
    --arg query "${text_query}" \
    --arg retrievedAt "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    --argjson response "${response}" \
    '{
      catalogKey: $catalogKey,
      query: $query,
      source: "Google Places API (New) Text Search",
      retrievedAt: $retrievedAt,
      candidates: [
        $response.places[0:3][]? |
        {
          placeId: .id,
          displayName: .displayName.text,
          formattedAddress,
          location
        }
      ]
    }' >> "${TEMP_RESULTS}"

  echo "Checked ${text_query}" >&2
done

jq -s \
  --arg generatedAt "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  '{
    generatedAt: $generatedAt,
    environment: "Google Places API (New)",
    note: "Candidate data for manual mapping review. This is not ticket or live availability data.",
    results: .
  }' "${TEMP_RESULTS}" > "${OUTPUT_PATH}"

echo "Saved candidate review file to ${OUTPUT_PATH}" >&2
