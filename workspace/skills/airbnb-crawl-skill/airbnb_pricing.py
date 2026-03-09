#!/usr/bin/env python3
"""
Airbnb Pricing Analysis Tool for Philippines
Specialized for comparing competitor prices in Cagayan de Oro, Cebu, Manila
Currency: Philippine Peso (PHP)
"""

import pyairbnb
import json
import sys
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import statistics

# Philippines location coordinates (bounding boxes)
PH_LOCATIONS = {
    "cagayan_de_oro": {
        "name": "Cagayan de Oro",
        "ne_lat": 8.5375,
        "ne_long": 124.7500,
        "sw_lat": 8.3500,
        "sw_long": 124.5500,
        "zoom": 12
    },
    "cebu": {
        "name": "Cebu City",
        "ne_lat": 10.4500,
        "ne_long": 124.0000,
        "sw_lat": 10.2500,
        "sw_long": 123.8000,
        "zoom": 12
    },
    "manila": {
        "name": "Manila",
        "ne_lat": 14.7500,
        "ne_long": 121.1000,
        "sw_lat": 14.3500,
        "sw_long": 120.9000,
        "zoom": 12
    }
}

# Room types
ROOM_TYPES = {
    "entire": "Entire home/apt",
    "private": "Private room",
    "shared": "Shared room"
}

# Common amenities in Philippines
COMMON_AMENITIES = {
    "wifi": 4,
    "kitchen": 8,
    "ac": 5,
    "washer": 33,
    "dryer": 34,
    "parking": 9,
    "pool": 7,
    "gym": 11,
    "tv": 1,
    "fridge": 40,
    "smoke_alarm": 35,
    "fire_extinguisher": 36,
    "first_aid": 37
}


