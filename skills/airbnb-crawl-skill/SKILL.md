---
name: airbnb-crawl-skill
description: Airbnb pricing analysis tool for Philippines (Cagayan de Oro, Cebu, Manila). Compare competitor prices, analyze market rates, and optimize your property pricing.
version: "1.0"
currency: "PHP"
locations:
  - cagayan_de_oro
  - cebu
  - manila
---

# Airbnb Pricing Analyzer for Philippines

Specialized tool for analyzing Airbnb prices in Philippines locations. Perfect for property owners in Cagayan de Oro, Cebu, and Manila who want to price their properties competitively.

## How to Execute Commands

**Use this exact command format:**
```bash
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py [command] [options]
```

**Note:** This is the ONLY way to execute commands. Do not use `crawl4ai`, `airbnb-crawler`, or any other shortcuts.

## Features

- ✅ **Search by Location**: Pre-configured coordinates for CDO, Cebu, Manila
- ✅ **Date Comparisons**: Compare prices across multiple dates
- ✅ **Statistical Analysis**: Average, median, min, max prices
- ✅ **Room Type Filtering**: Entire home, private room, shared room
- ✅ **Currency**: Philippine Peso (PHP)
- ✅ **Price Reports**: Generate comprehensive pricing reports
- ✅ **Listing Details**: Deep dive into specific properties
- ✅ **Export**: Save results to JSON or text files

## Quick Start

### 1. List Available Locations
```bash
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py locations
```

Output:
```
🏝️  Available Philippines Locations:

  cagayan_de_oro       - Cagayan de Oro
  cebu                 - Cebu City
  manila               - Manila
```

### 2. Search Prices for Specific Dates
```bash
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search --location cdo --check-in 2026-03-01 --check-out 2026-03-03
```

### 3. Compare Weekend Prices
```bash
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare --location cdo --weekends 4
```

### 4. Generate Full Report
```bash
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py report --location cdo --check-in 2026-03-01 --check-out 2026-03-03 --output /root/.openclaw/workspace/crawl4ai_outputs/cdo_report.txt
```

## Commands

### `search` - Search Listings

Search Airbnb listings for a specific location and dates.

**Parameters:**
- `--location, -l` (required): Location code (`cdo`, `cebu`, `manila`)
- `--check-in, -i` (required): Check-in date (YYYY-MM-DD)
- `--check-out, -o` (required): Check-out date (YYYY-MM-DD)
- `--guests, -g` (optional): Number of guests (default: 2)
- `--room-type, -r` (optional): Filter by type (`entire`, `private`, `shared`)
- `--price-min` (optional): Minimum price in PHP
- `--price-max` (optional): Maximum price in PHP
- `--output, -f` (optional): Save results to JSON file

**Examples:**

```bash
# Basic search for 2 guests
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-03-01 -o 2026-03-03

# Search with filters
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cebu -i 2026-04-15 -o 2026-04-17 -g 4 -r entire --price-max 5000

# Save to file
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l manila -i 2026-05-01 -o 2026-05-03 --output /root/.openclaw/workspace/crawl4ai_outputs/manila_search.json
```

**Output:**
```
🔍 Searching Cagayan de Oro...
   Dates: 2026-03-01 to 2026-03-03
   Guests: 2

✅ Found 47 listings
💰 Average Price: ₱2,850.00
📊 Price Range: ₱1,200 - ₱8,500
💾 Saved to: manila_search.json
```

### `compare` - Compare Prices Across Dates

Compare pricing across multiple weekends to identify trends.

**Parameters:**
- `--location, -l` (required): Location code
- `--weekends` (optional): Number of weekends to compare (default: 4)
- `--guests, -g` (optional): Number of guests
- `--room-type, -r` (optional): Room type filter
- `--output, -f` (optional): Save comparison to JSON

**Examples:**

```bash
# Compare next 4 weekends
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cdo --weekends 4

# Compare entire homes only
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cebu -r entire --weekends 8

# Save comparison
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l manila --weekends 6 --output /root/.openclaw/workspace/crawl4ai_outputs/price_comparison.json
```

**Shows:**
- Price trends over time
- Weekend vs weekday pricing
- Seasonal variations

### `report` - Generate Comprehensive Report

Create a detailed pricing report with statistics and recommendations.

**Parameters:**
- `--location, -l` (required): Location code
- `--check-in, -i` (required): Check-in date
- `--check-out, -o` (required): Check-out date
- `--guests, -g` (optional): Number of guests
- `--room-type, -r` (optional): Room type filter
- `--output, -f` (required): Output report file

