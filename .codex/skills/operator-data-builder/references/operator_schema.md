# Operator JSON Schema

Use this structure for each item in `data/operators/operators.json`.

```json
{
  "id": "operator_id",
  "name": "Operator Name",
  "websites": ["https://example.com"],
  "country": "Nepal",
  "base_city": "Kathmandu",
  "address": "string or null",
  "contacts": {
    "phones": [],
    "whatsapp": [],
    "email": null
  },
  "key_people": [
    {
      "name": "Person Name",
      "role": "Founder"
    }
  ],
  "destinations": [],
  "activities": [],
  "styles": [],
  "price_score": 3,
  "luxury_fit": "yes | some | limited | strong_yes",
  "luxury_fit_score": 4,
  "price_indicators": [
    {
      "name": "Package name",
      "price_usd": 1200,
      "unit": "per person",
      "source": "official package page"
    }
  ],
  "known_products": [],
  "hotel_capability": {
    "city_hotels": "string",
    "trekking_route": "string",
    "notes": "string"
  },
  "notes": "string",
  "cover_image": "data/operators/images/operator_id.jpg",
  "gallery": [],
  "source_urls": [],
  "verification_status": "partially_verified"
}
```

Guidelines:

- Use `null` for unknown scalar fields when appropriate.
- Use empty arrays for unknown list fields.
- Preserve user-provided plausible data, but label unsupported claims as `needs verification`.
- Prefer official source URLs for contact, key people, pricing, and luxury/accommodation claims.
- Keep `cover_image` aligned with `data/operators/images/{id}.jpg`.