class AirbnbPricingAnalyzer:
    """Analyze Airbnb pricing for Philippines locations"""
    
    def __init__(self, currency: str = "PHP", language: str = "en"):
        self.currency = currency
        self.language = language
        self.api_key = pyairbnb.get_api_key("")
    
    def search_location(self, location_key: str, check_in: str, check_out: str,
                       guests: int = 2, room_type: str = None,
                       price_min: int = 0, price_max: int = 0,
                       amenities: List[int] = None) -> List[Dict]:
        """
        Search Airbnb listings by Philippines location
        
        Args:
            location_key: 'cagayan_de_oro', 'cebu', or 'manila'
            check_in: Check-in date (YYYY-MM-DD)
            check_out: Check-out date (YYYY-MM-DD)
            guests: Number of guests
            room_type: 'entire', 'private', or 'shared'
            price_min: Minimum price in PHP
            price_max: Maximum price in PHP (0 = no limit)
            amenities: List of amenity IDs
        """
        if location_key not in PH_LOCATIONS:
            raise ValueError(f"Unknown location: {location_key}. Use: {list(PH_LOCATIONS.keys())}")
        
        location = PH_LOCATIONS[location_key]
        
        # Convert room type
        place_type = ROOM_TYPES.get(room_type, "") if room_type else ""
        
        print(f"🔍 Searching {location['name']}...")
        print(f"   Dates: {check_in} to {check_out}")
        print(f"   Guests: {guests}")
        if place_type:
            print(f"   Room Type: {place_type}")
        
        results = pyairbnb.search_all(
            check_in=check_in,
            check_out=check_out,
            ne_lat=location['ne_lat'],
            ne_long=location['ne_long'],
            sw_lat=location['sw_lat'],
            sw_long=location['sw_long'],
            zoom_value=location['zoom'],
            price_min=price_min,
            price_max=price_max,
            place_type=place_type,
            amenities=amenities if amenities else [],
            currency=self.currency,
            language=self.language,
            proxy_url=""
        )
        
        return results
    
    def analyze_prices(self, listings: List[Dict]) -> Dict:
        """
        Analyze pricing statistics from listings
        
        Returns statistics including:
        - Count of listings
        - Average, median, min, max prices
        - Price distribution by room type
        - Top amenities
        """
        if not listings:
            return {"error": "No listings found"}
        
        # Extract prices
        prices = []
        room_type_prices = {}
        amenities_count = {}
        
        for listing in listings:
            # Handle price - could be number or dict with nested structure
            price = 0
            price_data = listing.get('price', {})
            if isinstance(price_data, dict):
                # Try unit price first (per night), then total
                if 'unit' in price_data and isinstance(price_data['unit'], dict):
                    price = price_data['unit'].get('amount', 0)
                elif 'total' in price_data and isinstance(price_data['total'], dict):
                    price = price_data['total'].get('amount', 0)
            elif isinstance(price_data, (int, float)):
                price = price_data
            elif isinstance(price_data, str):
                try:
                    price = float(price_data)
                except:
                    price = 0
            
            if isinstance(price, (int, float)) and price > 0:
                prices.append(float(price))
            
            # Track by room type - use title or structuredContent
            room_type = listing.get('title', listing.get('type', 'Unknown'))
            if room_type not in room_type_prices:
                room_type_prices[room_type] = []
            if isinstance(price, (int, float)) and price > 0:
                room_type_prices[room_type].append(float(price))
            
            # Track amenities
            for amenity in listing.get('amenities', []):
                name = amenity.get('name', 'Unknown')
                amenities_count[name] = amenities_count.get(name, 0) + 1
        
        # Calculate statistics
        stats = {
            "total_listings": len(listings),
            "listings_with_price": len(prices),
            "currency": self.currency,
            "overall": {
                "average": round(statistics.mean(prices), 2) if prices else 0,
                "median": round(statistics.median(prices), 2) if prices else 0,
                "min": min(prices) if prices else 0,
                "max": max(prices) if prices else 0,
                "std_dev": round(statistics.stdev(prices), 2) if len(prices) > 1 else 0
            },
            "by_room_type": {},
            "top_amenities": sorted(amenities_count.items(), key=lambda x: x[1], reverse=True)[:10]
        }
        
        # Calculate by room type
        for room_type, type_prices in room_type_prices.items():
            if type_prices:
                stats["by_room_type"][room_type] = {
                    "count": len(type_prices),
                    "average": round(statistics.mean(type_prices), 2),
                    "median": round(statistics.median(type_prices), 2),
                    "min": min(type_prices),
                    "max": max(type_prices)
                }
        
        return stats
    
    def compare_dates(self, location_key: str, dates: List[tuple], 
                     guests: int = 2, room_type: str = None) -> Dict:
        """
        Compare prices across multiple date ranges
        
        Args:
            location_key: Location identifier
            dates: List of (check_in, check_out) tuples
            guests: Number of guests
            room_type: Room type filter
            
        Returns:
            Comparison data for each date range
        """
        comparison = {
            "location": PH_LOCATIONS[location_key]["name"],
            "currency": self.currency,
            "comparisons": []
        }
        
        for check_in, check_out in dates:
            print(f"\n📅 Checking prices for {check_in} to {check_out}...")
            
            listings = self.search_location(
                location_key=location_key,
                check_in=check_in,
                check_out=check_out,
                guests=guests,
                room_type=room_type
            )
            
            stats = self.analyze_prices(listings)
            
            comparison["comparisons"].append({
                "check_in": check_in,
                "check_out": check_out,
                "nights": (datetime.strptime(check_out, "%Y-%m-%d") - 
                          datetime.strptime(check_in, "%Y-%m-%d")).days,
                "statistics": stats,
                "sample_listings": listings[:5]  # First 5 as examples
            })
        
        return comparison
    
    def get_listing_details(self, room_url_or_id: str, check_in: str = None, 
                           check_out: str = None) -> Dict:
        """
        Get detailed information about a specific listing
        
        Args:
            room_url_or_id: Airbnb room URL or ID
            check_in: Optional check-in date for pricing
            check_out: Optional check-out date for pricing
        """
        print(f"🔍 Getting details for: {room_url_or_id}")
        
        # Determine if it's a URL or ID
        if room_url_or_id.startswith("http"):
            data = pyairbnb.get_details(
                room_url=room_url_or_id,
                currency=self.currency,
                check_in=check_in,
                check_out=check_out,
                adults=2,
                language=self.language
            )
        else:
            data = pyairbnb.get_details(
                room_id=int(room_url_or_id),
                currency=self.currency,
                check_in=check_in,
                check_out=check_out,
                adults=2,
                language=self.language
            )
        
        return data
    
    def generate_price_report(self, location_key: str, check_in: str, 
                             check_out: str, output_file: str = None) -> str:
        """
        Generate a comprehensive price report
        
        Returns formatted report string
        """
        location_name = PH_LOCATIONS[location_key]["name"]
        
        # Search listings
        listings = self.search_location(location_key, check_in, check_out)
        stats = self.analyze_prices(listings)
        
        # Build report
        report = []
        report.append("=" * 60)
        report.append(f"🏠 AIRBNB PRICING REPORT - {location_name.upper()}")
        report.append("=" * 60)
        report.append(f"📅 Dates: {check_in} to {check_out}")
        report.append(f"💱 Currency: {self.currency}")
        report.append("")
        
        # Overall statistics
        report.append("📊 OVERALL STATISTICS")
        report.append("-" * 60)
        report.append(f"Total Listings Analyzed: {stats['total_listings']}")
        report.append(f"Listings with Prices: {stats['listings_with_price']}")
        report.append("")
        
        if stats['listings_with_price'] > 0:
            overall = stats['overall']
            report.append(f"Average Price: ₱{overall['average']:,.2f}")
            report.append(f"Median Price:  ₱{overall['median']:,.2f}")
            report.append(f"Price Range:   ₱{overall['min']:,.2f} - ₱{overall['max']:,.2f}")
            report.append(f"Std Deviation: ₱{overall['std_dev']:,.2f}")
        report.append("")
        
        # By room type
        if stats.get('by_room_type'):
            report.append("🏡 PRICES BY ROOM TYPE")
            report.append("-" * 60)
            for room_type, type_stats in stats['by_room_type'].items():
                report.append(f"\n{room_type}:")
                report.append(f"  Count:   {type_stats['count']} listings")
                report.append(f"  Average: ₱{type_stats['average']:,.2f}")
                report.append(f"  Median:  ₱{type_stats['median']:,.2f}")
                report.append(f"  Range:   ₱{type_stats['min']:,.2f} - ₱{type_stats['max']:,.2f}")
            report.append("")
        
        # Top amenities
        if stats.get('top_amenities'):
            report.append("✨ TOP AMENITIES")
            report.append("-" * 60)
            for amenity, count in stats['top_amenities'][:5]:
                report.append(f"  • {amenity}: {count} listings")
            report.append("")
        
        # Sample listings
        report.append("📋 SAMPLE LISTINGS")
        report.append("-" * 60)
        for i, listing in enumerate(listings[:5], 1):
            name = listing.get('name', 'N/A')[:50]
            price = listing.get('price', 0)
            
            # Handle price - could be number or dict
            if isinstance(price, dict):
                price = price.get('amount', 0) or price.get('total', 0) or 0
            elif isinstance(price, str):
                try:
                    price = float(price)
                except:
                    price = 0
            
            room_type = listing.get('room_type', 'N/A')
            rating = listing.get('rating', 'N/A')
            
            report.append(f"\n{i}. {name}")
            if isinstance(price, (int, float)) and price > 0:
                report.append(f"   Price: ₱{price:,.2f}/night")
            else:
                report.append("   Price: N/A")
            report.append(f"   Type: {room_type} | Rating: {rating}")
        
        report.append("")
        report.append("=" * 60)
        report.append("💡 TIP: Use this data to price your property competitively!")
        report.append("=" * 60)
        
        report_text = "\n".join(report)
        
        # Save to file if requested
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report_text)
            print(f"\n💾 Report saved to: {output_file}")
        
        return report_text