**Examples:**

```bash
# Generate report for CDO
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py report -l cdo -i 2026-03-01 -o 2026-03-03 -f /root/.openclaw/workspace/crawl4ai_outputs/cdo_march_report.txt

# Report for entire homes only
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py report -l cebu -i 2026-04-01 -o 2026-04-03 -r entire -f /root/.openclaw/workspace/crawl4ai_outputs/cebu_entire_homes.txt
```

**Sample Report Output:**
```
============================================================
🏠 AIRBNB PRICING REPORT - CAGAYAN DE ORO
============================================================
📅 Dates: 2026-03-01 to 2026-03-03
💱 Currency: PHP

📊 OVERALL STATISTICS
------------------------------------------------------------
Total Listings Analyzed: 47
Listings with Prices: 45

Average Price: ₱2,850.00
Median Price:  ₱2,500.00
Price Range:   ₱1,200 - ₱8,500
Std Deviation: ₱1,450.25

🏡 PRICES BY ROOM TYPE
------------------------------------------------------------

Entire home/apt:
  Count:   28 listings
  Average: ₱3,500.00
  Median:  ₱3,200.00
  Range:   ₱1,800 - ₱8,500

Private room:
  Count:   17 listings
  Average: ₱1,850.00
  Median:  ₱1,600.00
  Range:   ₱1,200 - ₱3,000

✨ TOP AMENITIES
------------------------------------------------------------
  • WiFi: 42 listings
  • Kitchen: 35 listings
  • AC: 38 listings
  • Parking: 28 listings
  • TV: 40 listings

📋 SAMPLE LISTINGS
------------------------------------------------------------

1. Modern Condo in CDO Downtown
   Price: ₱2,800.00/night
   Type: Entire home/apt | Rating: 4.92

2. Cozy Private Room near Mall
   Price: ₱1,500.00/night
   Type: Private room | Rating: 4.85

...

============================================================
💡 TIP: Use this data to price your property competitively!
============================================================
```

### `details` - Get Listing Details

Get detailed information about a specific Airbnb listing.

**Parameters:**
- `--url, -u` (optional): Airbnb listing URL
- `--id` (optional): Airbnb listing ID
- `--check-in, -i` (optional): Check-in date for pricing
- `--check-out, -o` (optional): Check-out date for pricing
- `--output, -f` (optional): Save to JSON file

**Examples:**

```bash
# Get details by URL
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py details -u "https://airbnb.com/rooms/123456789"

# Get details with pricing
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py details -u "https://airbnb.com/rooms/123456789" -i 2026-03-01 -o 2026-03-03

# Get details by ID
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py details --id 123456789 --output /root/.openclaw/workspace/crawl4ai_outputs/listing_details.json
```

## Emily Integration

Emily can use this tool to help analyze Airbnb pricing. Here are example commands:

### Example 1: Quick Price Check
```
User: Check Airbnb prices in CDO for March 1-3

Emily should execute:
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-03-01 -o 2026-03-03

Then report: "Found 47 listings in CDO. Average price is ₱2,850/night. 
   Range: ₱1,200 - ₱8,500. Entire homes average ₱3,500."
```

### Example 2: Weekend Comparison
```
User: Compare Airbnb prices in Cebu for the next 4 weekends

Emily should execute:
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cebu --weekends 4

Then report: "Weekend prices in Cebu range from ₱2,200-₱2,800. 
   March 14-16 is the most expensive at ₱2,800 average."
```

### Example 3: Generate Report
```
User: Create a pricing report for CDO

Emily should execute:
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py report -l cdo -i 2026-03-01 -o 2026-03-03 -f /root/.openclaw/workspace/crawl4ai_outputs/cdo_report.txt

Then report: "Report generated and saved to /root/.openclaw/workspace/crawl4ai_outputs/cdo_report.txt"
```

## Pricing Strategy Tips

### 1. Know Your Competition
```bash
# Search for properties similar to yours
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -r entire -g 4 -i 2026-03-01 -o 2026-03-03
```

**Look for:**
- Similar size (1BR, 2BR, 3BR)
- Similar location (downtown, near mall, etc.)
- Similar amenities (WiFi, AC, Kitchen)

### 2. Compare Weekends vs Weekdays
```bash
# Weekend (Friday-Sunday)
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-03-08 -o 2026-03-10

# Weekday (Monday-Wednesday)
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-03-11 -o 2026-03-13
```

### 3. Track Seasonal Trends
```bash
# Compare different months
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cdo --weekends 12 --output /root/.openclaw/workspace/crawl4ai_outputs/seasonal_trends.json
```

### 4. Price Positioning

Based on analysis, position your property:

- **Budget**: 25th percentile (below average)
- **Competitive**: 50th percentile (median price)
- **Premium**: 75th percentile (above average)
- **Luxury**: 90th percentile (top tier)

### 5. Adjust for Amenities

Properties with these amenities can charge more:
- ✅ Swimming Pool (+₱500-1,000/night)
- ✅ Free Parking (+₱300-500/night)
- ✅ Fast WiFi (+₱200-300/night)
- ✅ Full Kitchen (+₱400-600/night)
- ✅ AC in all rooms (+₱300-500/night)

## Data Export

All commands support JSON export for further analysis:

```bash
# Export search results
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-03-01 -o 2026-03-03 --output /root/.openclaw/workspace/crawl4ai_outputs/cdo_listings.json

# Export comparison
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cebu --weekends 8 --output /root/.openclaw/workspace/crawl4ai_outputs/price_trends.json

# Export listing details
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py details -u "URL" --output /root/.openclaw/workspace/crawl4ai_outputs/competitor.json
```

**Analyze with Python:**
```python
import json
import pandas as pd

# Load data
with open('/root/.openclaw/workspace/crawl4ai_outputs/cdo_listings.json') as f:
    data = json.load(f)

# Convert to DataFrame
df = pd.DataFrame(data['listings'])

# Analyze
print(df['price'].describe())
print(df.groupby('room_type')['price'].mean())
```

## Common Use Cases

### 1. Setting Initial Price
```bash
# Research market before listing
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py report -l cdo -i 2026-04-01 -o 2026-04-03 -f /root/.openclaw/workspace/crawl4ai_outputs/market_research.txt
```

### 2. Monthly Price Check
```bash
# Run monthly to stay competitive
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py compare -l cdo --weekends 4
```

### 3. Competitor Monitoring
```bash
# Track specific listings
# Save listing IDs and check periodically
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py details --id 123456789 --output /root/.openclaw/workspace/crawl4ai_outputs/competitor_123456.json
```

### 4. Peak Season Pricing
```bash
# Check prices during Sinulog, Holy Week, Christmas
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cebu -i 2026-01-17 -o 2026-01-19  # Sinulog weekend
/root/.openclaw/workspace/crawl4ai_env/bin/python /root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py search -l cdo -i 2026-04-02 -o 2026-04-04    # Holy Week
```

## File Locations

**All within /root/.openclaw/workspace/ (Emily's sandbox):**

- **Main Script**: `/root/.openclaw/workspace/skills/airbnb-crawl-skill/airbnb_pricing.py`
- **Python**: `/root/.openclaw/workspace/crawl4ai_env/bin/python`
- **Outputs**: `/root/.openclaw/workspace/crawl4ai_outputs/`
- **Documentation**: `/root/.openclaw/workspace/skills/airbnb-crawl-skill/SKILL.md`

## Troubleshooting

### "No such file or directory"
- Use absolute paths always
- Check that files exist in workspace
- Verify permissions (should be 755)

### "Permission denied"
- Files should be executable (chmod +x)
- All workspace files should be accessible

### "No module named pyairbnb"
- Python must be from crawl4ai_env: `/root/.openclaw/workspace/crawl4ai_env/bin/python`
- Don't use system Python

### Script hangs
- Airbnb searches take 10-30 seconds
- This is normal - don't interrupt

## Notes

- 📅 Dates should be in YYYY-MM-DD format
- 💱 All prices are in Philippine Peso (PHP)
- 🏝️ Coordinates are pre-configured for CDO, Cebu, Manila
- 📊 Statistics calculated from available listings
- 💾 Results can be exported to JSON for analysis
- ⚡ Uses Philippine Time (UTC+8) for timestamps
- 🔒 All files are within Emily's sandbox (/root/.openclaw/workspace/)

## Support

For issues or feature requests:
1. Check the output for error messages
2. Verify date formats and location codes
3. Review the examples in this document
4. Ensure using absolute paths
5. Ask Jarvis for help

---

**Happy Pricing! 💰🏠**

Use this tool regularly to keep your Airbnb property competitively priced in the Philippines market.
EOF