def main():
    parser = argparse.ArgumentParser(
        description='Airbnb Pricing Analyzer for Philippines',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search Cagayan de Oro for specific dates
  python airbnb_pricing.py search --location cdo --check-in 2026-03-01 --check-out 2026-03-03
  
  # Compare prices across multiple weekends
  python airbnb_pricing.py compare --location cdo --weekends 4
  
  # Generate full report
  python airbnb_pricing.py report --location cdo --check-in 2026-03-01 --check-out 2026-03-03 --output report.txt
  
  # Get listing details
  python airbnb_pricing.py details --url "https://airbnb.com/rooms/123456"
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search listings by location')
    search_parser.add_argument('--location', '-l', required=True,
                              choices=['cdo', 'cagayan_de_oro', 'cebu', 'manila'],
                              help='Location to search')
    search_parser.add_argument('--check-in', '-i', required=True,
                              help='Check-in date (YYYY-MM-DD)')
    search_parser.add_argument('--check-out', '-o', required=True,
                              help='Check-out date (YYYY-MM-DD)')
    search_parser.add_argument('--guests', '-g', type=int, default=2,
                              help='Number of guests (default: 2)')
    search_parser.add_argument('--room-type', '-r',
                              choices=['entire', 'private', 'shared'],
                              help='Room type filter')
    search_parser.add_argument('--price-min', type=int, default=0,
                              help='Minimum price in PHP')
    search_parser.add_argument('--price-max', type=int, default=0,
                              help='Maximum price in PHP (0 = no limit)')
    search_parser.add_argument('--output', '-f',
                              help='Output JSON file')
    
    # Compare command
    compare_parser = subparsers.add_parser('compare', help='Compare prices across dates')
    compare_parser.add_argument('--location', '-l', required=True,
                               choices=['cdo', 'cagayan_de_oro', 'cebu', 'manila'],
                               help='Location to search')
    compare_parser.add_argument('--weekends', type=int, default=4,
                               help='Number of upcoming weekends to compare')
    compare_parser.add_argument('--guests', '-g', type=int, default=2,
                               help='Number of guests')
    compare_parser.add_argument('--room-type', '-r',
                               choices=['entire', 'private', 'shared'],
                               help='Room type filter')
    compare_parser.add_argument('--output', '-f',
                               help='Output JSON file')
    
    # Report command
    report_parser = subparsers.add_parser('report', help='Generate comprehensive report')
    report_parser.add_argument('--location', '-l', required=True,
                              choices=['cdo', 'cagayan_de_oro', 'cebu', 'manila'],
                              help='Location to search')
    report_parser.add_argument('--check-in', '-i', required=True,
                              help='Check-in date (YYYY-MM-DD)')
    report_parser.add_argument('--check-out', '-o', required=True,
                              help='Check-out date (YYYY-MM-DD)')
    report_parser.add_argument('--guests', '-g', type=int, default=2,
                              help='Number of guests')
    report_parser.add_argument('--room-type', '-r',
                              choices=['entire', 'private', 'shared'],
                              help='Room type filter')
    report_parser.add_argument('--output', '-f', required=True,
                              help='Output report file')
    
    # Details command
    details_parser = subparsers.add_parser('details', help='Get listing details')
    details_parser.add_argument('--url', '-u',
                               help='Airbnb listing URL')
    details_parser.add_argument('--id', type=int,
                               help='Airbnb listing ID')
    details_parser.add_argument('--check-in', '-i',
                               help='Check-in date for pricing (YYYY-MM-DD)')
    details_parser.add_argument('--check-out', '-o',
                               help='Check-out date for pricing (YYYY-MM-DD)')
    details_parser.add_argument('--output', '-f',
                               help='Output JSON file')
    
    # Locations command
    subparsers.add_parser('locations', help='List available locations')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # List locations
    if args.command == 'locations':
        print("🏝️  Available Philippines Locations:\n")
        for key, loc in PH_LOCATIONS.items():
            print(f"  {key:20} - {loc['name']}")
        return
    
    # Initialize analyzer
    analyzer = AirbnbPricingAnalyzer(currency="PHP", language="en")
    
    # Map location shortcuts
    location_map = {
        'cdo': 'cagayan_de_oro',
        'cagayan_de_oro': 'cagayan_de_oro',
        'cebu': 'cebu',
        'manila': 'manila'
    }
    
    try:
        if args.command == 'search':
            location = location_map[args.location]
            listings = analyzer.search_location(
                location_key=location,
                check_in=args.check_in,
                check_out=args.check_out,
                guests=args.guests,
                room_type=args.room_type,
                price_min=args.price_min,
                price_max=args.price_max
            )
            
            stats = analyzer.analyze_prices(listings)
            
            # Print summary
            print(f"\n✅ Found {stats['total_listings']} listings")
            if stats['listings_with_price'] > 0:
                print(f"💰 Average Price: ₱{stats['overall']['average']:,.2f}")
                print(f"📊 Price Range: ₱{stats['overall']['min']:,.2f} - ₱{stats['overall']['max']:,.2f}")
            
            # Save to file
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump({
                        'listings': listings,
                        'statistics': stats
                    }, f, indent=2, ensure_ascii=False)
                print(f"💾 Saved to: {args.output}")
        
        elif args.command == 'compare':
            location = location_map[args.location]
            
            # Generate upcoming weekends
            from datetime import date
            today = date.today()
            dates = []
            
            # Find next Friday
            days_until_friday = (4 - today.weekday()) % 7
            if days_until_friday == 0:
                days_until_friday = 7
            
            next_friday = today + timedelta(days=days_until_friday)
            
            for i in range(args.weekends):
                friday = next_friday + timedelta(weeks=i)
                sunday = friday + timedelta(days=2)
                dates.append((friday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")))
            
            print(f"📅 Comparing {args.weekends} upcoming weekends...")
            comparison = analyzer.compare_dates(
                location_key=location,
                dates=dates,
                guests=args.guests,
                room_type=args.room_type
            )
            
            # Print comparison
            print("\n" + "=" * 60)
            print(f"📊 PRICE COMPARISON - {comparison['location']}")
            print("=" * 60)
            
            for comp in comparison['comparisons']:
                stats = comp['statistics']
                print(f"\n📅 {comp['check_in']} to {comp['check_out']} ({comp['nights']} nights)")
                if stats['listings_with_price'] > 0:
                    print(f"   Average: ₱{stats['overall']['average']:,.2f}")
                    print(f"   Median:  ₱{stats['overall']['median']:,.2f}")
                    print(f"   Range:   ₱{stats['overall']['min']:,.2f} - ₱{stats['overall']['max']:,.2f}")
                else:
                    print("   No price data available")
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(comparison, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Saved to: {args.output}")
        
        elif args.command == 'report':
            location = location_map[args.location]
            report = analyzer.generate_price_report(
                location_key=location,
                check_in=args.check_in,
                check_out=args.check_out
            )
            print(report)
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    f.write(report)
                print(f"\n💾 Report saved to: {args.output}")
        
        elif args.command == 'details':
            if not args.url and not args.id:
                print("❌ Error: Please provide --url or --id")
                return
            
            identifier = args.url if args.url else str(args.id)
            details = analyzer.get_listing_details(
                identifier,
                check_in=args.check_in,
                check_out=args.check_out
            )
            
            print(json.dumps(details, indent=2, ensure_ascii=False))
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(details, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Saved to: {args.output}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
